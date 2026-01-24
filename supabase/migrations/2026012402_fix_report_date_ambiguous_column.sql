-- Fix ambiguous column reference in get_daily_dog_availability function
-- This migration fixes the recursive CTE where the column alias was missing
-- causing "column reference 'report_date' is ambiguous" error

-- Drop and recreate the function with the fix
DROP FUNCTION IF EXISTS dogadopt_api.get_daily_dog_availability(DATE, DATE, UUID);

CREATE OR REPLACE FUNCTION dogadopt_api.get_daily_dog_availability(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_rescue_id UUID DEFAULT NULL
)
RETURNS TABLE (
  report_date DATE,
  available_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  -- For each date in the range, calculate how many dogs were available
  -- A dog is available on a date if:
  -- 1. It was created before or on that date
  -- 2. Its most recent status change before or on that date has status = 'available'
  
  RETURN QUERY
  WITH RECURSIVE date_series AS (
    -- Generate a series of dates from start to end
    SELECT p_start_date::DATE as report_date
    UNION ALL
    SELECT (date_series.report_date + INTERVAL '1 day')::DATE as report_date
    FROM date_series
    WHERE date_series.report_date < p_end_date
  ),
  dog_status_per_date AS (
    -- For each dog and date, find the most recent status as of that date
    -- Using LATERAL join for better performance
    SELECT 
      ds.report_date,
      d.id as dog_id,
      COALESCE(dal.status, d.status::TEXT) as status
    FROM date_series ds
    CROSS JOIN dogadopt.dogs d
    LEFT JOIN LATERAL (
      -- Get the most recent status from audit logs before or on this date
      SELECT (new_snapshot->>'status')::TEXT as status
      FROM dogadopt.dogs_audit_logs
      WHERE dog_id = d.id
        AND DATE(changed_at) <= ds.report_date
        AND new_snapshot->>'status' IS NOT NULL
      ORDER BY changed_at DESC
      LIMIT 1
    ) dal ON true
    WHERE 
      -- Dog must have been created before or on this date
      DATE(d.created_at) <= ds.report_date
      -- Optional rescue filter
      AND (p_rescue_id IS NULL OR d.rescue_id = p_rescue_id)
  )
  SELECT 
    dspd.report_date,
    COUNT(*) FILTER (WHERE dspd.status = 'available') as available_count
  FROM dog_status_per_date dspd
  GROUP BY dspd.report_date
  ORDER BY dspd.report_date ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION dogadopt_api.get_daily_dog_availability TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION dogadopt_api.get_daily_dog_availability IS 
'Returns daily count of available dogs within a date range. 
Optional rescue_id filter to show data for a specific rescue.
Defaults to last 30 days if no dates provided.
Fixed: Added explicit column alias in recursive CTE to resolve ambiguous column reference.';

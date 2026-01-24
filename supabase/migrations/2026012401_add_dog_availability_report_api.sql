-- Dog Availability Report API
-- Creates a function to get daily dog availability counts for reporting

-- =====================================================
-- DOG AVAILABILITY REPORT FUNCTION
-- =====================================================

-- Function: Get daily dog availability counts
-- This function calculates the number of available dogs per day based on the dogs table
-- and their status changes tracked in the audit logs.
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
    SELECT (report_date + INTERVAL '1 day')::DATE
    FROM date_series
    WHERE report_date < p_end_date
  ),
  dog_status_per_date AS (
    -- For each dog and date, find the most recent status as of that date
    SELECT DISTINCT ON (ds.report_date, d.id)
      ds.report_date,
      d.id as dog_id,
      COALESCE(
        (
          -- Get the most recent status from audit logs before or on this date
          SELECT (new_snapshot->>'status')::TEXT
          FROM dogadopt.dogs_audit_logs dal
          WHERE dal.dog_id = d.id
            AND DATE(dal.changed_at) <= ds.report_date
            AND dal.new_snapshot->>'status' IS NOT NULL
          ORDER BY dal.changed_at DESC
          LIMIT 1
        ),
        -- If no audit log, use current status (for dogs that haven't changed)
        d.status::TEXT
      ) as status
    FROM date_series ds
    CROSS JOIN dogadopt.dogs d
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
Defaults to last 30 days if no dates provided.';

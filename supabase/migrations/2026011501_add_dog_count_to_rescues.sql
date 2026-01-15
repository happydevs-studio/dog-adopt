-- Add dog count to rescue API
-- Updates get_rescues function to include count of available dogs for each rescue

-- Drop existing function
DROP FUNCTION IF EXISTS dogadopt_api.get_rescues();

-- Recreate with dog_count field
CREATE OR REPLACE FUNCTION dogadopt_api.get_rescues()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  region TEXT,
  website TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  created_at TIMESTAMPTZ,
  dog_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.type,
    r.region,
    r.website,
    r.latitude,
    r.longitude,
    r.created_at,
    -- Count of available dogs for this rescue using JOIN
    COALESCE(dog_counts.count, 0) AS dog_count
  FROM dogadopt.rescues r
  LEFT JOIN (
    SELECT rescue_id, COUNT(*) as count
    FROM dogadopt.dogs
    WHERE status = 'available'
    GROUP BY rescue_id
  ) dog_counts ON r.id = dog_counts.rescue_id
  ORDER BY r.name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues TO anon, authenticated;

-- Add documentation
COMMENT ON FUNCTION dogadopt_api.get_rescues IS 'Public API for accessing rescue organization data with count of available dogs.';

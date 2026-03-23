-- Fix get_rescues performance: add composite index and simplify query
--
-- The get_rescues() function includes a correlated COUNT subquery that
-- joins dogadopt.dogs filtered by status.  Without an index on
-- (rescue_id, status) PostgreSQL must do a full dogs-table scan for
-- every query, causing the endpoint to time out under production load.
--
-- Also recreates the function with an explicit statement_timeout so
-- it fails fast with a clear error rather than hanging indefinitely.

-- =========================================================================
-- 1. Composite index for the COUNT subquery inside get_rescues
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_dogs_rescue_id_status
  ON dogadopt.dogs (rescue_id, status);

COMMENT ON INDEX dogadopt.idx_dogs_rescue_id_status IS
  'Covering index for the COUNT(available dogs) subquery in dogadopt_api.get_rescues().';

-- =========================================================================
-- 2. Recreate get_rescues() with a local statement_timeout guard
--    so slow runs surface as an error instead of hanging the client.
-- =========================================================================
DROP FUNCTION IF EXISTS dogadopt_api.get_rescues();

CREATE OR REPLACE FUNCTION dogadopt_api.get_rescues()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  region TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  postcode TEXT,
  charity_number TEXT,
  contact_notes TEXT,
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
  -- Guard against runaway queries in production
  SET LOCAL statement_timeout = '10s';

  RETURN QUERY
  SELECT
    r.id,
    r.name,
    r.type,
    r.region,
    r.website,
    r.phone,
    r.email,
    r.address,
    r.postcode,
    r.charity_number,
    r.contact_notes,
    r.latitude,
    r.longitude,
    r.created_at,
    COALESCE(dog_counts.cnt, 0)::BIGINT AS dog_count
  FROM dogadopt.rescues r
  LEFT JOIN (
    SELECT rescue_id, COUNT(*) AS cnt
    FROM dogadopt.dogs
    WHERE status = 'available'::dogadopt.adoption_status
    GROUP BY rescue_id
  ) dog_counts ON r.id = dog_counts.rescue_id
  ORDER BY r.name;
END;
$$;

GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues() TO anon, authenticated;

COMMENT ON FUNCTION dogadopt_api.get_rescues IS
  'Public API for accessing rescue organisations with available-dog counts. '
  'Uses (rescue_id, status) index for fast aggregation. '
  'Enforces a 10-second statement timeout to prevent client hang.';

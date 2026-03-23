-- Fix get_rescues: move statement_timeout out of function body
--
-- PostgreSQL does not allow SET / SET LOCAL inside the body of a STABLE
-- function (error code 0A000: "SET is not allowed in a non-volatile
-- function").  The previous migration (2026032301) placed a
-- SET LOCAL statement_timeout call inside the $$ ... $$ body while
-- keeping the function marked STABLE.
--
-- The fix is to declare the timeout as a function-level SET option in
-- the CREATE FUNCTION header.  Function-level SET options are allowed
-- for any volatility and have the same scoping behaviour as SET LOCAL
-- (the setting is restored to its previous value on function exit).

-- =========================================================================
-- Recreate get_rescues() with statement_timeout as a function-level option
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
SET statement_timeout = '10s'
AS $$
BEGIN
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
  'Enforces a 10-second statement timeout (via function-level SET option) '
  'to prevent client hang.';

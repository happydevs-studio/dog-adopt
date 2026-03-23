-- Fix get_rescues: remove statement_timeout function-level option
--
-- The previous migration (2026032302) moved the statement_timeout from
-- inside the function body to the function-level SET option header.
-- While this is syntactically valid in PostgreSQL, removing it entirely
-- is safer and more portable:
--   1. Eliminates any edge-case behaviour differences between PostgreSQL
--      versions when using statement_timeout as a function-level GUC.
--   2. Avoids the function silently timing out (10 s) when the production
--      database is under load, which would surface as an unhandled error
--      rather than a graceful "no data" state.
--   3. The composite index added in 2026032301 already makes the query
--      fast enough that a statement-level guard is unnecessary.
--
-- Client-side protection is still in place: useRescues.ts races the
-- Supabase call against a 12-second JavaScript Promise timeout, so the
-- UI never hangs indefinitely even without a database-side
-- statement_timeout.

-- =========================================================================
-- Recreate get_rescues() without statement_timeout
-- =========================================================================
-- No CASCADE needed: no views, triggers, or other objects depend on this
-- function signature.
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
  'Client-side timeout (12 s) in useRescues.ts prevents indefinite hangs.';

-- Fix get_dogs performance: add index on dogs_breeds(dog_id) and rewrite
-- query to pre-aggregate breeds in a single CTE pass.
--
-- The previous get_dogs() implementation used a correlated subquery to
-- build the breeds JSONB for each dog:
--
--   COALESCE(
--     (SELECT jsonb_agg(...) FROM dogs_breeds db JOIN breeds b ...
--      WHERE db.dog_id = d.id),
--     '[]'::jsonb
--   ) AS breeds
--
-- This runs one subquery per dog row.  With 100+ dogs the function
-- executes 100+ separate index seeks, causing it to time out under
-- production load in the same way get_rescues() did before migration
-- 2026032301.
--
-- The fix pre-aggregates all breeds in a single lateral scan (CTE),
-- then left-joins the result to the dogs table — collapsing all breed
-- lookups into a single pass over dogs_breeds.

-- =========================================================================
-- 1. Index on dogs_breeds(dog_id) so the CTE aggregation is index-only
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_dogs_breeds_dog_id
  ON dogadopt.dogs_breeds (dog_id);

COMMENT ON INDEX dogadopt.idx_dogs_breeds_dog_id IS
  'Supports the single-pass CTE breed aggregation in dogadopt_api.get_dogs().';

-- =========================================================================
-- 2. Recreate get_dogs() using a CTE to pre-aggregate breeds
-- =========================================================================
DROP FUNCTION IF EXISTS dogadopt_api.get_dogs();

CREATE OR REPLACE FUNCTION dogadopt_api.get_dogs()
RETURNS TABLE (
  id UUID,
  name TEXT,
  age TEXT,
  birth_year INT,
  birth_month INT,
  birth_day INT,
  rescue_since_date DATE,
  size TEXT,
  gender TEXT,
  status TEXT,
  status_notes TEXT,
  image TEXT,
  profile_url TEXT,
  description TEXT,
  good_with_kids BOOLEAN,
  good_with_dogs BOOLEAN,
  good_with_cats BOOLEAN,
  rescue_id UUID,
  location_id UUID,
  created_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  rescue JSONB,
  breeds JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN QUERY
  WITH breed_data AS (
    -- Pre-aggregate all breeds in one pass, ordered by display_order.
    -- Uses idx_dogs_breeds_dog_id to avoid a full table scan per dog.
    SELECT
      db.dog_id,
      jsonb_agg(
        jsonb_build_object(
          'id',            b.id,
          'name',          b.name,
          'display_order', db.display_order
        ) ORDER BY db.display_order
      ) AS breeds
    FROM dogadopt.dogs_breeds db
    JOIN dogadopt.breeds b ON b.id = db.breed_id
    GROUP BY db.dog_id
  )
  SELECT
    d.id,
    d.name,
    d.age,
    d.birth_year,
    d.birth_month,
    d.birth_day,
    d.rescue_since_date,
    d.size,
    d.gender,
    d.status::TEXT,
    d.status_notes,
    d.image,
    d.profile_url,
    d.description,
    d.good_with_kids,
    d.good_with_dogs,
    d.good_with_cats,
    d.rescue_id,
    d.location_id,
    d.created_at,
    d.last_updated_at,
    jsonb_build_object(
      'id',        r.id,
      'name',      r.name,
      'region',    r.region,
      'website',   r.website,
      'latitude',  r.latitude,
      'longitude', r.longitude
    ) AS rescue,
    COALESCE(bd.breeds, '[]'::jsonb) AS breeds
  FROM dogadopt.dogs d
  LEFT JOIN dogadopt.rescues r ON r.id = d.rescue_id
  LEFT JOIN breed_data bd ON bd.dog_id = d.id
  WHERE d.status IN ('available', 'reserved', 'fostered', 'on_hold')
  ORDER BY d.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION dogadopt_api.get_dogs() TO anon, authenticated;

COMMENT ON FUNCTION dogadopt_api.get_dogs IS
  'Public API for accessing dog data. Filters to show only adoptable dogs. '
  'Uses a single-pass CTE (breed_data) to aggregate breeds, avoiding the '
  'N+1 correlated-subquery pattern that caused timeouts at scale. '
  'Relies on idx_dogs_breeds_dog_id for efficient breed aggregation.';

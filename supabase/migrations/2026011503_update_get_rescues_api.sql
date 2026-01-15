-- Update get_rescues API to include contact fields
-- Migration: 2026011503_update_get_rescues_api.sql

-- =====================================================
-- UPDATE GET_RESCUES TO INCLUDE CONTACT FIELDS
-- =====================================================

-- Drop existing functions first to allow signature changes
DROP FUNCTION IF EXISTS dogadopt_api.get_rescues();
DROP FUNCTION IF EXISTS dogadopt_api.get_rescue(UUID);

-- Function: Get all rescues (updated to include contact fields)
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

-- Function: Get single rescue by ID (updated to include contact fields)
CREATE OR REPLACE FUNCTION dogadopt_api.get_rescue(p_rescue_id UUID)
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
  created_at TIMESTAMPTZ
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
    r.created_at
  FROM dogadopt.rescues r
  WHERE r.id = p_rescue_id;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescue(UUID) TO anon, authenticated;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION dogadopt_api.get_rescues IS 'Public API for accessing rescue organization data including contact fields.';
COMMENT ON FUNCTION dogadopt_api.get_rescue IS 'Get detailed information for a single rescue by ID including contact fields.';

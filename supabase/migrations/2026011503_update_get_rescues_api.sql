-- Update get_rescues API to include contact fields
-- Migration: 2026011503_update_get_rescues_api.sql

-- =====================================================
-- UPDATE GET_RESCUES TO INCLUDE CONTACT FIELDS
-- =====================================================

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
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION dogadopt_api.get_rescues IS 'Public API for accessing rescue organization data including contact fields.';
COMMENT ON FUNCTION dogadopt_api.get_rescue IS 'Get detailed information for a single rescue by ID including contact fields.';

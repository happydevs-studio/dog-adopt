-- Add CRUD API functions for rescues
-- Migration: 2026011502_add_rescue_crud_api.sql

-- =====================================================
-- RESCUE CREATE/UPDATE/DELETE API FUNCTIONS
-- =====================================================

-- Function: Create new rescue
CREATE OR REPLACE FUNCTION dogadopt_api.create_rescue(
  p_name TEXT,
  p_type TEXT,
  p_region TEXT,
  p_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_postcode TEXT DEFAULT NULL,
  p_charity_number TEXT DEFAULT NULL,
  p_contact_notes TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
DECLARE
  v_rescue_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Insert rescue
  INSERT INTO dogadopt.rescues (
    name, type, region, website,
    phone, email, address, postcode, charity_number, contact_notes,
    latitude, longitude
  )
  VALUES (
    p_name, p_type, p_region, p_website,
    p_phone, p_email, p_address, p_postcode, p_charity_number, p_contact_notes,
    p_latitude, p_longitude
  )
  RETURNING id INTO v_rescue_id;

  RETURN v_rescue_id;
END;
$$;

-- Function: Update existing rescue
CREATE OR REPLACE FUNCTION dogadopt_api.update_rescue(
  p_rescue_id UUID,
  p_name TEXT,
  p_type TEXT,
  p_region TEXT,
  p_website TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_postcode TEXT DEFAULT NULL,
  p_charity_number TEXT DEFAULT NULL,
  p_contact_notes TEXT DEFAULT NULL,
  p_latitude DECIMAL DEFAULT NULL,
  p_longitude DECIMAL DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update rescue
  UPDATE dogadopt.rescues
  SET 
    name = p_name,
    type = p_type,
    region = p_region,
    website = p_website,
    phone = p_phone,
    email = p_email,
    address = p_address,
    postcode = p_postcode,
    charity_number = p_charity_number,
    contact_notes = p_contact_notes,
    latitude = p_latitude,
    longitude = p_longitude
  WHERE id = p_rescue_id;
END;
$$;

-- Function: Delete rescue
CREATE OR REPLACE FUNCTION dogadopt_api.delete_rescue(p_rescue_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Check if rescue has associated dogs
  IF EXISTS (SELECT 1 FROM dogadopt.dogs WHERE rescue_id = p_rescue_id) THEN
    RAISE EXCEPTION 'Cannot delete rescue with associated dogs. Please reassign or delete the dogs first.';
  END IF;

  DELETE FROM dogadopt.rescues WHERE id = p_rescue_id;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION dogadopt_api.create_rescue TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.update_rescue TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.delete_rescue TO authenticated;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION dogadopt_api.create_rescue IS 'Create a new rescue organization. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.update_rescue IS 'Update an existing rescue organization. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.delete_rescue IS 'Delete a rescue organization. Requires admin role. Prevents deletion if rescue has associated dogs.';

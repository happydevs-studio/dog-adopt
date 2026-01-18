-- Database API Layer Migration
-- Creates dogadopt_api schema with functions, procedures, and views
-- This separates the API layer (what the UI accesses) from the data layer (underlying tables)
-- Best practice: Only expose what is necessary through a clean API contract

-- =====================================================
-- CREATE API SCHEMA
-- =====================================================

CREATE SCHEMA IF NOT EXISTS dogadopt_api;
GRANT USAGE ON SCHEMA dogadopt_api TO anon, authenticated;

-- =====================================================
-- DOGS API
-- =====================================================

-- Function: Get all dogs with full relationships
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
    
    -- Rescue information (flattened for easy access)
    jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'region', r.region,
      'website', r.website,
      'latitude', r.latitude,
      'longitude', r.longitude
    ) AS rescue,
    
    -- Breeds array (sorted by display_order)
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'display_order', db.display_order
          ) ORDER BY db.display_order
        )
        FROM dogadopt.dogs_breeds db
        JOIN dogadopt.breeds b ON b.id = db.breed_id
        WHERE db.dog_id = d.id
      ),
      '[]'::jsonb
    ) AS breeds

  FROM dogadopt.dogs d
  LEFT JOIN dogadopt.rescues r ON r.id = d.rescue_id
  WHERE d.status IN ('available', 'reserved', 'fostered', 'on_hold')  -- Only show adoptable dogs to public
  ORDER BY d.created_at DESC;
END;
$$;

-- Function: Get single dog by ID
CREATE OR REPLACE FUNCTION dogadopt_api.get_dog(p_dog_id UUID)
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
    
    -- Rescue information
    jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'region', r.region,
      'website', r.website,
      'latitude', r.latitude,
      'longitude', r.longitude
    ) AS rescue,
    
    -- Breeds array
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'display_order', db.display_order
          ) ORDER BY db.display_order
        )
        FROM dogadopt.dogs_breeds db
        JOIN dogadopt.breeds b ON b.id = db.breed_id
        WHERE db.dog_id = d.id
      ),
      '[]'::jsonb
    ) AS breeds
    
  FROM dogadopt.dogs d
  LEFT JOIN dogadopt.rescues r ON r.id = d.rescue_id
  WHERE d.id = p_dog_id;
END;
$$;

-- Function: Create new dog
CREATE OR REPLACE FUNCTION dogadopt_api.create_dog(
  p_name TEXT,
  p_age TEXT,
  p_size TEXT,
  p_gender TEXT,
  p_status TEXT,
  p_rescue_id UUID,
  p_image TEXT,
  p_description TEXT,
  p_good_with_kids BOOLEAN,
  p_good_with_dogs BOOLEAN,
  p_good_with_cats BOOLEAN,
  p_breed_names TEXT[],
  p_birth_year INT DEFAULT NULL,
  p_birth_month INT DEFAULT NULL,
  p_birth_day INT DEFAULT NULL,
  p_rescue_since_date DATE DEFAULT NULL,
  p_profile_url TEXT DEFAULT NULL,
  p_status_notes TEXT DEFAULT NULL,
  p_location_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
DECLARE
  v_dog_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Insert dog
  INSERT INTO dogadopt.dogs (
    name, age, size, gender, status, rescue_id, image, description,
    good_with_kids, good_with_dogs, good_with_cats,
    birth_year, birth_month, birth_day, rescue_since_date,
    profile_url, status_notes, location_id
  )
  VALUES (
    p_name, p_age, p_size, p_gender, p_status::dogadopt.adoption_status, p_rescue_id, p_image, p_description,
    p_good_with_kids, p_good_with_dogs, p_good_with_cats,
    p_birth_year, p_birth_month, p_birth_day, p_rescue_since_date,
    p_profile_url, p_status_notes, p_location_id
  )
  RETURNING id INTO v_dog_id;

  -- Set breeds
  PERFORM dogadopt.set_dog_breeds(v_dog_id, p_breed_names);

  RETURN v_dog_id;
END;
$$;

-- Function: Update existing dog
CREATE OR REPLACE FUNCTION dogadopt_api.update_dog(
  p_dog_id UUID,
  p_name TEXT,
  p_age TEXT,
  p_size TEXT,
  p_gender TEXT,
  p_status TEXT,
  p_rescue_id UUID,
  p_image TEXT,
  p_description TEXT,
  p_good_with_kids BOOLEAN,
  p_good_with_dogs BOOLEAN,
  p_good_with_cats BOOLEAN,
  p_breed_names TEXT[],
  p_birth_year INT DEFAULT NULL,
  p_birth_month INT DEFAULT NULL,
  p_birth_day INT DEFAULT NULL,
  p_rescue_since_date DATE DEFAULT NULL,
  p_profile_url TEXT DEFAULT NULL,
  p_status_notes TEXT DEFAULT NULL,
  p_location_id UUID DEFAULT NULL
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

  -- Update dog
  UPDATE dogadopt.dogs
  SET 
    name = p_name,
    age = p_age,
    size = p_size,
    gender = p_gender,
    status = p_status::dogadopt.adoption_status,
    rescue_id = p_rescue_id,
    image = p_image,
    description = p_description,
    good_with_kids = p_good_with_kids,
    good_with_dogs = p_good_with_dogs,
    good_with_cats = p_good_with_cats,
    birth_year = p_birth_year,
    birth_month = p_birth_month,
    birth_day = p_birth_day,
    rescue_since_date = p_rescue_since_date,
    profile_url = p_profile_url,
    status_notes = p_status_notes,
    location_id = p_location_id,
    last_updated_at = now()
  WHERE id = p_dog_id;

  -- Update breeds
  PERFORM dogadopt.set_dog_breeds(p_dog_id, p_breed_names);
END;
$$;

-- Function: Delete dog
CREATE OR REPLACE FUNCTION dogadopt_api.delete_dog(p_dog_id UUID)
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

  DELETE FROM dogadopt.dogs WHERE id = p_dog_id;
END;
$$;

-- =====================================================
-- RESCUES API
-- =====================================================

-- Function: Get all rescues
CREATE OR REPLACE FUNCTION dogadopt_api.get_rescues()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  region TEXT,
  website TEXT,
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
    r.latitude,
    r.longitude,
    r.created_at
  FROM dogadopt.rescues r
  ORDER BY r.name;
END;
$$;

-- Function: Get single rescue by ID
CREATE OR REPLACE FUNCTION dogadopt_api.get_rescue(p_rescue_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  region TEXT,
  website TEXT,
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
    r.latitude,
    r.longitude,
    r.created_at
  FROM dogadopt.rescues r
  WHERE r.id = p_rescue_id;
END;
$$;

-- =====================================================
-- BREEDS API
-- =====================================================

-- Function: Get all breeds
CREATE OR REPLACE FUNCTION dogadopt_api.get_breeds()
RETURNS TABLE (
  id UUID,
  name TEXT,
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
    b.id,
    b.name,
    b.created_at
  FROM dogadopt.breeds b
  ORDER BY b.name;
END;
$$;

-- =====================================================
-- USER/AUTH API
-- =====================================================

-- Function: Check if current user has a specific role
CREATE OR REPLACE FUNCTION dogadopt_api.check_user_role(p_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN dogadopt.has_role(auth.uid(), p_role::dogadopt.app_role);
END;
$$;

-- Function: Get current user's roles
CREATE OR REPLACE FUNCTION dogadopt_api.get_user_roles()
RETURNS TABLE (role TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role::TEXT
  FROM dogadopt.user_roles ur
  WHERE ur.user_id = auth.uid();
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute on all functions
GRANT EXECUTE ON FUNCTION dogadopt_api.get_dogs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_dog TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.create_dog TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.update_dog TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.delete_dog TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescue TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_breeds TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.check_user_role TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_user_roles TO authenticated;

-- =====================================================
-- REVOKE DIRECT TABLE ACCESS (SECURITY)
-- =====================================================

-- Remove direct table access from anon users
-- Admin operations will go through API functions which check permissions
REVOKE ALL ON dogadopt.dogs FROM anon;
REVOKE ALL ON dogadopt.rescues FROM anon;
REVOKE ALL ON dogadopt.breeds FROM anon;
REVOKE ALL ON dogadopt.dogs_breeds FROM anon;
REVOKE ALL ON dogadopt.locations FROM anon;
REVOKE ALL ON dogadopt.user_roles FROM anon;

-- Authenticated users also lose direct table access
-- They must use the API layer
REVOKE ALL ON dogadopt.dogs FROM authenticated;
REVOKE ALL ON dogadopt.rescues FROM authenticated;
REVOKE ALL ON dogadopt.breeds FROM authenticated;
REVOKE ALL ON dogadopt.dogs_breeds FROM authenticated;
REVOKE ALL ON dogadopt.locations FROM authenticated;
REVOKE ALL ON dogadopt.user_roles FROM authenticated;

-- The API functions use SECURITY DEFINER to access tables with elevated privileges
-- This ensures the API layer is the only way to access data

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON SCHEMA dogadopt_api IS 'API layer for UI access. Contains only functions and procedures. Direct table access is prohibited.';
COMMENT ON FUNCTION dogadopt_api.get_dogs IS 'Public API for accessing dog data. Filters to show only adoptable dogs.';
COMMENT ON FUNCTION dogadopt_api.get_rescues IS 'Public API for accessing rescue organization data.';
COMMENT ON FUNCTION dogadopt_api.get_breeds IS 'Public API for accessing available dog breeds.';
COMMENT ON FUNCTION dogadopt_api.get_dog IS 'Get detailed information for a single dog by ID.';
COMMENT ON FUNCTION dogadopt_api.create_dog IS 'Create a new dog record. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.update_dog IS 'Update an existing dog record. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.delete_dog IS 'Delete a dog record. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.get_rescue IS 'Get detailed information for a single rescue by ID.';
COMMENT ON FUNCTION dogadopt_api.check_user_role IS 'Check if the current user has a specific role (e.g., admin).';
COMMENT ON FUNCTION dogadopt_api.get_user_roles IS 'Get all roles for the current user.';

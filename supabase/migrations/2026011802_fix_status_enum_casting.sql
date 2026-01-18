-- Fix status enum casting in create_dog and update_dog functions
-- The issue: PostgreSQL cannot directly cast TEXT to ENUM in INSERT VALUES clause
-- Solution: Cast to adoption_status enum type before using in INSERT/UPDATE

-- Drop and recreate create_dog function with proper casting
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
  v_status dogadopt.adoption_status;
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Cast status to enum type explicitly
  v_status := p_status::dogadopt.adoption_status;

  -- Insert dog
  INSERT INTO dogadopt.dogs (
    name, age, size, gender, status, rescue_id, image, description,
    good_with_kids, good_with_dogs, good_with_cats,
    birth_year, birth_month, birth_day, rescue_since_date,
    profile_url, status_notes, location_id
  )
  VALUES (
    p_name, p_age, p_size, p_gender, v_status, p_rescue_id, p_image, p_description,
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

-- Drop and recreate update_dog function with proper casting
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
DECLARE
  v_status dogadopt.adoption_status;
BEGIN
  -- Check if user is admin
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Cast status to enum type explicitly
  v_status := p_status::dogadopt.adoption_status;

  -- Update dog
  UPDATE dogadopt.dogs
  SET 
    name = p_name,
    age = p_age,
    size = p_size,
    gender = p_gender,
    status = v_status,
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

-- Add comment
COMMENT ON FUNCTION dogadopt_api.create_dog IS 'Create a new dog record with proper enum casting. Requires admin role.';
COMMENT ON FUNCTION dogadopt_api.update_dog IS 'Update an existing dog record with proper enum casting. Requires admin role.';

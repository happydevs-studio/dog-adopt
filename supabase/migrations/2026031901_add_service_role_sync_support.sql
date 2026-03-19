-- Add service-role support for backend sync scripts.
--
-- The collect-cardiff-dogs workflow runs with a service role key (no auth.uid()),
-- so the write functions need to allow service_role callers alongside admin users.
-- Also adds a get_dogs_by_rescue() function needed by sync scripts.

-- Grant service_role USAGE on dogadopt_api schema (was only granted to anon/authenticated)
GRANT USAGE ON SCHEMA dogadopt_api TO service_role;

-- Helper: check if caller is admin OR service_role
CREATE OR REPLACE FUNCTION dogadopt.is_admin_or_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt
AS $$
DECLARE
  v_claims JSONB;
BEGIN
  -- Service role key (used by backend scripts)
  -- PostgREST stores claims as JSON string in request.jwt.claims
  IF current_setting('request.jwt.claims', true) IS NOT NULL
     AND current_setting('request.jwt.claims', true) <> '' THEN
    v_claims := current_setting('request.jwt.claims', true)::jsonb;
    IF v_claims ->> 'role' = 'service_role' THEN
      RETURN TRUE;
    END IF;
  END IF;
  -- Admin user (used by UI)
  RETURN dogadopt.has_role(auth.uid(), 'admin');
END;
$$;

COMMENT ON FUNCTION dogadopt.is_admin_or_service_role IS
  'Returns TRUE if the caller is using the service_role key or is an admin user.';

-- 1. get_dogs_by_rescue: returns ALL dogs for a rescue (any status, with profile_url)
--    Used by sync scripts to detect existing dogs and mark withdrawn ones.
CREATE OR REPLACE FUNCTION dogadopt_api.get_dogs_by_rescue(p_rescue_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  profile_url TEXT,
  status TEXT,
  image TEXT,
  age TEXT,
  size TEXT,
  gender TEXT,
  description TEXT,
  good_with_kids BOOLEAN,
  good_with_dogs BOOLEAN,
  good_with_cats BOOLEAN,
  breeds JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  IF NOT dogadopt.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Admin or service role required'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.profile_url,
    d.status::TEXT,
    d.image,
    d.age,
    d.size,
    d.gender,
    d.description,
    d.good_with_kids,
    d.good_with_dogs,
    d.good_with_cats,
    COALESCE(
      jsonb_agg(
        jsonb_build_object('name', b.name)
        ORDER BY db.display_order
      ) FILTER (WHERE b.id IS NOT NULL),
      '[]'::jsonb
    ) AS breeds
  FROM dogadopt.dogs d
  LEFT JOIN dogadopt.dogs_breeds db ON db.dog_id = d.id
  LEFT JOIN dogadopt.breeds b ON b.id = db.breed_id
  WHERE d.rescue_id = p_rescue_id
  GROUP BY d.id;
END;
$$;

GRANT EXECUTE ON FUNCTION dogadopt_api.get_dogs_by_rescue(UUID) TO anon, authenticated;

COMMENT ON FUNCTION dogadopt_api.get_dogs_by_rescue IS
  'Get all dogs for a rescue (any status). Requires admin or service_role.';

-- 2. Update create_dog to allow service_role
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
  IF NOT dogadopt.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Admin or service role required'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_status := p_status::dogadopt.adoption_status;

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

  PERFORM dogadopt.set_dog_breeds(v_dog_id, p_breed_names);

  RETURN v_dog_id;
END;
$$;

-- 3. Update update_dog to allow service_role
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
  IF NOT dogadopt.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Unauthorized: Admin or service role required'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_status := p_status::dogadopt.adoption_status;

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

  PERFORM dogadopt.set_dog_breeds(p_dog_id, p_breed_names);
END;
$$;

-- 4. Update set_dog_breeds to allow service_role
CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(
  p_dog_id UUID,
  p_breed_names TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt
AS $$
DECLARE
  v_breed_name TEXT;
  v_breed_id UUID;
  v_order INT;
BEGIN
  IF NOT dogadopt.is_admin_or_service_role() THEN
    RAISE EXCEPTION 'Access denied: set_dog_breeds() requires administrator or service role privileges'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  DELETE FROM dogadopt.dogs_breeds WHERE dog_id = p_dog_id;

  v_order := 1;
  FOREACH v_breed_name IN ARRAY p_breed_names
  LOOP
    SELECT id INTO v_breed_id
    FROM dogadopt.breeds
    WHERE LOWER(name) = LOWER(TRIM(v_breed_name));

    IF v_breed_id IS NULL THEN
      INSERT INTO dogadopt.breeds (name)
      VALUES (TRIM(v_breed_name))
      RETURNING id INTO v_breed_id;
    END IF;

    INSERT INTO dogadopt.dogs_breeds (dog_id, breed_id, display_order)
    VALUES (p_dog_id, v_breed_id, v_order);

    v_order := v_order + 1;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION dogadopt_api.create_dog IS 'Create a new dog record. Requires admin role or service_role key.';
COMMENT ON FUNCTION dogadopt_api.update_dog IS 'Update an existing dog record. Requires admin role or service_role key.';
COMMENT ON FUNCTION dogadopt.set_dog_breeds IS 'Set breeds for a dog. Requires admin or service_role privileges.';

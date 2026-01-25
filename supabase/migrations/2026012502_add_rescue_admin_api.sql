-- Rescue Admins API Layer
-- Adds API functions for checking rescue admin permissions and managing rescue admins

-- =====================================================
-- RESCUE ADMIN CHECK FUNCTIONS
-- =====================================================

-- Function: Check if current user is a rescue admin for a specific rescue
CREATE OR REPLACE FUNCTION dogadopt_api.check_rescue_admin(p_rescue_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN dogadopt.is_rescue_admin(auth.uid(), p_rescue_id);
END;
$$;

COMMENT ON FUNCTION dogadopt_api.check_rescue_admin IS 'Check if the current user is an admin (global or rescue-specific) for the given rescue';

-- Function: Get rescues that the current user can administer
CREATE OR REPLACE FUNCTION dogadopt_api.get_user_rescue_admins()
RETURNS TABLE (
  rescue_id UUID,
  rescue_name TEXT,
  rescue_region TEXT,
  rescue_website TEXT,
  rescue_email TEXT,
  granted_at TIMESTAMPTZ,
  notes TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS rescue_id,
    r.name AS rescue_name,
    r.region AS rescue_region,
    r.website AS rescue_website,
    r.email AS rescue_email,
    ra.granted_at,
    ra.notes
  FROM dogadopt.rescue_admins ra
  JOIN dogadopt.rescues r ON r.id = ra.rescue_id
  WHERE ra.user_id = auth.uid()
  ORDER BY r.name;
END;
$$;

COMMENT ON FUNCTION dogadopt_api.get_user_rescue_admins IS 'Get all rescues that the current user can administer';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION dogadopt_api.check_rescue_admin TO authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_user_rescue_admins TO authenticated;

-- Fix Supabase security warning: auth.users exposed via views to authenticated role
-- This migration removes direct auth.users joins from audit views and replaces them
-- with a SECURITY DEFINER function that safely retrieves user information

-- Create a SECURITY DEFINER function to safely get user information
-- Only accessible through audit views which have admin-only RLS policies
CREATE OR REPLACE FUNCTION dogadopt.get_user_info(user_id UUID)
RETURNS TABLE (
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = auth, dogadopt
AS $$
BEGIN
  -- Verify caller is an admin (for direct function calls)
  -- Views using this function are already protected by RLS
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT WHERE FALSE;
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    u.email::TEXT,
    (u.raw_user_meta_data->>'full_name')::TEXT
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

COMMENT ON FUNCTION dogadopt.get_user_info IS 'Safely retrieves user email and name for audit logs. SECURITY DEFINER function with admin-only access check to prevent direct auth.users exposure.';

-- Recreate dogs_audit_logs_resolved view without direct auth.users join
DROP VIEW IF EXISTS dogadopt.dogs_audit_logs_resolved CASCADE;
CREATE VIEW dogadopt.dogs_audit_logs_resolved AS
SELECT 
  dal.id AS audit_id,
  dal.dog_id,
  dal.operation,
  dal.changed_at,
  dal.changed_by,
  user_info.email AS changed_by_email,
  user_info.full_name AS changed_by_name,
  
  -- Dog information from snapshot
  COALESCE(dal.new_snapshot->>'name', dal.old_snapshot->>'name') AS dog_name,
  COALESCE(dal.new_snapshot->>'age', dal.old_snapshot->>'age') AS dog_age,
  COALESCE(dal.new_snapshot->>'size', dal.old_snapshot->>'size') AS dog_size,
  COALESCE(dal.new_snapshot->>'gender', dal.old_snapshot->>'gender') AS dog_gender,
  
  -- Status tracking
  dal.old_snapshot->>'status' AS old_status,
  dal.new_snapshot->>'status' AS new_status,
  
  -- Breed tracking
  dal.old_snapshot->>'breeds_display' AS old_breeds,
  dal.new_snapshot->>'breeds_display' AS new_breeds,
  
  -- Rescue since date tracking
  dal.old_snapshot->>'rescue_since_date' AS old_rescue_since_date,
  dal.new_snapshot->>'rescue_since_date' AS new_rescue_since_date,
  
  -- Rescue and location
  COALESCE(dal.new_snapshot->>'rescue_name', dal.old_snapshot->>'rescue_name') AS rescue_name,
  COALESCE(dal.new_snapshot->>'location_name', dal.old_snapshot->>'location_name') AS location_name,
  
  -- Change details
  dal.changed_fields,
  dal.change_summary,
  
  -- Full snapshots for detailed analysis
  dal.old_snapshot,
  dal.new_snapshot,
  
  -- Metadata
  dal.metadata,
  dal.metadata->>'table' AS source_table,
  dal.metadata->>'sub_operation' AS sub_operation,
  
  dal.created_at
FROM dogadopt.dogs_audit_logs dal
LEFT JOIN LATERAL dogadopt.get_user_info(dal.changed_by) AS user_info ON true
ORDER BY dal.changed_at DESC;

COMMENT ON VIEW dogadopt.dogs_audit_logs_resolved IS 'Comprehensive resolved audit log view showing all dog and breed changes with human-readable fields. Uses SECURITY DEFINER function to safely access user info.';

-- Recreate rescues_audit_logs_resolved view without direct auth.users join
DROP VIEW IF EXISTS dogadopt.rescues_audit_logs_resolved CASCADE;
CREATE VIEW dogadopt.rescues_audit_logs_resolved AS
SELECT 
  ral.id AS audit_id,
  ral.rescue_id,
  ral.operation,
  ral.changed_at,
  ral.changed_by,
  user_info.email AS changed_by_email,
  user_info.full_name AS changed_by_name,
  
  -- Rescue information from snapshot
  COALESCE(ral.new_snapshot->>'name', ral.old_snapshot->>'name') AS rescue_name,
  COALESCE(ral.new_snapshot->>'type', ral.old_snapshot->>'type') AS rescue_type,
  COALESCE(ral.new_snapshot->>'region', ral.old_snapshot->>'region') AS rescue_region,
  
  -- Field tracking
  ral.old_snapshot->>'name' AS old_name,
  ral.new_snapshot->>'name' AS new_name,
  ral.old_snapshot->>'type' AS old_type,
  ral.new_snapshot->>'type' AS new_type,
  ral.old_snapshot->>'region' AS old_region,
  ral.new_snapshot->>'region' AS new_region,
  ral.old_snapshot->>'website' AS old_website,
  ral.new_snapshot->>'website' AS new_website,
  
  -- Change details
  ral.changed_fields,
  ral.change_summary,
  
  -- Full snapshots for detailed analysis
  ral.old_snapshot,
  ral.new_snapshot,
  
  -- Metadata
  ral.metadata,
  ral.metadata->>'table' AS source_table,
  
  ral.created_at
FROM dogadopt.rescues_audit_logs ral
LEFT JOIN LATERAL dogadopt.get_user_info(ral.changed_by) AS user_info ON true
ORDER BY ral.changed_at DESC;

COMMENT ON VIEW dogadopt.rescues_audit_logs_resolved IS 'Comprehensive resolved audit log view showing all rescue changes with human-readable fields. Uses SECURITY DEFINER function to safely access user info.';

-- Recreate locations_audit_logs_resolved view without direct auth.users join
DROP VIEW IF EXISTS dogadopt.locations_audit_logs_resolved CASCADE;
CREATE VIEW dogadopt.locations_audit_logs_resolved AS
SELECT 
  lal.id AS audit_id,
  lal.location_id,
  lal.operation,
  lal.changed_at,
  lal.changed_by,
  user_info.email AS changed_by_email,
  user_info.full_name AS changed_by_name,
  
  -- Location information from snapshot
  COALESCE(lal.new_snapshot->>'name', lal.old_snapshot->>'name') AS location_name,
  COALESCE(lal.new_snapshot->>'location_type', lal.old_snapshot->>'location_type') AS location_type,
  COALESCE(lal.new_snapshot->>'city', lal.old_snapshot->>'city') AS city,
  COALESCE(lal.new_snapshot->>'region', lal.old_snapshot->>'region') AS region,
  
  -- Rescue information
  COALESCE(lal.new_snapshot->>'rescue_name', lal.old_snapshot->>'rescue_name') AS rescue_name,
  
  -- Field tracking for key changes
  lal.old_snapshot->>'name' AS old_name,
  lal.new_snapshot->>'name' AS new_name,
  lal.old_snapshot->>'location_type' AS old_location_type,
  lal.new_snapshot->>'location_type' AS new_location_type,
  lal.old_snapshot->>'city' AS old_city,
  lal.new_snapshot->>'city' AS new_city,
  lal.old_snapshot->>'region' AS old_region,
  lal.new_snapshot->>'region' AS new_region,
  lal.old_snapshot->>'is_public' AS old_is_public,
  lal.new_snapshot->>'is_public' AS new_is_public,
  
  -- Change details
  lal.changed_fields,
  lal.change_summary,
  
  -- Full snapshots for detailed analysis
  lal.old_snapshot,
  lal.new_snapshot,
  
  -- Metadata
  lal.metadata,
  lal.metadata->>'table' AS source_table,
  
  lal.created_at
FROM dogadopt.locations_audit_logs lal
LEFT JOIN LATERAL dogadopt.get_user_info(lal.changed_by) AS user_info ON true
ORDER BY lal.changed_at DESC;

COMMENT ON VIEW dogadopt.locations_audit_logs_resolved IS 'Comprehensive resolved audit log view showing all location changes with human-readable fields. Uses SECURITY DEFINER function to safely access user info.';

-- Restore grants for the views (they were already granted to authenticated)
GRANT SELECT ON dogadopt.dogs_audit_logs_resolved TO authenticated;
GRANT SELECT ON dogadopt.rescues_audit_logs_resolved TO authenticated;
GRANT SELECT ON dogadopt.locations_audit_logs_resolved TO authenticated;

-- Grant execute permission to authenticated users
-- Function has internal admin check for security
-- Audit views using this function have RLS policies requiring admin access
GRANT EXECUTE ON FUNCTION dogadopt.get_user_info TO authenticated;

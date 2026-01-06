-- Fix SECURITY DEFINER Security Issue
-- Removes unnecessary SECURITY DEFINER from audit trigger functions and adds security checks to helper functions
-- Reference: https://supabase.com/docs/guides/database/postgres-functions#security-definer-vs-security-invoker

-- ========================================
-- PART 1: Remove SECURITY DEFINER from audit trigger functions
-- ========================================
-- Audit triggers don't need SECURITY DEFINER because:
-- 1. They run in the context of the triggering statement (user has permission to modify the base table)
-- 2. Audit log tables have RLS policies allowing inserts: WITH CHECK (true)
-- 3. Using SECURITY DEFINER unnecessarily elevates privileges and increases attack surface
-- 4. Triggers naturally execute with the privileges needed to complete the triggering operation

-- Recreate audit_dog_changes without SECURITY DEFINER
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER removed - not needed for triggers with open INSERT policy
SET search_path = dogadopt, public
AS $$
DECLARE
  old_snapshot JSONB;
  new_snapshot JSONB;
  changed_fields_array TEXT[];
  old_dog_record JSONB;
  new_dog_record JSONB;
BEGIN
  BEGIN  -- Add exception handling to prevent blocking operations
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
      new_snapshot := dogadopt.get_dog_resolved_snapshot(NEW.id);
      
      INSERT INTO dogadopt.dogs_audit_logs (
        dog_id,
        operation,
        changed_by,
        new_snapshot,
        change_summary,
        metadata
      ) VALUES (
        NEW.id,
        'INSERT',
        auth.uid(),
        new_snapshot,
        format('Dog "%s" created', NEW.name),
        jsonb_build_object('trigger', 'audit_dog_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(NEW.id);
      
      -- Build array of changed fields
      changed_fields_array := ARRAY[]::TEXT[];
      old_dog_record := old_snapshot - 'breeds_display' - 'breeds_count' - 'rescue_name' - 'rescue_region' - 'location_name' - 'location_id' - 'location_region' - 'location_enquiry_url';
      new_dog_record := new_snapshot - 'breeds_display' - 'breeds_count' - 'rescue_name' - 'rescue_region' - 'location_name' - 'location_id' - 'location_region' - 'location_enquiry_url';
      
      -- Compare each field
      SELECT array_agg(key)
      INTO changed_fields_array
      FROM jsonb_each_text(old_dog_record)
      WHERE value IS DISTINCT FROM (new_dog_record->>key);
      
      -- Check breeds changes
      IF (old_snapshot->>'breeds_display') IS DISTINCT FROM (new_snapshot->>'breeds_display') THEN
        changed_fields_array := array_append(changed_fields_array, 'breeds');
      END IF;
      
      -- Check rescue changes
      IF (old_snapshot->>'rescue_name') IS DISTINCT FROM (new_snapshot->>'rescue_name') THEN
        changed_fields_array := array_append(changed_fields_array, 'rescue');
      END IF;
      
      -- Only log if there are actual changes
      IF array_length(changed_fields_array, 1) > 0 THEN
        INSERT INTO dogadopt.dogs_audit_logs (
          dog_id,
          operation,
          changed_by,
          old_snapshot,
          new_snapshot,
          changed_fields,
          change_summary,
          metadata
        ) VALUES (
          NEW.id,
          'UPDATE',
          auth.uid(),
          old_snapshot,
          new_snapshot,
          changed_fields_array,
          format('Dog "%s" updated: %s', NEW.name, array_to_string(changed_fields_array, ', ')),
          jsonb_build_object('trigger', 'audit_dog_changes', 'table', TG_TABLE_NAME)
        );
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.id);
      
      INSERT INTO dogadopt.dogs_audit_logs (
        dog_id,
        operation,
        changed_by,
        old_snapshot,
        change_summary,
        metadata
      ) VALUES (
        OLD.id,
        'DELETE',
        auth.uid(),
        old_snapshot,
        format('Dog "%s" deleted', OLD.name),
        jsonb_build_object('trigger', 'audit_dog_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN OLD;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block the operation
      RAISE WARNING 'Audit logging failed: %', SQLERRM;
      IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;
  
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION dogadopt.audit_dog_changes IS 'Audit trigger for dogs table changes. Uses SECURITY INVOKER (default) to run with caller privileges.';

-- Recreate audit_dog_breed_changes without SECURITY DEFINER
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_breed_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER removed - not needed for triggers with open INSERT policy
SET search_path = dogadopt, public
AS $$
DECLARE
  old_snapshot JSONB;
  new_snapshot JSONB;
  changed_fields_array TEXT[];
  v_dog_id UUID;
  v_dog_name TEXT;
BEGIN
  BEGIN  -- Add exception handling to prevent blocking operations
    
    -- Determine which dog_id to use
    IF (TG_OP = 'DELETE') THEN
      v_dog_id := OLD.dog_id;
    ELSE
      v_dog_id := NEW.dog_id;
    END IF;
    
    -- Get dog name for summary
    SELECT name INTO v_dog_name FROM dogadopt.dogs WHERE id = v_dog_id;
    
    -- Get snapshots (these will show different breed lists)
    IF (TG_OP = 'DELETE') THEN
      -- For DELETE, we need both before and after states
      -- Before delete (with breed being removed)
      old_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
      -- We can't get "after" snapshot during DELETE trigger, so we note it's a removal
      new_snapshot := NULL;
    ELSIF (TG_OP = 'INSERT') THEN
      -- For INSERT, old is without the new breed, new is with it
      old_snapshot := NULL;
      new_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
    ELSE  -- UPDATE
      -- For UPDATE, we need to capture the change
      old_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
    END IF;
    
    -- Determine operation description
    changed_fields_array := ARRAY['breeds'];
    
    INSERT INTO dogadopt.dogs_audit_logs (
      dog_id,
      operation,
      changed_by,
      old_snapshot,
      new_snapshot,
      changed_fields,
      change_summary,
      metadata
    ) VALUES (
      v_dog_id,
      'UPDATE',
      auth.uid(),
      old_snapshot,
      new_snapshot,
      changed_fields_array,
      format('Dog "%s" breed association %s', 
        v_dog_name,
        CASE 
          WHEN TG_OP = 'INSERT' THEN 'added'
          WHEN TG_OP = 'DELETE' THEN 'removed'
          ELSE 'updated'
        END
      ),
      jsonb_build_object(
        'trigger', 'audit_dog_breed_changes',
        'table', TG_TABLE_NAME,
        'sub_operation', TG_OP
      )
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block the operation
      RAISE WARNING 'Breed audit logging failed: %', SQLERRM;
  END;
  
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION dogadopt.audit_dog_breed_changes IS 'Audit trigger for dog breed changes. Uses SECURITY INVOKER (default) to run with caller privileges.';

-- Recreate audit_rescue_changes without SECURITY DEFINER
CREATE OR REPLACE FUNCTION dogadopt.audit_rescue_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER removed - not needed for triggers with open INSERT policy
SET search_path = dogadopt, public
AS $$
DECLARE
  old_snapshot JSONB;
  new_snapshot JSONB;
  changed_fields_array TEXT[];
  old_rescue_record JSONB;
  new_rescue_record JSONB;
BEGIN
  BEGIN  -- Add exception handling to prevent blocking operations
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
      new_snapshot := dogadopt.get_rescue_resolved_snapshot(NEW.id);
      
      INSERT INTO dogadopt.rescues_audit_logs (
        rescue_id,
        operation,
        changed_by,
        new_snapshot,
        change_summary,
        metadata
      ) VALUES (
        NEW.id,
        'INSERT',
        auth.uid(),
        new_snapshot,
        format('Rescue "%s" created', NEW.name),
        jsonb_build_object('trigger', 'audit_rescue_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
      old_snapshot := dogadopt.get_rescue_resolved_snapshot(OLD.id);
      new_snapshot := dogadopt.get_rescue_resolved_snapshot(NEW.id);
      
      -- Build array of changed fields
      changed_fields_array := ARRAY[]::TEXT[];
      old_rescue_record := old_snapshot;
      new_rescue_record := new_snapshot;
      
      -- Compare each field
      SELECT array_agg(key)
      INTO changed_fields_array
      FROM jsonb_each_text(old_rescue_record)
      WHERE value IS DISTINCT FROM (new_rescue_record->>key);
      
      -- Only log if there are actual changes
      IF array_length(changed_fields_array, 1) > 0 THEN
        INSERT INTO dogadopt.rescues_audit_logs (
          rescue_id,
          operation,
          changed_by,
          old_snapshot,
          new_snapshot,
          changed_fields,
          change_summary,
          metadata
        ) VALUES (
          NEW.id,
          'UPDATE',
          auth.uid(),
          old_snapshot,
          new_snapshot,
          changed_fields_array,
          format('Rescue "%s" updated: %s', NEW.name, array_to_string(changed_fields_array, ', ')),
          jsonb_build_object('trigger', 'audit_rescue_changes', 'table', TG_TABLE_NAME)
        );
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      old_snapshot := dogadopt.get_rescue_resolved_snapshot(OLD.id);
      
      INSERT INTO dogadopt.rescues_audit_logs (
        rescue_id,
        operation,
        changed_by,
        old_snapshot,
        change_summary,
        metadata
      ) VALUES (
        OLD.id,
        'DELETE',
        auth.uid(),
        old_snapshot,
        format('Rescue "%s" deleted', OLD.name),
        jsonb_build_object('trigger', 'audit_rescue_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN OLD;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block the operation
      RAISE WARNING 'Rescue audit logging failed: %', SQLERRM;
      IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;
  
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION dogadopt.audit_rescue_changes IS 'Audit trigger for rescues table changes. Uses SECURITY INVOKER (default) to run with caller privileges.';

-- Recreate audit_location_changes without SECURITY DEFINER
CREATE OR REPLACE FUNCTION dogadopt.audit_location_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER removed - not needed for triggers with open INSERT policy
SET search_path = dogadopt, public
AS $$
DECLARE
  old_snapshot JSONB;
  new_snapshot JSONB;
  changed_fields_array TEXT[];
  old_location_record JSONB;
  new_location_record JSONB;
BEGIN
  BEGIN  -- Add exception handling to prevent blocking operations
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
      new_snapshot := dogadopt.get_location_resolved_snapshot(NEW.id);
      
      INSERT INTO dogadopt.locations_audit_logs (
        location_id,
        operation,
        changed_by,
        new_snapshot,
        change_summary,
        metadata
      ) VALUES (
        NEW.id,
        'INSERT',
        auth.uid(),
        new_snapshot,
        format('Location "%s" created', NEW.name),
        jsonb_build_object('trigger', 'audit_location_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF (TG_OP = 'UPDATE') THEN
      old_snapshot := dogadopt.get_location_resolved_snapshot(OLD.id);
      new_snapshot := dogadopt.get_location_resolved_snapshot(NEW.id);
      
      -- Build array of changed fields
      changed_fields_array := ARRAY[]::TEXT[];
      old_location_record := old_snapshot - 'rescue_name';  -- Exclude joined fields
      new_location_record := new_snapshot - 'rescue_name';
      
      -- Compare each field
      SELECT array_agg(key)
      INTO changed_fields_array
      FROM jsonb_each_text(old_location_record)
      WHERE value IS DISTINCT FROM (new_location_record->>key);
      
      -- Check rescue changes
      IF (old_snapshot->>'rescue_name') IS DISTINCT FROM (new_snapshot->>'rescue_name') THEN
        changed_fields_array := array_append(changed_fields_array, 'rescue');
      END IF;
      
      -- Only log if there are actual changes
      IF array_length(changed_fields_array, 1) > 0 THEN
        INSERT INTO dogadopt.locations_audit_logs (
          location_id,
          operation,
          changed_by,
          old_snapshot,
          new_snapshot,
          changed_fields,
          change_summary,
          metadata
        ) VALUES (
          NEW.id,
          'UPDATE',
          auth.uid(),
          old_snapshot,
          new_snapshot,
          changed_fields_array,
          format('Location "%s" updated: %s', NEW.name, array_to_string(changed_fields_array, ', ')),
          jsonb_build_object('trigger', 'audit_location_changes', 'table', TG_TABLE_NAME)
        );
      END IF;
      
      RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      old_snapshot := dogadopt.get_location_resolved_snapshot(OLD.id);
      
      INSERT INTO dogadopt.locations_audit_logs (
        location_id,
        operation,
        changed_by,
        old_snapshot,
        change_summary,
        metadata
      ) VALUES (
        OLD.id,
        'DELETE',
        auth.uid(),
        old_snapshot,
        format('Location "%s" deleted', OLD.name),
        jsonb_build_object('trigger', 'audit_location_changes', 'table', TG_TABLE_NAME)
      );
      
      RETURN OLD;
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block the operation
      RAISE WARNING 'Location audit logging failed: %', SQLERRM;
      IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
  END;
  
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION dogadopt.audit_location_changes IS 'Audit trigger for locations table changes. Uses SECURITY INVOKER (default) to run with caller privileges.';

-- ========================================
-- PART 2: Add security check to set_dog_breeds function
-- ========================================
-- This function has SECURITY DEFINER because it needs to INSERT/DELETE from tables with admin-only RLS policies
-- However, it MUST verify the caller is an admin to prevent privilege escalation

CREATE OR REPLACE FUNCTION dogadopt.set_dog_breeds(
  p_dog_id UUID,
  p_breed_names TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- Required to bypass RLS on breeds/dogs_breeds tables
SET search_path = dogadopt
AS $$
DECLARE
  v_breed_name TEXT;
  v_breed_id UUID;
  v_order INT;
BEGIN
  -- SECURITY CHECK: Verify caller is an admin
  -- Without this check, any authenticated user could bypass RLS policies
  IF NOT dogadopt.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Only administrators can modify dog breeds'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Delete existing breed associations
  DELETE FROM dogadopt.dogs_breeds WHERE dog_id = p_dog_id;
  
  -- Insert new breed associations
  v_order := 1;
  FOREACH v_breed_name IN ARRAY p_breed_names
  LOOP
    -- Get or create breed
    SELECT id INTO v_breed_id
    FROM dogadopt.breeds
    WHERE LOWER(name) = LOWER(TRIM(v_breed_name));
    
    IF v_breed_id IS NULL THEN
      INSERT INTO dogadopt.breeds (name)
      VALUES (TRIM(v_breed_name))
      RETURNING id INTO v_breed_id;
    END IF;
    
    -- Associate breed with dog
    INSERT INTO dogadopt.dogs_breeds (dog_id, breed_id, display_order)
    VALUES (p_dog_id, v_breed_id, v_order);
    
    v_order := v_order + 1;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION dogadopt.set_dog_breeds IS 'Helper function to set dog breeds. Uses SECURITY DEFINER with admin check to safely bypass RLS policies.';

-- ========================================
-- Security Notes
-- ========================================
-- 
-- Functions that KEEP SECURITY DEFINER (with justification):
-- 1. has_role() - Needs to check user_roles table, called by RLS policies
-- 2. handle_new_user() - Trigger on auth.users, needs to create profiles
-- 3. get_user_info() - Needs to access auth.users, has admin check
-- 4. set_dog_breeds() - Needs to bypass breeds/dogs_breeds RLS, NOW has admin check
--
-- Functions that NO LONGER use SECURITY DEFINER:
-- 1. audit_dog_changes() - Trigger with open INSERT policy on audit table
-- 2. audit_dog_breed_changes() - Trigger with open INSERT policy on audit table
-- 3. audit_rescue_changes() - Trigger with open INSERT policy on audit table
-- 4. audit_location_changes() - Trigger with open INSERT policy on audit table
--
-- Security Improvements:
-- - Reduced attack surface by removing unnecessary privilege elevation
-- - Added admin check to set_dog_breeds() to prevent privilege escalation
-- - Triggers now run with invoker privileges (more secure and predictable)
-- - Audit logging still works because audit tables have open INSERT policies

-- Unified Dog Audit System
-- Captures changes from both dogs and dog_breeds tables via dogs_complete view
-- Creates a single comprehensive resolved audit log view

-- Drop existing views that depend on dogs_resolved
DROP VIEW IF EXISTS dogadopt.dog_change_history CASCADE;
DROP VIEW IF EXISTS dogadopt.dog_timeline CASCADE;
DROP VIEW IF EXISTS dogadopt.dog_status_history CASCADE;
DROP VIEW IF EXISTS dogadopt.dog_breed_history CASCADE;
DROP VIEW IF EXISTS dogadopt.dog_audit_resolved CASCADE;

-- Add audit trigger for dog_breeds table
-- This ensures breed changes are also captured in the audit log
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_breed_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
    
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(v_dog_id);
      
      INSERT INTO dogadopt.dog_audit_log (
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
        ARRAY['breeds', 'breeds_array', 'breeds_display'],
        format('Breed added to dog "%s"', v_dog_name),
        jsonb_build_object('trigger', 'audit_dog_breed_changes', 'table', TG_TABLE_NAME, 'sub_operation', 'breed_added')
      );
      
      RETURN NEW;
    END IF;

    -- Handle UPDATE (display_order changes)
    IF (TG_OP = 'UPDATE') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.dog_id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(NEW.dog_id);
      
      -- Only log if breeds actually changed
      IF old_snapshot->>'breeds_display' IS DISTINCT FROM new_snapshot->>'breeds_display' THEN
        INSERT INTO dogadopt.dog_audit_log (
          dog_id,
          operation,
          changed_by,
          old_snapshot,
          new_snapshot,
          changed_fields,
          change_summary,
          metadata
        ) VALUES (
          NEW.dog_id,
          'UPDATE',
          auth.uid(),
          old_snapshot,
          new_snapshot,
          ARRAY['breeds', 'breeds_array', 'breeds_display'],
          format('Breed order updated for dog "%s"', v_dog_name),
          jsonb_build_object('trigger', 'audit_dog_breed_changes', 'table', TG_TABLE_NAME, 'sub_operation', 'breed_reordered')
        );
      END IF;
      
      RETURN NEW;
    END IF;

    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.dog_id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.dog_id);
      
      INSERT INTO dogadopt.dog_audit_log (
        dog_id,
        operation,
        changed_by,
        old_snapshot,
        new_snapshot,
        changed_fields,
        change_summary,
        metadata
      ) VALUES (
        OLD.dog_id,
        'UPDATE',
        auth.uid(),
        old_snapshot,
        new_snapshot,
        ARRAY['breeds', 'breeds_array', 'breeds_display'],
        format('Breed removed from dog "%s"', v_dog_name),
        jsonb_build_object('trigger', 'audit_dog_breed_changes', 'table', TG_TABLE_NAME, 'sub_operation', 'breed_removed')
      );
      
      RETURN OLD;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block the operation
    RAISE WARNING 'audit_dog_breed_changes failed: %', SQLERRM;
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END;

  RETURN NULL;
END;
$$;

-- Create trigger on dog_breeds table
CREATE TRIGGER dog_breeds_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dogadopt.dog_breeds
  FOR EACH ROW
  EXECUTE FUNCTION dogadopt.audit_dog_breed_changes();

-- Create single comprehensive resolved audit log view
CREATE OR REPLACE VIEW dogadopt.dog_audit_log_resolved AS
SELECT 
  dal.id AS audit_id,
  dal.dog_id,
  dal.operation,
  dal.changed_at,
  dal.changed_by,
  u.email AS changed_by_email,
  u.raw_user_meta_data->>'full_name' AS changed_by_name,
  
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
FROM dogadopt.dog_audit_log dal
LEFT JOIN auth.users u ON u.id = dal.changed_by
ORDER BY dal.changed_at DESC;

-- Grant permissions
GRANT SELECT ON dogadopt.dog_audit_log_resolved TO authenticated;

-- Add documentation
COMMENT ON VIEW dogadopt.dog_audit_log_resolved IS 'Comprehensive resolved audit log view showing all dog and breed changes with human-readable fields. Includes complete before/after snapshots and metadata about the source of changes.';
COMMENT ON FUNCTION dogadopt.audit_dog_breed_changes IS 'Audit trigger function for dog_breeds table. Captures breed additions, removals, and reordering.';

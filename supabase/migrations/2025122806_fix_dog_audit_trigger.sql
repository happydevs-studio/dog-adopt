-- Fix audit trigger to properly capture before/after state
-- The issue was that the AFTER trigger was querying the view after the update,
-- so both snapshots were the same

-- Drop the existing trigger
DROP TRIGGER IF EXISTS dogs_audit_trigger ON dogadopt.dogs;

-- Recreate the audit function with proper snapshot handling
CREATE OR REPLACE FUNCTION dogadopt.audit_dog_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
      
      INSERT INTO dogadopt.dog_audit_log (
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
      -- Convert OLD and NEW to JSONB with basic fields only
      old_dog_record := jsonb_build_object(
        'id', OLD.id,
        'name', OLD.name,
        'age', OLD.age,
        'size', OLD.size,
        'gender', OLD.gender,
        'image', OLD.image,
        'description', OLD.description,
        'good_with_kids', OLD.good_with_kids,
        'good_with_dogs', OLD.good_with_dogs,
        'good_with_cats', OLD.good_with_cats,
        'status', OLD.status,
        'status_notes', OLD.status_notes,
        'profile_url', OLD.profile_url,
        'rescue_id', OLD.rescue_id,
        'location_id', OLD.location_id,
        'created_at', OLD.created_at
      );
      
      new_dog_record := jsonb_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'age', NEW.age,
        'size', NEW.size,
        'gender', NEW.gender,
        'image', NEW.image,
        'description', NEW.description,
        'good_with_kids', NEW.good_with_kids,
        'good_with_dogs', NEW.good_with_dogs,
        'good_with_cats', NEW.good_with_cats,
        'status', NEW.status,
        'status_notes', NEW.status_notes,
        'profile_url', NEW.profile_url,
        'rescue_id', NEW.rescue_id,
        'location_id', NEW.location_id,
        'created_at', NEW.created_at
      );
      
      -- Get full resolved snapshots (with breeds, rescue, location)
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.id);
      new_snapshot := dogadopt.get_dog_resolved_snapshot(NEW.id);
      
      -- Merge the dog-specific changes with the resolved data
      -- Use the old_dog_record for fields that changed in the dogs table
      old_snapshot := old_snapshot || old_dog_record;
      new_snapshot := new_snapshot || new_dog_record;
      
      -- Identify changed fields
      SELECT ARRAY_AGG(key)
      INTO changed_fields_array
      FROM jsonb_each(old_snapshot)
      WHERE old_snapshot->>key IS DISTINCT FROM new_snapshot->>key;
      
      -- Only log if something actually changed
      IF changed_fields_array IS NOT NULL AND array_length(changed_fields_array, 1) > 0 THEN
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
          NEW.id,
          'UPDATE',
          auth.uid(),
          old_snapshot,
          new_snapshot,
          changed_fields_array,
          format('Dog "%s" updated (%s fields changed)', 
            NEW.name, 
            array_length(changed_fields_array, 1)
          ),
          jsonb_build_object(
            'trigger', 'audit_dog_changes',
            'table', TG_TABLE_NAME,
            'changed_count', array_length(changed_fields_array, 1)
          )
        );
      END IF;
      
      RETURN NEW;
    END IF;

    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      old_snapshot := dogadopt.get_dog_resolved_snapshot(OLD.id);
      
      INSERT INTO dogadopt.dog_audit_log (
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

  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block the operation
    RAISE WARNING 'audit_dog_changes failed: %', SQLERRM;
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END;

  RETURN NULL;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER dogs_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dogadopt.dogs
  FOR EACH ROW
  EXECUTE FUNCTION dogadopt.audit_dog_changes();

COMMENT ON FUNCTION dogadopt.audit_dog_changes IS 'Audit trigger for dogs table. Captures complete snapshots including OLD/NEW record state for proper before/after tracking.';

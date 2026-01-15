-- Fix rescue audit trigger to include all columns
-- Migration: 2026011505_fix_rescue_audit_trigger.sql
-- Issue: audit_rescue_changes() function only tracks original columns, missing new fields added in later migrations
-- This causes UPDATE operations to fail when trying to audit changes

-- =====================================================
-- UPDATE AUDIT TRIGGER FUNCTION FOR RESCUES
-- =====================================================

-- Drop and recreate the audit trigger function to include all columns
CREATE OR REPLACE FUNCTION dogadopt.audit_rescue_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dogadopt, public
AS $$
DECLARE
  old_snapshot JSONB;
  new_snapshot JSONB;
  changed_fields_array TEXT[];
BEGIN
  BEGIN  -- Add exception handling to prevent blocking operations
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
      -- Use row_to_json for consistency with UPDATE and DELETE operations
      new_snapshot := row_to_json(NEW)::jsonb;
      
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
      -- Get full resolved snapshots using row_to_json which includes ALL columns
      old_snapshot := row_to_json(OLD)::jsonb;
      new_snapshot := row_to_json(NEW)::jsonb;
      
      -- Identify changed fields
      SELECT ARRAY_AGG(key)
      INTO changed_fields_array
      FROM jsonb_each(old_snapshot)
      WHERE old_snapshot->>key IS DISTINCT FROM new_snapshot->>key;
      
      -- Only log if something actually changed
      IF changed_fields_array IS NOT NULL AND array_length(changed_fields_array, 1) > 0 THEN
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
          format('Rescue "%s" updated (%s fields changed)', 
            NEW.name, 
            array_length(changed_fields_array, 1)
          ),
          jsonb_build_object(
            'trigger', 'audit_rescue_changes',
            'table', TG_TABLE_NAME,
            'changed_count', array_length(changed_fields_array, 1)
          )
        );
      END IF;
      
      RETURN NEW;
    END IF;

    -- Handle DELETE
    IF (TG_OP = 'DELETE') THEN
      -- Build snapshot from OLD record using row_to_json which includes ALL columns
      old_snapshot := row_to_json(OLD)::jsonb;
      
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

  EXCEPTION WHEN OTHERS THEN
    -- Log error with context but don't block the operation
    RAISE WARNING 'audit_rescue_changes failed for % on rescue %: %', 
      TG_OP, 
      COALESCE(NEW.id, OLD.id), 
      SQLERRM;
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END;

  RETURN NULL;
END;
$$;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION dogadopt.audit_rescue_changes IS 'Audit trigger for rescues table - tracks all changes including contact fields and coordinates';

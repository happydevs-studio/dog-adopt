-- Fix rescue audit trigger to include all columns
-- Migration: 2026011505_fix_rescue_audit_trigger.sql
-- Issue: audit_rescue_changes() function only tracks original columns, missing new fields added in later migrations
-- This causes UPDATE operations to fail when trying to audit changes
-- Solution: Update get_rescue_resolved_snapshot() to use row_to_json which includes ALL columns automatically

-- =====================================================
-- UPDATE RESCUE SNAPSHOT FUNCTION
-- =====================================================

-- Fix get_rescue_resolved_snapshot to use row_to_json which automatically includes ALL columns
CREATE OR REPLACE FUNCTION dogadopt.get_rescue_resolved_snapshot(p_rescue_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Explicit security model, consistent with audit trigger functions
AS $$
DECLARE
  v_snapshot JSONB;
BEGIN
  -- Use row_to_json to automatically include all columns
  -- This is future-proof and doesn't require updates when new columns are added
  SELECT row_to_json(r)::jsonb
  INTO v_snapshot
  FROM dogadopt.rescues r
  WHERE r.id = p_rescue_id;
  
  RETURN v_snapshot;
END;
$$;

COMMENT ON FUNCTION dogadopt.get_rescue_resolved_snapshot IS 'Get complete rescue snapshot as JSONB. Uses row_to_json for automatic column inclusion.';

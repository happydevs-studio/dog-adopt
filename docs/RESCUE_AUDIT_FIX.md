# Rescue Audit Trigger Fix

## Issue

The `audit_rescue_changes()` trigger function was not tracking all columns in the `rescues` table, causing UPDATE operations to fail when trying to save rescue details.

## Root Cause

The `rescues` table was initially created with only basic columns:
- id
- name
- type
- region
- website
- created_at

However, subsequent migrations added additional columns:
- phone (2025123101)
- email (2025123101)
- address (2025123101)
- postcode (2025123101)
- charity_number (2025123101)
- contact_notes (2025123101)
- contact_verified_at (2025123101)
- latitude (2025123102)
- longitude (2025123102)
- coordinates_updated_at (2025123102)
- coordinates_source (2025123102)

The audit trigger function was never updated to include these new columns. This caused the trigger to fail when building the JSONB snapshots during UPDATE operations, which blocked rescue updates from succeeding.

## Solution

Migration `2026011505_fix_rescue_audit_trigger.sql` was created to update the `audit_rescue_changes()` function to include all columns when building the OLD and NEW snapshots.

### Changes Made

The trigger function now includes all columns in the JSONB snapshot building:

**For UPDATE operations:**
```sql
old_rescue_record := jsonb_build_object(
  'id', OLD.id,
  'name', OLD.name,
  'type', OLD.type,
  'region', OLD.region,
  'website', OLD.website,
  'phone', OLD.phone,
  'email', OLD.email,
  'address', OLD.address,
  'postcode', OLD.postcode,
  'charity_number', OLD.charity_number,
  'contact_notes', OLD.contact_notes,
  'contact_verified_at', OLD.contact_verified_at,
  'latitude', OLD.latitude,
  'longitude', OLD.longitude,
  'coordinates_updated_at', OLD.coordinates_updated_at,
  'coordinates_source', OLD.coordinates_source,
  'created_at', OLD.created_at
);
```

Similar updates were made for DELETE operations.

## Impact

After applying this migration:
- Rescue updates via the Admin panel will work correctly
- All rescue changes will be properly audited with complete snapshots
- The audit logs will track changes to all fields, including contact information and coordinates

## Prevention

When adding new columns to a table that has an audit trigger:
1. Always update the corresponding audit trigger function in the same migration
2. Ensure all columns are included in the JSONB snapshot building
3. Test the complete CRUD cycle (Create, Read, Update, Delete) after adding columns

## Related Files

- Migration: `/supabase/migrations/2026011505_fix_rescue_audit_trigger.sql`
- Original trigger: `/supabase/migrations/2025122802_dogadopt_rescues_and_locations.sql`
- Contact fields migration: `/supabase/migrations/2025123101_add_rescue_contact_fields.sql`
- Coordinates migration: `/supabase/migrations/2025123102_add_rescue_coordinates.sql`
- Admin UI: `/src/pages/Admin.tsx` (lines 450-514 for rescue form handling)
- API function: `/supabase/migrations/2026011502_add_rescue_crud_api.sql` (update_rescue function)

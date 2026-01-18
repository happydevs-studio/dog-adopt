# Audit System Architecture

## Overview

The audit system provides comprehensive audit logging for all changes to dogs, rescues, and locations. It captures complete before/after snapshots enabling event sourcing, time-travel queries, and detailed change tracking.

## Architecture Patterns

All audit systems follow the same architecture:
- **Audit Log Tables**: Capture all changes with complete resolved snapshots
- **Complete Data Views**: Provide comprehensive data with all relationships resolved
- **Resolved Audit Views**: Human-readable audit logs with all foreign keys resolved
- **Audit Triggers**: Automatically capture changes on INSERT, UPDATE, DELETE

## Dogs Audit System

### Components

1. **`dogs_audit_logs`** - Single audit log table capturing all dog and breed changes
2. **`dogs_complete`** - Comprehensive view with all dog data and relationships resolved
3. **`dogs_audit_logs_resolved`** - Human-readable audit log view
4. **Triggers**: `dogs_audit_trigger` and `dog_breeds_audit_trigger`

### Schema

```sql
CREATE TABLE dogadopt.dogs_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  old_snapshot JSONB,
  new_snapshot JSONB,
  changed_fields TEXT[],
  change_summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Usage Examples

```sql
-- Query all changes for a dog
SELECT * FROM dogadopt.dogs_audit_logs_resolved
WHERE dog_name = 'Bella' ORDER BY changed_at;

-- Find status changes
SELECT dog_name, old_status, new_status, changed_at
FROM dogadopt.dogs_audit_logs_resolved
WHERE old_status IS DISTINCT FROM new_status;

-- Track breed modifications
SELECT dog_name, old_breeds, new_breeds, sub_operation, changed_at
FROM dogadopt.dogs_audit_logs_resolved
WHERE old_breeds IS DISTINCT FROM new_breeds;
```

## Rescues and Locations Audit System

### Components

**Rescues:**
- **`rescues_audit_logs`** - Captures all rescue organization changes
- **`rescues_audit_logs_resolved`** - Human-readable rescue audit view
- **Trigger**: `rescues_audit_trigger`

**Locations:**
- **`locations_complete`** - Comprehensive location view with rescue information
- **`locations_audit_logs`** - Captures all location changes
- **`locations_audit_logs_resolved`** - Human-readable location audit view
- **Trigger**: `locations_audit_trigger`

### Schema

Both tables follow the same structure as dogs_audit_logs but with entity-specific IDs (rescue_id/location_id).

### Usage Examples

```sql
-- Query rescue changes
SELECT * FROM dogadopt.rescues_audit_logs_resolved
WHERE rescue_name = 'Battersea' ORDER BY changed_at;

-- Track location changes
SELECT location_name, rescue_name, old_city, new_city, changed_at
FROM dogadopt.locations_audit_logs_resolved
WHERE old_city IS DISTINCT FROM new_city;
```

## Snapshot Structure

Snapshots include complete resolved data with all foreign keys:

```json
{
  "id": "uuid",
  "name": "Record Name",
  "breeds": ["Breed 1", "Breed 2"],
  "rescue_name": "Rescue Name",
  "location_name": "Location Name",
  "created_at": "timestamp"
}
```

## Permissions

- **Public/Anon**: No access
- **Authenticated**: Read-only access to audit views
- **Admin**: Full read access to audit logs
- **System**: Insert via triggers

## Testing

```bash
./test-audit.sh                        # Test dog audit
./test-rescues-locations-audit.sh      # Test rescue/location audit
./verify-audit.sh                      # Verify completeness
```

## Implementation Details

**Trigger Behavior:**
1. **INSERT**: Creates audit entry with new_snapshot only
2. **UPDATE**: Compares OLD/NEW, includes changed_fields array
3. **DELETE**: Creates audit entry with old_snapshot only

**Exception Handling:** All triggers handle errors gracefully to prevent blocking operations.

**Performance:** Indexes on entity_id, changed_at, operation, and changed_fields (GIN).

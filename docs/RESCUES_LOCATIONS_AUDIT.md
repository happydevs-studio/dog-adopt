# Rescues and Locations Audit System

## Overview

The rescues and locations audit system provides comprehensive audit logging for all changes to rescue organizations and their location records. The system captures complete before/after snapshots of all changes, enabling event sourcing, time-travel queries, and detailed change tracking. This system follows the same architecture as the unified dog audit system.

## Architecture

### Core Components

#### Rescues Audit System

1. **Audit Log Table**: `dogadopt.rescues_audit_logs`
   - Captures all changes from the `rescues` table
   - Stores complete resolved snapshots
   - Supports INSERT, UPDATE, and DELETE operations

2. **Resolved Audit View**: `dogadopt.rescues_audit_logs_resolved`
   - Comprehensive view for all rescue audit queries
   - Human-readable audit log with all fields resolved
   - Shows before/after states for all fields
   - Includes metadata about change source and type

#### Locations Audit System

1. **Complete Data View**: `dogadopt.locations_complete`
   - Comprehensive view for all location data
   - Provides complete location data with rescue information resolved
   - Used by audit system to capture complete state

2. **Audit Log Table**: `dogadopt.locations_audit_logs`
   - Captures all changes from the `locations` table
   - Stores complete resolved snapshots including rescue information
   - Supports INSERT, UPDATE, and DELETE operations

3. **Resolved Audit View**: `dogadopt.locations_audit_logs_resolved`
   - Comprehensive view for all location audit queries
   - Human-readable audit log with all fields resolved
   - Shows before/after states for all fields
   - Includes metadata about change source and type

### Audit Triggers

1. **`rescues_audit_trigger`**: Captures changes from the `rescues` table
   - Fires AFTER INSERT, UPDATE, DELETE
   - Uses OLD and NEW record state for accurate before/after tracking
   - Enriches with complete rescue data

2. **`locations_audit_trigger`**: Captures changes from the `locations` table
   - Fires AFTER INSERT, UPDATE, DELETE
   - Uses OLD and NEW record state for accurate before/after tracking
   - Enriches with resolved data from `locations_complete` view

## Database Schema

### rescues_audit_logs Table

```sql
CREATE TABLE dogadopt.rescues_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  
  -- Complete resolved snapshots
  old_snapshot JSONB,
  new_snapshot JSONB,
  
  -- Computed change summary
  changed_fields TEXT[],
  change_summary TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### locations_audit_logs Table

```sql
CREATE TABLE dogadopt.locations_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id),
  
  -- Complete resolved snapshots
  old_snapshot JSONB,
  new_snapshot JSONB,
  
  -- Computed change summary
  changed_fields TEXT[],
  change_summary TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Available Views

#### `rescues_audit_logs_resolved`

Comprehensive audit log view for rescues with all fields resolved.

Fields include:
- **Audit Info**: audit_id, rescue_id, operation, changed_at, changed_by, changed_by_email, changed_by_name
- **Rescue Info**: rescue_name, rescue_type, rescue_region
- **Field Tracking**: old_name, new_name, old_type, new_type, old_region, new_region, old_website, new_website
- **Change Details**: changed_fields (array), change_summary
- **Complete Snapshots**: old_snapshot (JSONB), new_snapshot (JSONB)
- **Metadata**: metadata (JSONB), source_table, created_at

#### `locations_audit_logs_resolved`

Comprehensive audit log view for locations with all fields resolved.

Fields include:
- **Audit Info**: audit_id, location_id, operation, changed_at, changed_by, changed_by_email, changed_by_name
- **Location Info**: location_name, location_type, city, region
- **Rescue Info**: rescue_name
- **Field Tracking**: old_name, new_name, old_location_type, new_location_type, old_city, new_city, old_region, new_region, old_is_public, new_is_public
- **Change Details**: changed_fields (array), change_summary
- **Complete Snapshots**: old_snapshot (JSONB), new_snapshot (JSONB)
- **Metadata**: metadata (JSONB), source_table, created_at

## Usage Examples

### Query All Changes for a Rescue

```sql
SELECT *
FROM dogadopt.rescues_audit_logs_resolved
WHERE rescue_name = 'Battersea'
ORDER BY changed_at;
```

### Find All Website Changes for Rescues

```sql
SELECT rescue_name, old_website, new_website, changed_at
FROM dogadopt.rescues_audit_logs_resolved
WHERE old_website IS DISTINCT FROM new_website
ORDER BY changed_at DESC;
```

### Track Location Changes

```sql
SELECT location_name, rescue_name, old_city, new_city, changed_at
FROM dogadopt.locations_audit_logs_resolved
WHERE old_city IS DISTINCT FROM new_city
ORDER BY changed_at;
```

### View Complete Timeline for a Location

```sql
SELECT changed_at, operation, change_summary, changed_fields
FROM dogadopt.locations_audit_logs_resolved
WHERE location_name = 'Battersea - London'
ORDER BY changed_at;
```

### Find Location Type Changes

```sql
SELECT location_name, old_location_type, new_location_type, changed_at
FROM dogadopt.locations_audit_logs_resolved
WHERE old_location_type IS DISTINCT FROM new_location_type
ORDER BY changed_at DESC;
```

### Reconstruct Rescue State at a Point in Time

```sql
-- Get the most recent snapshot before a specific date
SELECT old_snapshot
FROM dogadopt.rescues_audit_logs
WHERE rescue_id = 'some-uuid'
  AND changed_at <= '2025-01-01'
ORDER BY changed_at DESC
LIMIT 1;
```

## Change Types Captured

### From `rescues` Table
- Rescue creation (INSERT)
- Property changes (UPDATE): name, type, region, website
- Rescue deletion (DELETE)

### From `locations` Table
- Location creation (INSERT)
- Property changes (UPDATE): name, location_type, address fields, city, county, postcode, region, coordinates, contact info, is_public, enquiry_url
- Location deletion (DELETE)
- Rescue association changes

## Snapshot Structure

### Rescue Snapshot

```json
{
  "id": "uuid",
  "name": "Rescue Name",
  "type": "Full",
  "region": "London",
  "website": "www.rescue.org.uk",
  "created_at": "timestamp"
}
```

### Location Snapshot

```json
{
  "id": "uuid",
  "rescue_id": "uuid",
  "name": "Location Name",
  "location_type": "centre",
  "address_line1": "123 Street",
  "address_line2": null,
  "city": "London",
  "county": "Greater London",
  "postcode": "SW1A 1AA",
  "region": "London",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "phone": "020 1234 5678",
  "email": "contact@rescue.org.uk",
  "is_public": true,
  "enquiry_url": "www.rescue.org.uk/contact",
  "created_at": "timestamp",
  "rescue_name": "Rescue Name",
  "rescue_type": "Full",
  "rescue_region": "London",
  "rescue_website": "www.rescue.org.uk"
}
```

## Implementation Details

### Audit Trigger Behavior

1. **INSERT**: Creates audit entry with new_snapshot only
2. **UPDATE**: 
   - Compares OLD and NEW record states
   - Merges with resolved view data (for locations)
   - Only logs if fields actually changed
   - Includes array of changed field names
3. **DELETE**: Creates audit entry with old_snapshot only

### Exception Handling

All audit triggers include exception handling to prevent blocking database operations if audit logging fails. Errors are logged as warnings but don't prevent the original operation from completing.

### Performance Considerations

- Indexes on `rescue_id`/`location_id`, `changed_at`, `operation`, and `changed_fields`
- GIN index on `changed_fields` array for efficient filtering
- Views use LEFT JOINs to handle missing related data gracefully

## Permissions

- **Public/Anon**: No access to audit logs
- **Authenticated**: Read-only access to all audit views
- **Admin**: Full read access to audit logs
- **System**: Can insert audit logs (via triggers)

## Testing

Use the provided test script to verify the audit system:

```bash
# Test rescues and locations audit
./test-rescues-locations-audit.sh
```

The test script will:
1. Test rescue updates and verify audit logs
2. Test location updates and verify audit logs
3. Test INSERT operations for both tables
4. Test specific field changes (like location_type)
5. Test DELETE operations and cascade behavior
6. Clean up test data

## Integration with Dog Audit System

This audit system follows the same patterns and conventions as the dog audit system:
- Same table structure and field naming
- Same trigger function patterns
- Same snapshot approach
- Same RLS policies
- Compatible resolved view structure

This consistency makes it easy to:
- Query audit logs across different entities
- Build unified audit dashboards
- Apply the same access control patterns
- Maintain and extend the audit system

## Future Enhancements

- Cross-entity audit queries (e.g., all changes related to a rescue including its locations and dogs)
- Event replay capabilities
- Audit log cleanup/archival policies
- Real-time audit event streaming
- Audit analytics dashboard
- Point-in-time state reconstruction API

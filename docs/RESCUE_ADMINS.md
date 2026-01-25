# Rescue Administrators Feature

## Overview

This feature enables rescue contacts to manage their own rescue details and dogs without requiring global admin privileges.

## Changes Made

### 1. New Table: `rescue_admins`

A junction table that links users to the rescues they can administer.

```sql
CREATE TABLE dogadopt.rescue_admins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  rescue_id UUID REFERENCES dogadopt.rescues(id),
  granted_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(user_id, rescue_id)
);
```

### 2. New Function: `is_rescue_admin()`

Helper function to check if a user is authorized to manage a specific rescue:

```sql
dogadopt.is_rescue_admin(p_user_id UUID, p_rescue_id UUID) RETURNS BOOLEAN
```

Returns `true` if the user is either:
- A global admin (has 'admin' role), OR
- A rescue admin for the specific rescue

### 3. Updated RLS Policies

#### Rescues Table
- **Global admins**: Can manage all rescues (INSERT, UPDATE, DELETE)
- **Rescue admins**: Can UPDATE their own rescue only

#### Dogs Table
- **Global admins**: Full access to all dogs (INSERT, UPDATE, DELETE)
- **Rescue admins**: Full access to their rescue's dogs only

### 4. Automatic Rescue Admin Grants

The system automatically grants rescue admin access when:

1. **During migration**: Matches existing `auth.users.email` with `rescues.email` and creates `rescue_admins` records
2. **During seed sync**: Runs the same matching logic when seed.sql is executed

## Usage

### For Rescue Contacts

1. **Sign up** with the email address that matches your rescue's contact email (the one in the `rescues.email` field)
2. **Run seed sync** or wait for automatic sync
3. You will automatically be granted rescue admin access
4. You can now:
   - Update your rescue's details (name, website, phone, email, address, etc.)
   - Add new dogs for your rescue
   - Update your rescue's dogs
   - Delete your rescue's dogs

### For Global Admins

Global admins can manually grant rescue admin access:

```sql
INSERT INTO dogadopt.rescue_admins (user_id, rescue_id, granted_by, notes)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'rescue@example.com'),
  (SELECT id FROM dogadopt.rescues WHERE name = 'Rescue Name'),
  auth.uid(),
  'Manually granted by admin'
);
```

## Security Considerations

1. **RLS Enforcement**: All access is controlled through Row Level Security policies
2. **Scope Limitation**: Rescue admins can only manage their own rescue and dogs
3. **No Deletion Rights**: Rescue admins cannot delete their rescue (only global admins can)
4. **Audit Logging**: All changes are still logged in the audit tables with the user who made the change

## Migration Details

- **File**: `supabase/migrations/2026012501_add_rescue_admins.sql`
- **Seed Update**: `supabase/seed.sql` includes automatic rescue admin sync

## Testing

To test the feature:

1. Create a test user with email matching a rescue's contact email
2. Verify the user can update the rescue details
3. Verify the user can add/edit/delete dogs for that rescue
4. Verify the user cannot manage other rescues or their dogs
5. Verify global admins still have full access

## Future Enhancements

Possible improvements for the future:
- Web UI for managing rescue admins
- Email notifications when rescue admin access is granted
- Ability for rescue admins to invite additional team members
- Activity logs specific to rescue admin actions

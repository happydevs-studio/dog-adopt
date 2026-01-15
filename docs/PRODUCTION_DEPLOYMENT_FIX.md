# Production Deployment Fix for Smoke Test Failures

## Issue Summary

The smoke tests are failing because the production Supabase database is missing the `dogadopt_api` schema and its functions (`get_dogs`, `get_rescues`, etc.). 

Recent code changes (PR #142) updated the frontend to use these API layer functions instead of direct table access, but the database migrations were never applied to production.

## Temporary Fix Applied

**Code Changes:** 
A fallback mechanism has been added to `src/hooks/useDogs.ts` and `src/hooks/useRescues.ts`:

1. **Try API layer first** - Attempts to call `dogadopt_api.get_dogs()` and `dogadopt_api.get_rescues()`
2. **Fallback to direct table access** - If API functions don't exist (error code 42883), falls back to direct table queries
3. **Log warnings** - Console warnings indicate when fallback is used

This allows the production site to continue working even without the API layer, but you should still apply the permanent fix below.

## Permanent Fix Required

To properly fix this issue, the database migrations must be applied to the production Supabase project.

### Prerequisites

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Have production Supabase project credentials ready:
   - Project ID (from Supabase Dashboard → Settings → General)
   - Database password (from Supabase Dashboard → Settings → Database)

### Step-by-Step Fix

#### Step 1: Link to Production Project

```bash
# Navigate to project directory
cd /path/to/dogadopt.github.io

# Link to your production Supabase project
supabase link --project-ref YOUR_PROJECT_ID

# You'll be prompted for your database password
```

#### Step 2: Apply Migrations

```bash
# Push all pending migrations to production
supabase db push

# This will apply the following migrations:
# - 2026011201_create_api_layer.sql (Creates dogadopt_api schema and functions)
# - Any other pending migrations
```

#### Step 3: Verify Migrations Applied

Log into Supabase SQL Editor and run:

```sql
-- Check if the dogadopt_api schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'dogadopt_api';

-- Should return: dogadopt_api

-- Check if get_dogs function exists
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_schema = 'dogadopt_api' 
  AND routine_name = 'get_dogs';

-- Should return: get_dogs | dogadopt_api

-- Check if get_rescues function exists
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_schema = 'dogadopt_api' 
  AND routine_name = 'get_rescues';

-- Should return: get_rescues | dogadopt_api
```

#### Step 4: Configure API Schema Exposure

The `dogadopt_api` schema must be exposed in Supabase's API configuration:

1. Go to **Supabase Dashboard → Settings → API**
2. Scroll to **"PostgREST Settings"** section
3. Find **"Exposed schemas"** setting
4. Ensure it includes both `dogadopt` and `dogadopt_api`
5. The value should be: `dogadopt, dogadopt_api`
6. Click **"Save"**
7. **Restart the Supabase project** if prompted (Settings → General → Restart project)

> **Note:** Schema changes require a project restart to take effect.

#### Step 5: Verify Function Permissions

Run in Supabase SQL Editor:

```sql
-- Grant execute permissions on API functions
GRANT EXECUTE ON FUNCTION dogadopt_api.get_dogs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_rescues TO anon, authenticated;
GRANT EXECUTE ON FUNCTION dogadopt_api.get_breeds TO anon, authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA dogadopt_api TO anon, authenticated;
```

> **Note:** These grants should already be in the migration file, but run them manually if needed.

#### Step 6: Test Production Site

1. Wait 2-5 minutes for changes to propagate
2. Visit https://www.dogadopt.co.uk
3. Open browser DevTools → Console
4. Check for:
   - ✅ No "function does not exist" errors
   - ✅ No "API layer not available" warnings
   - ✅ Dogs and rescues load successfully

#### Step 7: Re-run Smoke Tests

Trigger the smoke tests manually to verify the fix:

1. Go to [GitHub Actions](https://github.com/dogadopt/dogadopt.github.io/actions/workflows/smoke-tests.yml)
2. Click **"Run workflow"**
3. Select the `main` branch
4. Click **"Run workflow"**
5. Wait for tests to complete (~2-3 minutes)
6. All tests should pass ✅

## Verification Checklist

After applying the fix, verify:

- [ ] Migrations applied successfully (Step 3)
- [ ] `dogadopt_api` schema visible in Supabase Dashboard → Database → Schema
- [ ] API schema exposed in PostgREST settings (Step 4)
- [ ] Project restarted (if schema settings changed)
- [ ] Function permissions granted (Step 5)
- [ ] Production site loads without console errors (Step 6)
- [ ] Console shows NO "fallback" warnings
- [ ] Smoke tests pass (Step 7)

## What the API Layer Does

The `dogadopt_api` schema provides:

1. **Abstraction** - Separates public API from internal schema
2. **Performance** - Pre-joins related data (rescues, breeds) in single query
3. **Security** - Fine-grained access control via function permissions
4. **Consistency** - Ensures data returned in consistent format
5. **Flexibility** - Can modify underlying tables without breaking API

### Functions Available

| Function | Purpose | Returns |
|----------|---------|---------|
| `dogadopt_api.get_dogs()` | Get all dogs with rescue and breed info | Dogs with JSONB rescue/breeds |
| `dogadopt_api.get_rescues()` | Get all rescues with dog counts | Rescues with available dog count |
| `dogadopt_api.get_breeds()` | Get all dog breeds | Breed list |

## Troubleshooting

### Error: "function does not exist"

**Symptom:** Console errors showing `function "dogadopt_api.get_dogs" does not exist`

**Solution:**
1. Verify migrations were applied (Step 3)
2. Check if schema is exposed in API settings (Step 4)
3. Restart the Supabase project

### Error: "permission denied for schema"

**Symptom:** Console errors showing `permission denied for schema dogadopt_api`

**Solution:**
1. Grant schema usage: `GRANT USAGE ON SCHEMA dogadopt_api TO anon, authenticated;`
2. Grant function execution permissions (Step 5)

### Site Still Shows Fallback Warnings

**Symptom:** Console shows "API layer not available, falling back to direct table access"

**Solution:**
1. Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Verify API schema is exposed and project was restarted
4. Check browser DevTools → Network tab for 400 errors on RPC calls

### Smoke Tests Still Failing

**Symptom:** Smoke tests pass locally but fail on production

**Solution:**
1. Check Supabase status: https://status.supabase.com
2. Review application logs: Supabase Dashboard → Logs → API
3. Check RLS policies aren't blocking anonymous access
4. Verify data exists in tables (Step 3 verification queries)

## Alternative: Manual SQL Migration

If `supabase db push` doesn't work, you can manually run the migration SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Open the migration file: `supabase/migrations/2026011201_create_api_layer.sql`
3. Copy the entire SQL content
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify no errors
7. Complete Steps 4-7 above

## Related Documentation

- [Database API Layer](DATABASE_API_LAYER.md) - Architecture details
- [Smoke Test Troubleshooting](SMOKE_TEST_TROUBLESHOOTING.md) - Test failure guide
- [Post-Merge Setup](POST_MERGE_SETUP.md) - General deployment guide

## Questions?

If you encounter issues not covered here:

1. Check recent GitHub Issues with label `smoke-test-failure`
2. Review Supabase Dashboard → Logs for error details
3. Check `#tech-support` channel (if you have team chat)
4. Create a new GitHub Issue with:
   - Error messages from console
   - Screenshots of Supabase settings
   - Steps you've already tried

---

**Last Updated:** 2026-01-15  
**Migration Required:** `2026011201_create_api_layer.sql`  
**Affects:** Production site (`www.dogadopt.co.uk`)

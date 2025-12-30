# Quick Reference: Updating Rescues Data

## Overview
This guide provides a quick reference for updating rescue organization data.

## Update Process

### Step 1: Edit the CSV File
Edit `supabase/data/rescues.csv` with your changes:

```csv
name,type,region,website
New Rescue Organization,Full,South East England,www.newrescue.org.uk
```

### Step 2: Update the SQL Script
Edit `supabase/post-deploy/sync-rescues-locations.sql` and add your new rescue to the INSERT VALUES list:

```sql
INSERT INTO temp_rescues (name, type, region, website) VALUES
-- ... existing entries ...
('New Rescue Organization', 'Full', 'South East England', 'www.newrescue.org.uk');
```

### Step 3: Test Locally (Optional but Recommended)
```bash
# Ensure Supabase is running
npm run supabase:start

# Run the sync script
npm run sync-rescues

# Check the results
docker exec -it supabase_db_dog-adopt psql -U postgres -d postgres -c "SELECT name, region FROM dogadopt.rescues ORDER BY name;"
```

### Step 4: Commit and Push
```bash
git add supabase/data/rescues.csv supabase/post-deploy/sync-rescues-locations.sql
git commit -m "Update rescues data - add New Rescue Organization"
git push
```

### Step 5: Verify Deployment
After pushing to main, the GitHub Actions workflow will:
1. Run CI checks (lint, typecheck, build)
2. Apply database migrations
3. **Run the sync script automatically**
4. Deploy to GitHub Pages

Check the Actions tab to verify successful deployment.

## Production Manual Sync (If Needed)

If you need to sync data to production manually:

```bash
# Set environment variables (get these from Supabase dashboard)
export SUPABASE_PROJECT_REF=your-project-ref
export SUPABASE_ACCESS_TOKEN=your-access-token

# Run production sync
npm run sync-rescues:prod
```

## What the Script Does

1. **Creates temporary table** with new data
2. **Performs UPSERT operation:**
   - Inserts new rescues that don't exist
   - Updates existing rescues ONLY if data has changed
   - Leaves unchanged rescues alone (prevents audit log spam)
3. **Creates default locations** for any rescue without a location
4. **Reports summary** of total rescues and locations

## Example: Updating Website URL

If a rescue changes their website:

**Before:**
```csv
Hope Rescue,Full,South Wales,www.old-website.org.uk
```

**After:**
```csv
Hope Rescue,Full,South Wales,www.hoperescue.org.uk
```

When you run the sync:
- ✅ Only the `website` field is updated
- ✅ An audit log entry is created with the change
- ✅ No other rescues are affected

## Example: Adding a New Rescue

**CSV:**
```csv
New Haven Rescue,Full,Yorkshire & The Humber,www.newhavenrescue.co.uk
```

**SQL:**
```sql
('New Haven Rescue', 'Full', 'Yorkshire & The Humber', 'www.newhavenrescue.co.uk'),
```

When you run the sync:
- ✅ New rescue is inserted with a unique ID
- ✅ A default location is created automatically
- ✅ An audit log entry records the creation

## Viewing Audit Logs

Check what changed after a sync:

```sql
-- View recent changes
SELECT 
  audit_id,
  rescue_name,
  operation,
  changed_at,
  changed_by_email,
  change_summary,
  changed_fields
FROM dogadopt.rescues_audit_logs_resolved
ORDER BY changed_at DESC
LIMIT 20;

-- View specific rescue history
SELECT 
  operation,
  changed_at,
  old_name,
  new_name,
  old_website,
  new_website,
  change_summary
FROM dogadopt.rescues_audit_logs_resolved
WHERE rescue_name = 'Hope Rescue'
ORDER BY changed_at DESC;
```

## Common Scenarios

### Rescue Changed Region
```csv
Before: Some Rescue,Full,Old Region,www.example.com
After:  Some Rescue,Full,New Region,www.example.com
```
Result: Only `region` field updated, audit log created.

### Rescue Changed Name (Rare)
This is tricky because the `name` field is the unique key. Best approach:
1. Add the new name as a new rescue
2. Mark the old rescue as inactive (or manually delete)
3. Update any dogs associated with the old rescue to use the new one

### Rescue Closed (No Longer Active)
Instead of deleting, consider:
1. Change type to "Inactive" or add a status field
2. Or manually delete via admin panel (audit log will track deletion)

## Troubleshooting

### "Duplicate key value violates unique constraint"
- A rescue with that name already exists
- Check for typos or slight name variations
- View existing rescues: `SELECT name FROM dogadopt.rescues ORDER BY name;`

### Changes Not Appearing
- Verify the SQL script has the updated data
- Check GitHub Actions logs for errors
- Run `npm run sync-rescues` locally to test

### Audit Logs Show No Changes
- This is expected if data hasn't actually changed
- The script only updates when fields differ
- Verify your changes were saved in both CSV and SQL files

## Best Practices

1. ✅ **Test locally first** - Always run `npm run sync-rescues` before pushing
2. ✅ **Keep CSV in sync** - Update both CSV and SQL files together
3. ✅ **Commit with clear messages** - Describe what changed
4. ✅ **Check audit logs** - Verify changes after syncing
5. ✅ **Backup before bulk updates** - Export current data first

## Resources

- Full documentation: `supabase/data/README.md`
- CI/CD docs: `docs/CI_CD_SETUP.md`
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Sync script: `scripts/sync-rescues-locations.js`

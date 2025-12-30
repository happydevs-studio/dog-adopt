# Rescue Data Update - Quick Reference

## What Changed
Replaced 108 generic ADCH member rescues with 61 specific rescue centers that have:
- Exact GPS coordinates (latitude/longitude)
- Direct links to their dog adoption pages
- Accurate regional classifications
- 62 physical locations

## How to Apply

### Fresh Installation
```bash
# Start Supabase
npm run supabase:start

# Migrations will apply automatically
# Migration 20251230210854 will replace rescue data
```

### Existing Installation
```bash
# Reset database to apply all migrations from scratch
npm run supabase:reset

# Or manually apply the specific migration
supabase db push
```

## Verification

After migration, run the verification script:
```bash
./scripts/verify-rescue-data.sh
```

Expected results:
- ✅ 61 rescues
- ✅ 62 locations
- ✅ All rescues have websites
- ✅ All locations have GPS coordinates

## Regional Distribution
- England: 40 rescues
- Wales: 9 rescues
- Scotland: 5 rescues
- Northern Ireland: 4 rescues
- Ireland: 2 rescues
- Isle of Man: 1 rescue

## Files
- `supabase/migrations/20251230210854_update_rescues_and_locations_data.sql` - Main migration
- `scripts/generate-rescue-migration.js` - Generator script (can be re-run if source data changes)
- `scripts/verify-rescue-data.sh` - Verification script
- `docs/RESCUE_DATA_UPDATE.md` - Detailed documentation

## Source Data
https://github.com/dogadopt/dogadopt.github.io/blob/main/rescues.json

## Notes
- This is a complete replacement, not an update
- Old and new datasets have zero overlap
- Safe for fresh installations (no seed dog data exists)
- Foreign key constraints are handled automatically
- All changes are tracked in audit logs

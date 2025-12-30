# Rescue Coordinate Update

## Overview
Added GPS coordinates (latitude/longitude) to 9 existing rescue locations in `supabase/seed.sql`.

## What Changed

Updated the `INSERT INTO dogadopt.locations` statement in `seed.sql` to include `latitude` and `longitude` columns with coordinates for matched rescues.

## Matched Rescues (9)

The following existing rescues now have GPS coordinates:

1. **Benvardin Animal Rescue Kennels** (Northern Ireland)
   - Lat: 55.1423832946954, Lng: -6.5083271272516035

2. **Boxer Welfare Scotland** (Aberdeen & Grampian)
   - Lat: 57.436291, Lng: -1.82941

3. **Causeway Coast Dog Rescue** (Northern Ireland)
   - Lat: 55.13260582557945, Lng: -6.6658603369137195

4. **Dogs Trust Ireland** (Ireland)
   - Lat: 53.4141094466885, Lng: -6.319405314133566

5. **Freshfields Animal Rescue** (North West England)
   - Lat: 53.293873, Lng: -3.051279

6. **Grovehill Animal Trust** (Northern Ireland)
   - Lat: 54.60724252744901, Lng: -7.3045544503179

7. **Hope Rescue** (South Wales)
   - Lat: 51.5683353, Lng: -3.4233855

8. **Mid Antrim Animal Sanctuary** (Northern Ireland)
   - Lat: 54.62641683950719, Lng: -5.677465333766653

9. **North Clwyd Animal Rescue** (North Wales)
   - Lat: 53.176625, Lng: -3.142241

## What Stayed the Same

- All 101 existing rescues preserved
- No new rescues added
- Only coordinates added to locations for matched rescues
- 92 rescues have no matching coordinate data (remain as-is with NULL coordinates)

## Files Changed

- `supabase/seed.sql` - Updated location INSERT to include lat/lon
- `scripts/update-seed-coordinates.js` - Script to regenerate coordinates (can be re-run if source data changes)

## Source Data

https://github.com/dogadopt/dogadopt.github.io/blob/main/rescues.json

## How to Regenerate

If the source data changes:

```bash
# Download latest data
curl -s https://raw.githubusercontent.com/dogadopt/dogadopt.github.io/main/rescues.json -o /tmp/rescues.json

# Update seed.sql with coordinates
node scripts/update-seed-coordinates.js
```

## Technical Details

- Uses CASE statements to map rescue names to coordinates
- Coordinates only added for rescues that could be matched with source data
- Matching uses fuzzy name matching (70% similarity threshold)
- All other rescues get NULL for latitude/longitude (which is fine - they can be added later)

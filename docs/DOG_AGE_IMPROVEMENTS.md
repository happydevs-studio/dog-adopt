# Dog Age Improvements

## Overview

The system now supports flexible birth date tracking for dogs with automatic age category calculation. This allows rescue organizations to provide as much or as little birth date information as they have available.

## Features

### Flexible Birth Date Storage

Dogs can now have birth dates stored with varying levels of precision:

1. **Year only** - If only the birth year is known
2. **Year + Month** - If birth year and month are known
3. **Full date** - If exact birth date (year, month, day) is known

### Automatic Age Categorization

When birth date information is provided, the system automatically calculates the dog's age category:

- **Puppy**: 6 months or younger
- **Young**: 6 months to 2 years
- **Adult**: 2 to 8 years
- **Senior**: 8+ years

The calculation uses the current date to determine the dog's age, so the category updates automatically as time passes.

### Backward Compatibility

The system maintains full backward compatibility:

- Dogs without birth date information continue to use manually entered age categories
- The existing `age` field is preserved and used as a fallback
- Filtering and display logic works with both computed and manual age categories

## Database Schema

### New Columns

```sql
birth_year INTEGER   -- Birth year (required if any birth date provided)
birth_month INTEGER  -- Birth month 1-12 (optional, requires birth_year)
birth_day INTEGER    -- Birth day 1-31 (optional, requires birth_year and birth_month)
```

### Constraints

- `birth_year`: Must be between 1900 and current year + 1
- `birth_month`: Must be between 1 and 12, requires `birth_year` to be set
- `birth_day`: Must be between 1 and 31, requires both `birth_year` and `birth_month` to be set

### Functions

#### `calculate_age_category(birth_year, birth_month, birth_day)`

PostgreSQL function that calculates the age category from a birth date. Uses the current date to determine age.

- For year-only dates, assumes July 1st as the midpoint
- For year+month dates, assumes the 15th as the midpoint
- Returns `Puppy`, `Young`, `Adult`, or `Senior`
- Returns `NULL` if no birth year provided or date is invalid

## Admin Interface

### Adding/Editing Dogs

The admin form now includes a "Birth Date" section with three input fields:

- **Year**: 4-digit year (e.g., 2020)
- **Month**: Month number 1-12
- **Day**: Day number 1-31

**Validation:**
- Month and Day fields are disabled until their prerequisite fields are filled
- Invalid dates (e.g., February 31) are rejected
- Year must be between 1900 and next year

**Usage Tips:**
- Leave all fields empty to use manual age category only
- Enter just the year if that's all that's known
- The system will calculate the age category automatically when birth date is provided

### Age Display

- Dog cards show the computed age category if birth date is available
- Falls back to manual age category if no birth date is provided
- Age filtering continues to work as before

## API Changes

### Dog Object Structure

The `Dog` interface now includes:

```typescript
{
  // Existing fields
  age: string;           // Manual age category (fallback)
  
  // New fields
  birthYear?: number | null;
  birthMonth?: number | null;
  birthDay?: number | null;
  computedAge?: string;  // Computed from birth date if available
}
```

### Data Fetching

The `useDogs` hook automatically:
1. Fetches birth date fields
2. Calculates `computedAge` on the client side
3. Makes computed age available for filtering and display

## Migration

### Migration File

`2025123001_add_dog_birth_date_fields.sql`

This migration:
- Adds birth date columns to the `dogs` table
- Adds validation constraints
- Creates age calculation functions
- Updates the `dogs_complete` view to include computed age
- Updates the audit system to track birth date changes

### Applying the Migration

For local development with Supabase CLI:
```bash
npm run supabase:reset
```

For production, the migration will be applied automatically during deployment.

## Testing

A test script (`test-age-calculation.js`) validates the age calculation logic with various scenarios:
- Different age ranges (Puppy, Young, Adult, Senior)
- Edge cases (exactly 6 months, 2 years, 8 years)
- Partial dates (year only, year+month)
- Invalid inputs

Run tests:
```bash
node test-age-calculation.js
```

## Future Enhancements

Potential improvements for future iterations:

1. **Display actual age**: Show "2 years, 3 months" in addition to category
2. **Birthday reminders**: Notify rescues of upcoming dog birthdays
3. **Age-based sorting**: Sort dogs by actual age rather than category
4. **Statistics**: Track average age of dogs in the system
5. **Import/Export**: Bulk import birth dates for existing dogs

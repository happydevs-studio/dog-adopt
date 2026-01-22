# Dog Management Improvements

This document describes enhancements to the dog management system in the admin panel.

## Dog Age Improvements

### Overview

The system now supports flexible birth date tracking for dogs with automatic age category calculation. This allows rescue organizations to provide as much or as little birth date information as they have available.

### Features

#### Flexible Birth Date Storage

Dogs can now have birth dates stored with varying levels of precision:

1. **Year only** - If only the birth year is known
2. **Year + Month** - If birth year and month are known
3. **Full date** - If exact birth date (year, month, day) is known

#### Automatic Age Categorization

When birth date information is provided, the system automatically calculates the dog's age category:

- **Puppy**: 6 months or younger
- **Young**: 6 months to 2 years
- **Adult**: 2 to 8 years
- **Senior**: 8+ years

The calculation uses the current date to determine the dog's age, so the category updates automatically as time passes.

#### Backward Compatibility

The system maintains full backward compatibility:

- Dogs without birth date information continue to use manually entered age categories
- The existing `age` field is preserved and used as a fallback
- Filtering and display logic works with both computed and manual age categories

### Database Schema

#### New Columns

```sql
birth_year INTEGER   -- Birth year (required if any birth date provided)
birth_month INTEGER  -- Birth month 1-12 (optional, requires birth_year)
birth_day INTEGER    -- Birth day 1-31 (optional, requires birth_year and birth_month)
```

#### Constraints

- `birth_year`: Must be between 1900 and current year + 1
- `birth_month`: Must be between 1 and 12, requires `birth_year` to be set
- `birth_day`: Must be between 1 and 31, requires both `birth_year` and `birth_month` to be set

#### Functions

##### `calculate_age_category(birth_year, birth_month, birth_day)`

PostgreSQL function that calculates the age category from a birth date. Uses the current date to determine age.

- For year-only dates, assumes July 1st as the midpoint
- For year+month dates, assumes the 15th as the midpoint
- Returns `Puppy`, `Young`, `Adult`, or `Senior`
- Returns `NULL` if no birth year provided or date is invalid

### Admin Interface

#### Adding/Editing Dogs

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

#### Age Display

- Dog cards show the computed age category if birth date is available
- Falls back to manual age category if no birth date is provided
- Age filtering continues to work as before

### API Changes

#### Dog Object Structure

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

#### Data Fetching

The `useDogs` hook automatically:
1. Fetches birth date fields
2. Calculates `computedAge` on the client side
3. Makes computed age available for filtering and display

### Migration

#### Migration File

`2025123001_add_dog_birth_date_fields.sql`

This migration:
- Adds birth date columns to the `dogs` table
- Adds validation constraints
- Creates age calculation functions
- Updates the `dogs_complete` view to include computed age
- Updates the audit system to track birth date changes

#### Applying the Migration

For local development with Supabase CLI:
```bash
npm run supabase:reset
```

For production, the migration will be applied automatically during deployment.

### Testing

A test script (`test-age-calculation.js`) validates the age calculation logic with various scenarios:
- Different age ranges (Puppy, Young, Adult, Senior)
- Edge cases (exactly 6 months, 2 years, 8 years)
- Partial dates (year only, year+month)
- Invalid inputs

Run tests:
```bash
node test-age-calculation.js
```

## Dog Admin View Improvements

### Overview
Enhanced the Dog Admin View with search, filtering, and grouping capabilities to make it easier to manage dogs from multiple rescues.

### Features Added

#### 1. Search Functionality
- **Search Input**: Added a search bar that allows filtering dogs by:
  - Dog name (e.g., "Biscuit")
  - Breed (e.g., "Beagle", "Border Collie")
  - Rescue name (e.g., "Battersea Dogs Home")
- **Real-time Search**: Results update as you type
- **Case-insensitive**: Search works regardless of letter case

#### 2. Rescue Filter
- **Dropdown Filter**: Added a rescue filter dropdown with:
  - "All Rescues" option (default)
  - Individual rescue options populated from available dogs
  - Sorted alphabetically for easy navigation
- **Combined Filtering**: Works together with search for precise results

#### 3. View Modes

##### List View (Default)
- Shows all filtered dogs in a simple list format
- Each dog card displays:
  - Dog image
  - Name, breed, age, size, location
  - Rescue name
  - Edit and Delete buttons

##### Grouped View
- Groups dogs by rescue organization
- Shows rescue name as section headers with count (e.g., "Battersea Dogs Home (3)")
- Makes it easy to:
  - See all dogs from a specific rescue at once
  - Add multiple dogs from the same rescue
  - Manage rescue-specific dog sets

#### 4. View Toggle Buttons
- **List Icon**: Switch to list view
- **Layers Icon**: Switch to grouped view
- Visual indication of active view mode

#### 5. Results Counter
- Shows "Showing X of Y dogs" to indicate filter effects
- Updates dynamically as filters change

### UI Components Used

- **Search Input**: Standard shadcn/ui Input with Search icon
- **Rescue Filter**: shadcn/ui Select dropdown
- **View Toggle**: shadcn/ui Button components with icons from lucide-react
- **Results Display**: Existing Card components with enhanced layout

### User Experience Improvements

1. **Workflow Optimization**: Admins can now:
   - Filter to a specific rescue
   - Add/edit dogs from that rescue
   - Easily see all dogs from that rescue grouped together

2. **Quick Navigation**: 
   - Search helps quickly find specific dogs
   - Grouped view provides clear organization
   - Results counter gives immediate feedback

3. **Responsive Design**:
   - Search and filters stack on mobile devices
   - View toggle buttons remain accessible
   - All controls work smoothly on different screen sizes

### Technical Details

#### Component Structure
```
DogsList.tsx
├── Search and Filter Controls (Card)
│   ├── Search Input
│   ├── Rescue Filter Dropdown
│   ├── View Mode Toggle Buttons
│   └── Results Counter
└── Dogs Display
    ├── List View (conditional)
    └── Grouped View (conditional)
```

#### State Management
- `searchQuery`: Controls search input
- `rescueFilter`: Controls rescue dropdown (default: 'all')
- `viewMode`: Toggles between 'list' and 'grouped'

#### Filtering Logic
- Uses `useMemo` for efficient filtering
- Filters applied in order:
  1. Rescue filter (if not 'all')
  2. Search query (if not empty)
- Grouping done with another `useMemo` for performance

#### Props Changes
The `DogsList` component now requires:
- `dogs: Dog[]` - Array of dogs (existing)
- `rescues: Rescue[]` - Array of rescues (new)
- `onEdit: (dog: Dog) => void` - Edit handler (existing)
- `onDelete: (dogId: string) => void` - Delete handler (existing)

### Testing Checklist

- [ ] Search by dog name works
- [ ] Search by breed works
- [ ] Search by rescue name works
- [ ] Rescue filter shows all rescues
- [ ] Rescue filter correctly filters dogs
- [ ] List view displays correctly
- [ ] Grouped view displays correctly
- [ ] View toggle buttons work
- [ ] Results counter updates correctly
- [ ] Search + filter combination works
- [ ] Empty state shows when no results
- [ ] Edit button works in both views
- [ ] Delete button works in both views
- [ ] Responsive design works on mobile
- [ ] Build succeeds without errors
- [ ] TypeScript compilation passes

## Future Enhancements

Potential future improvements:

### Age Features
1. **Display actual age**: Show "2 years, 3 months" in addition to category
2. **Birthday reminders**: Notify rescues of upcoming dog birthdays
3. **Age-based sorting**: Sort dogs by actual age rather than category
4. **Statistics**: Track average age of dogs in the system
5. **Import/Export**: Bulk import birth dates for existing dogs

### Admin View Features
1. Add status filter (available, reserved, adopted, etc.)
2. Add breed filter
3. Add size/age filters
4. Save view preferences to localStorage
5. Add bulk actions (e.g., delete multiple dogs)
6. Add export functionality
7. Add sorting options (by name, date added, etc.)

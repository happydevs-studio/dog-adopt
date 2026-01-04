# Dog Breed Features

## Overview

The application provides comprehensive dog breed support with database constraints, multi-breed selection, and autocomplete UI. This ensures data consistency while supporting both pure breeds and cross-breeds.

## Features

### Database Architecture

#### Tables
- **`dogadopt.breeds`** - Reference table with 250+ standard dog breeds
- **`dogadopt.dogs_breeds`** - Junction table for many-to-many dog-breed relationships with display order
- **`dogadopt.dogs`** - Main dogs table with computed breed fields

#### Key Features
- ✅ 250+ standard breeds from FCI, AKC, KC (UK), and CKC
- ✅ 15+ common cross-breeds (Cockapoo, Labradoodle, etc.)
- ✅ Multi-breed selection for cross-breeds
- ✅ Database constraints ensuring breed validity
- ✅ Display order preservation for breed sequences
- ✅ Backward compatibility with legacy `breed` column

### Admin Interface

#### BreedCombobox Component
Located at: `src/components/BreedCombobox.tsx`

Features:
- **Autocomplete Search**: Real-time filtering of 250+ breeds
- **Multi-Select**: Select multiple breeds for cross-breeds
- **Visual Badges**: Selected breeds shown as removable badges
- **Keyboard Navigation**: Full keyboard support
- **Validation**: Requires at least one breed selection

#### Usage in Admin Panel
The breed selector is integrated into the Add/Edit Dog form:

```typescript
<BreedCombobox
  value={formData.breeds}
  onChange={(breeds) => setFormData({ ...formData, breeds })}
  placeholder="Select one or more breeds..."
/>
```

### Data Structure

#### Backend (Database)
```sql
-- Breeds table
breeds: { id, name }

-- Junction table with display order
dogs_breeds: { dog_id, breed_id, display_order }

-- Legacy compatibility
dogs.breed: TEXT  -- Comma-separated for display
```

#### Frontend (TypeScript)
```typescript
interface Dog {
  breed: string;        // Comma-separated display string
  breeds?: string[];    // Array of breed names (optional)
}

interface DogFormData {
  breeds: string[];     // Array for multi-select
}
```

## Available Breeds

### Standard Breeds (250+)
The component includes all major recognized dog breeds:
- **Sporting Dogs**: Golden Retriever, Labrador Retriever, Cocker Spaniel
- **Working Dogs**: German Shepherd, Rottweiler, Siberian Husky
- **Terriers**: Yorkshire Terrier, Jack Russell Terrier, Bull Terrier
- **Toy Dogs**: Chihuahua, Pomeranian, Pug, Shih Tzu
- **Hounds**: Beagle, Bloodhound, Greyhound, Dachshund
- **Non-Sporting**: Bulldog, Dalmatian, French Bulldog
- **Herding**: Border Collie, Australian Shepherd, Collie

### Common Cross-Breeds (15+)
Popular designer breeds are pre-included:
- Cockapoo (Cocker Spaniel × Poodle)
- Labradoodle (Labrador × Poodle)
- Goldendoodle (Golden Retriever × Poodle)
- Cavapoo (Cavalier King Charles × Poodle)
- Puggle (Pug × Beagle)
- And more...

### Generic Options
- "Mixed Breed" for unknown or complex mixes
- "Terrier Mix" for general terrier crosses

## User Workflows

### For Admins Adding Dogs

**Single Breed Dogs:**
1. Search for and select one breed
2. Example: "German Shepherd"

**Cross-Breed Dogs:**
1. Select 2+ parent breeds
2. Example: "Labrador Retriever" + "Poodle (Standard)"
3. Displays as: "Labrador Retriever, Poodle"

**Designer Breeds:**
1. Select the pre-defined cross-breed name directly
2. Example: Select "Labradoodle"
3. OR select the parent breeds

**Unknown Mixes:**
1. Use "Mixed Breed" for complex or unknown mixes
2. Can add multiple guessed breeds if desired

### For Public Users

Breeds display on dog cards as comma-separated text:
- Single breed: "German Shepherd"
- Cross-breed: "Labrador Retriever, Poodle"
- Designer breed: "Cockapoo"

Search functionality:
- Search "labrador" matches dogs with Labrador in breed list
- Search "poodle" matches Labradoodles, Cockapoos, etc.
- Search "terrier" matches all terrier breeds and mixes

## Testing

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Docker running

### Local Testing Steps

1. **Start Supabase:**
   ```bash
   npm run supabase:start
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Test the breed combobox:**
   - Login as admin and navigate to `/admin`
   - Click "Add Dog" or edit existing dog
   - Use the breed combobox to search and select breeds
   - Try selecting multiple breeds for cross-breeds
   - Save and verify breeds display correctly

### Testing Scenarios

**Search Functionality:**
- Type to filter breeds (e.g., "terrier" shows all terrier breeds)
- Verify real-time search filtering works

**Multi-Selection:**
- Click multiple breeds to add them
- Click X on a badge to remove a breed
- Verify all selections appear as badges

**Validation:**
- Try to submit without selecting a breed (should show error)
- Verify at least one breed is required

## Benefits

1. **Data Consistency**: Only valid breed names can be entered
2. **Better Search**: Users can find specific breeds easily
3. **Cross-Breed Support**: Properly represent designer breeds
4. **User-Friendly**: Autocomplete reduces typing and errors
5. **Flexible**: Supports both pure breeds and complex mixes
6. **Professional**: Matches veterinary and kennel club standards
7. **Backward Compatible**: Legacy `breed` column maintained

## Technical Implementation

### Helper Function
```sql
-- Set breeds for a dog (used by admin forms)
dogadopt.set_dog_breeds(dog_id UUID, breed_names TEXT[])
```

### Querying Dogs with Breeds
```typescript
// Frontend automatically gets breeds array
const { data: dogs } = useDogs();
dogs.forEach(dog => {
  console.log(dog.name, dog.breeds); // ['Labrador', 'Golden Retriever']
});
```

```sql
-- Direct SQL query
SELECT d.name, string_agg(b.name, ', ' ORDER BY db.display_order) as breeds
FROM dogadopt.dogs d
LEFT JOIN dogadopt.dogs_breeds db ON d.id = db.dog_id
LEFT JOIN dogadopt.breeds b ON db.breed_id = b.id
GROUP BY d.id, d.name;
```

## Migration

The breed system is implemented in migration:
- `supabase/migrations/2025122803_dogadopt_dogs_and_breeds.sql`

This migration:
- Creates breed reference tables
- Populates with 250+ breeds
- Sets up many-to-many relationships
- Maintains backward compatibility

To apply:
```bash
npm run supabase:reset
```

## Future Enhancements

Potential improvements:
1. Add breed filtering to public search UI
2. Display breed badges separately instead of comma-separated
3. Add breed images/icons
4. Show breed-specific information (size ranges, temperament)
5. Support custom breed names for rare breeds
6. Add breed popularity statistics

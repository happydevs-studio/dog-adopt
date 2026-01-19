# Breed Size Auto-Population Feature

## Overview

When adding a new dog in the admin panel, the size field now automatically populates based on the selected breed(s). This eliminates the need to manually set the size for every dog and ensures consistency.

## How It Works

1. **Select a breed** in the "Add Dog" form
2. **Size auto-populates** based on breed standards:
   - **Small**: Up to 20 lbs (e.g., Chihuahua, Jack Russell Terrier, Yorkshire Terrier)
   - **Medium**: 21-60 lbs (e.g., Border Collie, Beagle, Cocker Spaniel)
   - **Large**: Over 60 lbs (e.g., Golden Retriever, German Shepherd, Great Dane)

3. **Manual override** available - you can still change the size if needed

## Examples

| Breed | Auto-populated Size |
|-------|-------------------|
| Jack Russell Terrier | Small |
| Chihuahua | Small |
| Border Collie | Medium |
| Beagle | Medium |
| Golden Retriever | Large |
| German Shepherd | Large |
| Cockapoo | Small |
| Labradoodle | Large |

## Multi-Breed Dogs

For dogs with multiple breeds selected (cross-breeds):
- The size is determined by the **first breed** selected
- Example: Selecting "Jack Russell Terrier" then "Beagle" → Size = Small

## Editing Existing Dogs

- The auto-population **only applies to new dogs**
- When editing an existing dog, the size field retains its current value
- This prevents unintended changes to existing records

## Technical Details

- Based on AKC, KC (UK), and FCI breed standards
- Covers 250+ breeds including common cross-breeds
- Default fallback to "Medium" for unknown breeds
- Implementation in `src/data/breedSizes.ts`

## Testing

The feature has been tested with:
- ✓ Common small breeds (Chihuahua, Jack Russell, etc.)
- ✓ Common medium breeds (Beagle, Border Collie, etc.)
- ✓ Common large breeds (Golden Retriever, German Shepherd, etc.)
- ✓ Cross-breeds (Cockapoo, Labradoodle, etc.)
- ✓ Case-insensitive breed matching
- ✓ Unknown breeds default to Medium

## Code Changes

### Files Modified
1. `src/data/breedSizes.ts` - New breed size mapping
2. `src/pages/Admin/DogFormDialog.tsx` - Form logic update
3. `src/pages/Admin/DogForm/BasicInfoSection.tsx` - Form component update

### Key Functions
- `getBreedSize(breedName: string): BreedSize` - Get size for a single breed
- `getDefaultSizeForBreeds(breeds: string[]): BreedSize` - Get size for multiple breeds

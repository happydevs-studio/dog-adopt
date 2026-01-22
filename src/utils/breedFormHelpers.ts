import { getDefaultSizeForBreeds } from '@/data/breedSizes';
import type { DogFormData } from '@/pages/Admin.types';

/**
 * Handler for breed selection changes that auto-populates size for new dogs.
 * 
 * @param breeds - Selected breed names
 * @param formData - Current form data
 * @param isEditing - Whether editing an existing dog (true) or creating new (false)
 * @returns Updated form data with breeds and optionally updated size
 */
export function handleBreedChange(
  breeds: string[],
  formData: DogFormData,
  isEditing: boolean
): DogFormData {
  // For new dogs, auto-populate size based on breed
  if (!isEditing && breeds.length > 0) {
    const defaultSize = getDefaultSizeForBreeds(breeds);
    return { ...formData, breeds, size: defaultSize };
  }
  
  // For editing or no breeds selected, just update breeds
  return { ...formData, breeds };
}

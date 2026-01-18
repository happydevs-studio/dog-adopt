import type { DogFormData, RescueFormData } from './Admin.types';

export interface DogDataPayload {
  name: string;
  age: string;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  rescue_since_date: string | null;
  size: string;
  gender: string;
  status: string;
  status_notes: string | null;
  rescue_id: string | null;
  location_id: null;
  image: string;
  profile_url: string | null;
  description: string;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  good_with_cats: boolean;
}

/**
 * Validate year field
 */
function validateYear(year: string): { isValid: boolean; error?: string } {
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
    return { isValid: false, error: `Birth year must be between 1900 and ${currentYear + 1}` };
  }
  
  return { isValid: true };
}

/**
 * Validate month field
 */
function validateMonth(month: string): { isValid: boolean; error?: string } {
  const monthNum = parseInt(month);
  
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Birth month must be between 1 and 12' };
  }
  
  return { isValid: true };
}

/**
 * Validate day field
 */
function validateDay(day: string, month: string, year: string): { isValid: boolean; error?: string } {
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    return { isValid: false, error: 'Birth day must be between 1 and 31' };
  }
  
  if (isNaN(yearNum) || isNaN(monthNum)) {
    return { isValid: false, error: 'Valid year and month are required for birth day' };
  }
  
  const testDate = new Date(yearNum, monthNum - 1, dayNum);
  if (testDate.getMonth() !== monthNum - 1 || testDate.getDate() !== dayNum) {
    return { isValid: false, error: 'Invalid date (e.g., February 30th doesn\'t exist)' };
  }
  
  return { isValid: true };
}

/**
 * Validate birth date fields for a dog form
 */
export function validateBirthDate(data: DogFormData): { isValid: boolean; error?: string } {
  const hasYear = data.birthYear !== '';
  const hasMonth = data.birthMonth !== '';
  const hasDay = data.birthDay !== '';
  
  if (hasMonth && !hasYear) {
    return { isValid: false, error: 'Birth year is required when birth month is provided' };
  }
  
  if (hasDay && (!hasYear || !hasMonth)) {
    return { isValid: false, error: 'Birth year and month are required when birth day is provided' };
  }
  
  if (!hasYear) return { isValid: true };
  
  const yearValidation = validateYear(data.birthYear);
  if (!yearValidation.isValid) return yearValidation;
  
  if (hasMonth) {
    const monthValidation = validateMonth(data.birthMonth);
    if (!monthValidation.isValid) return monthValidation;
  }
  
  if (hasDay) {
    const dayValidation = validateDay(data.birthDay, data.birthMonth, data.birthYear);
    if (!dayValidation.isValid) return dayValidation;
  }
  
  return { isValid: true };
}

/**
 * Validate a dog form
 */
export function validateDogForm(data: DogFormData): { isValid: boolean; error?: string } {
  // Required field validations with specific messages
  if (!data.name || data.name.trim() === '') {
    return { isValid: false, error: 'Dog name is required. Please enter a name.' };
  }

  if (data.breeds.length === 0) {
    return { isValid: false, error: 'At least one breed is required. Please select a breed from the list.' };
  }

  if (!data.age) {
    return { isValid: false, error: 'Age category is required. Please select Puppy, Young, Adult, or Senior.' };
  }

  if (!data.size) {
    return { isValid: false, error: 'Size is required. Please select Small, Medium, or Large.' };
  }

  if (!data.gender) {
    return { isValid: false, error: 'Gender is required. Please select Male or Female.' };
  }

  if (!data.status) {
    return { isValid: false, error: 'Adoption status is required. Please select a status.' };
  }

  if (!data.rescue_id || data.rescue_id === '') {
    return { isValid: false, error: 'Rescue organization is required. Please select a rescue from the list.' };
  }

  if (!data.location || data.location.trim() === '') {
    return { isValid: false, error: 'Location is required. Please enter or select a location.' };
  }

  if (!data.image || data.image.trim() === '') {
    return { isValid: false, error: 'Dog image is required. Please upload an image or provide an image URL.' };
  }

  if (!data.description || data.description.trim() === '') {
    return { isValid: false, error: 'Description is required. Please provide a description of the dog.' };
  }

  // Validate profile URL format if provided
  if (data.profileUrl && data.profileUrl.trim() !== '') {
    try {
      new URL(data.profileUrl);
    } catch {
      return { isValid: false, error: 'Profile URL is invalid. Please enter a valid URL (e.g., https://example.com).' };
    }
  }
  
  return validateBirthDate(data);
}

/**
 * Build dog data payload for API submission
 */
export function buildDogDataPayload(formData: DogFormData, imageUrl: string): DogDataPayload {
  return {
    name: formData.name,
    age: formData.age,
    birth_year: formData.birthYear ? parseInt(formData.birthYear) : null,
    birth_month: formData.birthMonth ? parseInt(formData.birthMonth) : null,
    birth_day: formData.birthDay ? parseInt(formData.birthDay) : null,
    rescue_since_date: formData.rescueSinceDate || null,
    size: formData.size,
    gender: formData.gender,
    status: formData.status,
    status_notes: formData.status_notes || null,
    rescue_id: formData.rescue_id || null,
    location_id: null, // TODO: Add location support when needed
    image: imageUrl,
    profile_url: formData.profileUrl || null,
    description: formData.description,
    good_with_kids: formData.good_with_kids,
    good_with_dogs: formData.good_with_dogs,
    good_with_cats: formData.good_with_cats,
  };
}

/**
 * Build API call parameters for creating a dog
 */
export function buildCreateDogParams(dogData: DogDataPayload, breeds: string[]) {
  return {
    p_name: dogData.name,
    p_age: dogData.age,
    p_size: dogData.size,
    p_gender: dogData.gender,
    p_status: dogData.status,
    p_rescue_id: dogData.rescue_id,
    p_image: dogData.image,
    p_description: dogData.description,
    p_good_with_kids: dogData.good_with_kids,
    p_good_with_dogs: dogData.good_with_dogs,
    p_good_with_cats: dogData.good_with_cats,
    p_breed_names: breeds,
    p_birth_year: dogData.birth_year,
    p_birth_month: dogData.birth_month,
    p_birth_day: dogData.birth_day,
    p_rescue_since_date: dogData.rescue_since_date,
    p_profile_url: dogData.profile_url,
    p_status_notes: dogData.status_notes,
    p_location_id: dogData.location_id
  };
}

/**
 * Build API call parameters for updating a dog
 */
export function buildUpdateDogParams(dogId: string, dogData: DogDataPayload, breeds: string[]) {
  return {
    p_dog_id: dogId,
    ...buildCreateDogParams(dogData, breeds)
  };
}

/**
 * Build API call parameters for creating a rescue
 */
export function buildCreateRescueParams(formData: RescueFormData) {
  return {
    p_name: formData.name,
    p_type: formData.type,
    p_region: formData.region,
    p_website: formData.website || null,
    p_phone: formData.phone || null,
    p_email: formData.email || null,
    p_address: formData.address || null,
    p_postcode: formData.postcode || null,
    p_charity_number: formData.charity_number || null,
    p_contact_notes: formData.contact_notes || null,
    p_latitude: formData.latitude ? parseFloat(formData.latitude) : null,
    p_longitude: formData.longitude ? parseFloat(formData.longitude) : null,
  };
}

/**
 * Build API call parameters for updating a rescue
 */
export function buildUpdateRescueParams(rescueId: string, formData: RescueFormData) {
  return {
    p_rescue_id: rescueId,
    ...buildCreateRescueParams(formData)
  };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { isValid: false, error: 'Image must be less than 5MB' };
  }
  return { isValid: true };
}

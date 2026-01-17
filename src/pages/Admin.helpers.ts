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
  
  if (!hasYear) {
    return { isValid: true };
  }
  
  const year = parseInt(data.birthYear);
  const currentYear = new Date().getFullYear();
  if (isNaN(year) || year < 1900 || year > currentYear + 1) {
    return { isValid: false, error: `Birth year must be between 1900 and ${currentYear + 1}` };
  }
  
  if (hasMonth) {
    const month = parseInt(data.birthMonth);
    if (isNaN(month) || month < 1 || month > 12) {
      return { isValid: false, error: 'Birth month must be between 1 and 12' };
    }
  }
  
  if (hasDay) {
    const day = parseInt(data.birthDay);
    const month = parseInt(data.birthMonth);
    
    if (isNaN(day) || day < 1 || day > 31) {
      return { isValid: false, error: 'Birth day must be between 1 and 31' };
    }
    
    if (isNaN(year) || isNaN(month)) {
      return { isValid: false, error: 'Valid year and month are required for birth day' };
    }
    
    const testDate = new Date(year, month - 1, day);
    if (testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
      return { isValid: false, error: 'Invalid date (e.g., February 30th doesn\'t exist)' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate a dog form
 */
export function validateDogForm(data: DogFormData): { isValid: boolean; error?: string } {
  if (data.breeds.length === 0) {
    return { isValid: false, error: 'Please select at least one breed' };
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

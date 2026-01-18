/**
 * Error handling utilities for Supabase operations
 * Translates database errors into user-friendly messages
 */

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Map of database field names to user-friendly names
 */
const FIELD_NAME_MAP: Record<string, string> = {
  'name': 'Name',
  'age': 'Age',
  'size': 'Size',
  'gender': 'Gender',
  'status': 'Adoption Status',
  'rescue_id': 'Rescue Organization',
  'location_id': 'Location',
  'image': 'Image',
  'description': 'Description',
  'good_with_kids': 'Good with Kids',
  'good_with_dogs': 'Good with Dogs',
  'good_with_cats': 'Good with Cats',
  'birth_year': 'Birth Year',
  'birth_month': 'Birth Month',
  'birth_day': 'Birth Day',
  'profile_url': 'Profile URL',
  'status_notes': 'Status Notes',
  'rescue_since_date': 'Rescue Since Date',
};

/**
 * Extract user-friendly error message from Supabase error
 */
export function getSupabaseErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle Error instances
  if (error instanceof Error) {
    return parseErrorMessage(error.message);
  }

  // Handle Supabase error objects
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as SupabaseError;
    
    if (supabaseError.message) {
      return parseErrorMessage(supabaseError.message, supabaseError.hint);
    }
  }

  return 'Failed to save dog. Please try again.';
}

/**
 * Check if error is an authorization error
 */
function isAuthorizationError(lowerMessage: string): boolean {
  return lowerMessage.includes('unauthorized') || lowerMessage.includes('admin access required');
}

/**
 * Check if error is a foreign key constraint violation
 */
function isForeignKeyError(lowerMessage: string): boolean {
  return lowerMessage.includes('foreign key') || lowerMessage.includes('violates foreign key constraint');
}

/**
 * Check if error is a not null constraint violation
 */
function isNotNullError(lowerMessage: string): boolean {
  return lowerMessage.includes('null value') || lowerMessage.includes('violates not-null constraint');
}

/**
 * Check if error is a check constraint violation
 */
function isCheckConstraintError(lowerMessage: string): boolean {
  return lowerMessage.includes('check constraint') || lowerMessage.includes('violates check');
}

/**
 * Check if error is a unique constraint violation
 */
function isUniqueConstraintError(lowerMessage: string): boolean {
  return lowerMessage.includes('unique') || lowerMessage.includes('duplicate');
}

/**
 * Check if error is an image upload error
 */
function isImageUploadError(lowerMessage: string): boolean {
  return lowerMessage.includes('storage') || lowerMessage.includes('upload');
}

/**
 * Check if error is a network error
 */
function isNetworkError(lowerMessage: string): boolean {
  return lowerMessage.includes('network') || lowerMessage.includes('connection') || lowerMessage.includes('timeout');
}

/**
 * Check if error is an invalid input error
 */
function isInvalidInputError(lowerMessage: string): boolean {
  return lowerMessage.includes('invalid input') || lowerMessage.includes('invalid text representation');
}

/**
 * Get foreign key error message
 */
function getForeignKeyErrorMessage(lowerMessage: string): string {
  if (lowerMessage.includes('rescue')) {
    return 'The selected rescue organization is invalid. Please select a valid rescue from the list.';
  }
  if (lowerMessage.includes('location')) {
    return 'The selected location is invalid. Please select a valid location.';
  }
  return 'One or more selected references are invalid. Please check your selections.';
}

/**
 * Get not null error message
 */
function getNotNullErrorMessage(message: string): string {
  const field = extractFieldName(message);
  if (field) {
    return `The field "${formatFieldName(field)}" is required and cannot be empty.`;
  }
  return 'A required field is missing. Please fill in all required fields.';
}

/**
 * Get check constraint error message
 */
function getCheckConstraintErrorMessage(lowerMessage: string): string {
  if (lowerMessage.includes('age')) {
    return 'Invalid age category. Please select Puppy, Young, Adult, or Senior.';
  }
  if (lowerMessage.includes('size')) {
    return 'Invalid size category. Please select Small, Medium, or Large.';
  }
  if (lowerMessage.includes('gender')) {
    return 'Invalid gender. Please select Male or Female.';
  }
  if (lowerMessage.includes('status')) {
    return 'Invalid adoption status. Please select a valid status from the dropdown.';
  }
  return 'One or more field values are invalid. Please check your entries.';
}

/**
 * Parse error message and translate to user-friendly format
 */
function parseErrorMessage(message: string, hint?: string): string {
  const lowerMessage = message.toLowerCase();

  if (isAuthorizationError(lowerMessage)) {
    return 'You do not have permission to perform this action. Admin access is required.';
  }

  if (isForeignKeyError(lowerMessage)) {
    return getForeignKeyErrorMessage(lowerMessage);
  }

  if (isNotNullError(lowerMessage)) {
    return getNotNullErrorMessage(message);
  }

  if (isCheckConstraintError(lowerMessage)) {
    return getCheckConstraintErrorMessage(lowerMessage);
  }

  if (isUniqueConstraintError(lowerMessage)) {
    return 'A dog with this information already exists. Please check for duplicates.';
  }

  if (isImageUploadError(lowerMessage)) {
    return 'Failed to upload image. Please try a different image or check your connection.';
  }

  if (isNetworkError(lowerMessage)) {
    return 'Network error. Please check your internet connection and try again.';
  }

  if (isInvalidInputError(lowerMessage)) {
    return 'Invalid data format. Please check that all fields contain valid information.';
  }

  if (hint && hint.trim()) {
    return `${message}. Hint: ${hint}`;
  }

  return message;
}

/**
 * Extract field name from error message
 */
function extractFieldName(message: string): string | null {
  // Try to extract field name from common patterns
  const patterns = [
    /column "([^"]+)"/i,
    /field "([^"]+)"/i,
    /null value in column "([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Format database field name to user-friendly name
 */
function formatFieldName(fieldName: string): string {
  return FIELD_NAME_MAP[fieldName] || fieldName.replace(/_/g, ' ');
}

/**
 * Validation error details for form field errors
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'Validation failed';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  const errorList = errors.map((err, idx) => `${idx + 1}. ${err.message}`).join('\n');
  return `Multiple validation errors:\n${errorList}`;
}

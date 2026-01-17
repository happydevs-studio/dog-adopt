import type { StatusFilter } from '@/types/dog';

// Format status for display
export const formatStatus = (status: StatusFilter): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'adopted':
      return 'Adopted';
    case 'on_hold':
      return 'On Hold';
    case 'fostered':
      return 'Fostered';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status;
  }
};

// Get badge variant based on status
export const getStatusVariant = (status: StatusFilter): 'default' | 'secondary' | 'destructive' | 'outline' | 'warm' | 'success' => {
  switch (status) {
    case 'available':
      return 'success';
    case 'reserved':
      return 'warm';
    case 'adopted':
      return 'secondary';
    case 'on_hold':
      return 'outline';
    case 'fostered':
      return 'default';
    case 'withdrawn':
      return 'destructive';
    default:
      return 'default';
  }
};

// Add UTM parameters to dog profile URL
export const getDogProfileUrl = (profileUrl: string | null | undefined, dogName: string): string | null => {
  if (!profileUrl) return null;
  
  try {
    const url = new URL(profileUrl);
    url.searchParams.set('utm_source', 'dogadopt');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'dog_profile');
    return url.toString();
  } catch (e) {
    // If URL is invalid, return null to prevent broken links
    console.warn(`Invalid profile URL for dog ${dogName}:`, profileUrl, e);
    return null;
  }
};

// Format rescue date for display
export const formatRescueDate = (rescueSinceDate: string | null | undefined): string | null => {
  if (!rescueSinceDate) return null;
  
  try {
    const date = new Date(rescueSinceDate);
    if (isNaN(date.getTime())) return null;
    return `In rescue since ${date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })}`;
  } catch (e) {
    return null;
  }
};

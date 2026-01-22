import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Dog } from '@/types/dog';
import { DEFAULT_DOG_IMAGE } from '@/lib/constants';
import { calculateDistance } from '@/lib/geolocation';

interface BreedItem {
  display_order: number;
  name: string;
}

// Helper function to calculate age category from birth date
// Returns: 'Puppy' (≤6 months), 'Young' (6mo-2yr), 'Adult' (2-8yr), 'Senior' (8+yr)
function calculateAgeCategory(
  birthYear: number | null, 
  birthMonth: number | null = null, 
  birthDay: number | null = null
): string | null {
  if (!birthYear) return null;
  
  try {
    // Construct birth date with available precision
    // Use middle of year/month if not specified for more accurate age calculation
    let birthDate: Date;
    if (!birthMonth) {
      // Year only - use July 1st as midpoint
      birthDate = new Date(birthYear, 6, 1);
    } else if (!birthDay) {
      // Year and month - use 15th as midpoint
      birthDate = new Date(birthYear, birthMonth - 1, 15);
    } else {
      // Full date available
      birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    }
    
    // Check for invalid date
    if (isNaN(birthDate.getTime())) return null;
    
    const now = new Date();
    
    // Calculate age more accurately by considering all date components
    let ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12;
    ageInMonths += now.getMonth() - birthDate.getMonth();
    
    // Adjust if we haven't reached the birth day in the current month
    if (now.getDate() < birthDate.getDate()) {
      ageInMonths--;
    }
    
    const ageInYears = ageInMonths / 12;
    
    // Categorize based on age
    if (ageInMonths <= 6) {
      return 'Puppy';
    } else if (ageInMonths <= 24) {  // 2 years
      return 'Young';
    } else if (ageInMonths <= 96) {  // 8 years
      return 'Adult';
    } else {
      return 'Senior';
    }
  } catch (error) {
    return null;
  }
}

interface DogRow {
  id: string;
  name: string;
  age: string;
  size: string;
  gender: string;
  status: 'available' | 'reserved' | 'adopted' | 'on_hold' | 'fostered' | 'withdrawn';
  status_notes: string | null;
  location_id: string | null;
  rescue_id: string | null;
  image: string | null;
  profile_url: string | null;
  description: string;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  good_with_cats: boolean;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  rescue_since_date: string | null;
  created_at: string;
  rescues: {
    id: string;
    name: string;
    region: string;
    website: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
  dogs_breeds: Array<{
    breeds: {
      id: string;
      name: string;
    };
    display_order: number;
  }>;
}

/**
 * Transform raw dog row to Dog type
 */
function transformDogRow(dog: Record<string, unknown>): Dog {
  const rescue = typeof dog.rescue === 'string' ? JSON.parse(dog.rescue as string) : dog.rescue;
  const breedsArray = typeof dog.breeds === 'string' ? JSON.parse(dog.breeds as string) : dog.breeds;
  
  const breeds = (breedsArray || [])
    .sort((a: BreedItem, b: BreedItem) => a.display_order - b.display_order)
    .map((b: BreedItem) => b.name);

  const computedAge = calculateAgeCategory(dog.birth_year as number | null, dog.birth_month as number | null, dog.birth_day as number | null);

  return {
    id: dog.id as string,
    name: dog.name as string,
    breed: breeds.join(', '),
    breeds: breeds,
    age: dog.age as string,
    birthYear: dog.birth_year as number | undefined,
    birthMonth: dog.birth_month as number | undefined,
    birthDay: dog.birth_day as number | undefined,
    rescueSinceDate: dog.rescue_since_date as string | undefined,
    computedAge: computedAge || (dog.age as string),
    size: dog.size as 'Small' | 'Medium' | 'Large',
    gender: dog.gender as 'Male' | 'Female',
    status: dog.status as 'available' | 'reserved' | 'adopted' | 'on_hold' | 'fostered' | 'withdrawn',
    statusNotes: dog.status_notes as string | undefined,
    location: rescue?.region || 'Unknown',
    rescue: rescue?.name || 'Unknown',
    rescueWebsite: rescue?.website,
    image: (dog.image as string | null) || DEFAULT_DOG_IMAGE,
    profileUrl: (dog.profile_url as string | null) ?? undefined,
    goodWithKids: dog.good_with_kids as boolean,
    goodWithDogs: dog.good_with_dogs as boolean,
    goodWithCats: dog.good_with_cats as boolean,
    description: dog.description as string,
  };
}

/**
 * Add distance to dog if user location is available
 */
function addDistanceIfAvailable(
  dog: Dog, 
  userLocation: { latitude: number; longitude: number } | undefined,
  rescue: { latitude: number | null; longitude: number | null } | null
): Dog {
  if (userLocation && rescue?.latitude && rescue?.longitude) {
    return {
      ...dog,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        rescue.latitude,
        rescue.longitude
      )
    };
  }
  return dog;
}

export const useDogs = (userLocation?: { latitude: number; longitude: number }) => {
  return useQuery({
    queryKey: ['dogs', userLocation],
    queryFn: async (): Promise<Dog[]> => {
      const { data, error } = await supabase
        .schema('dogadopt_api')
        .rpc('get_dogs');

      if (error) {
        console.error('Error fetching dogs:', error);
        if (error.message?.includes('does not exist') || error.code === '42883') {
          throw new Error('Database migration required: The get_dogs API function is not available. Please run database migrations.');
        }
        throw error;
      }

      const dogs = (data as Array<Record<string, unknown>>).map((dog) => {
        const rescue = typeof dog.rescue === 'string' ? JSON.parse(dog.rescue as string) : dog.rescue;
        const transformedDog = transformDogRow(dog);
        return addDistanceIfAvailable(transformedDog, userLocation, rescue);
      });

      if (userLocation) {
        dogs.sort((a, b) => {
          if (a.distance && b.distance) return a.distance - b.distance;
          if (a.distance) return -1;
          if (b.distance) return 1;
          return 0;
        });
      }

      return dogs;
    },
  });
};

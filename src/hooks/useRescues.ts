import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/lib/geolocation';

// API response interface (matches database schema with snake_case)
interface RescueApiResponse {
  id: string;
  name: string;
  type: string;
  region: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postcode: string | null;
  charity_number: string | null;
  contact_notes: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  dog_count: number; // Note: snake_case from database
}

// Client-side interface (uses camelCase for TypeScript conventions)
export interface Rescue {
  id: string;
  name: string;
  type: string;
  region: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postcode: string | null;
  charity_number: string | null;
  contact_notes: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number; // Distance in km from user's location
  dogCount: number; // Number of available dogs
}

export const useRescues = (userLocation?: { latitude: number; longitude: number }) => {
  return useQuery({
    queryKey: ['rescues', userLocation],
    queryFn: async (): Promise<Rescue[]> => {
      // Try using API layer function first
      // Call RPC function from dogadopt_api schema
      let apiData;
      let useApiLayer = true;
      
      const { data, error } = await supabase
        .rpc('dogadopt_api.get_rescues');

      if (error) {
        console.error('Error fetching rescues via API layer:', error);
        // If API function doesn't exist, fall back to direct table access
        if (error.message?.includes('does not exist') || error.code === '42883') {
          console.warn('API layer not available, falling back to direct table access. Please apply database migrations to enable the API layer.');
          useApiLayer = false;
        } else {
          // For other errors, throw to show the error to the user
          throw error;
        }
      } else {
        apiData = data;
      }

      // Fallback: Direct table access (legacy method)
      if (!useApiLayer) {
        // Query rescues with dog count
        const { data: rescuesData, error: rescuesError } = await supabase
          .from('rescues')
          .select('*');

        if (rescuesError) {
          console.error('Error fetching rescues via fallback:', rescuesError);
          throw rescuesError;
        }

        // Count dogs per rescue
        const { data: dogsData, error: dogsError } = await supabase
          .from('dogs')
          .select('rescue_id, status')
          .eq('status', 'available');

        if (dogsError) {
          console.error('Error counting dogs:', dogsError);
        }

        // Build dog count map
        const dogCountMap: Record<string, number> = {};
        dogsData?.forEach((dog: any) => {
          if (dog.rescue_id) {
            dogCountMap[dog.rescue_id] = (dogCountMap[dog.rescue_id] || 0) + 1;
          }
        });

        // Transform to match API format
        apiData = rescuesData?.map((rescue: any) => ({
          ...rescue,
          dog_count: dogCountMap[rescue.id] || 0,
        }));
      }

      // Transform API response from snake_case to camelCase
      const transformedData = apiData as RescueApiResponse[];
      let rescues: Rescue[] = transformedData.map(rescue => ({
        id: rescue.id,
        name: rescue.name,
        type: rescue.type,
        region: rescue.region,
        website: rescue.website,
        phone: rescue.phone,
        email: rescue.email,
        address: rescue.address,
        postcode: rescue.postcode,
        charity_number: rescue.charity_number,
        contact_notes: rescue.contact_notes,
        latitude: rescue.latitude,
        longitude: rescue.longitude,
        dogCount: rescue.dog_count, // Critical fix: Map snake_case to camelCase for display
      }));

      // Calculate distances if user location is provided
      if (userLocation) {
        rescues = rescues.map(rescue => {
          if (rescue.latitude && rescue.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              rescue.latitude,
              rescue.longitude
            );
            return { ...rescue, distance };
          }
          return rescue;
        });

        // Sort by distance when user location is available
        rescues.sort((a, b) => {
          if (a.distance && b.distance) return a.distance - b.distance;
          if (a.distance) return -1;
          if (b.distance) return 1;
          return 0;
        });
      }

      return rescues;
    },
  });
};

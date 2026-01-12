import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/lib/geolocation';

export interface Rescue {
  id: string;
  name: string;
  type: string;
  region: string;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number; // Distance in km from user's location
}

export const useRescues = (userLocation?: { latitude: number; longitude: number }) => {
  return useQuery({
    queryKey: ['rescues', userLocation],
    queryFn: async (): Promise<Rescue[]> => {
      // Use API layer view instead of direct table access
      const { data, error } = await (supabase as any)
        .from('dogadopt_api.rescues')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      let rescues = data as unknown as Rescue[];

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

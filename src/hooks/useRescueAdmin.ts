import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RescueAdmin {
  rescueId: string;
  rescueName: string;
  rescueRegion: string;
  rescueWebsite: string | null;
  rescueEmail: string | null;
  grantedAt: string;
  notes: string | null;
}

/**
 * Hook to check if the current user is a rescue admin for a specific rescue
 * Returns true if user is either a global admin or a rescue admin for that rescue
 */
export const useIsRescueAdmin = (rescueId: string | undefined) => {
  return useQuery({
    queryKey: ['isRescueAdmin', rescueId],
    queryFn: async (): Promise<boolean> => {
      if (!rescueId) return false;

      const { data, error } = await supabase
        .schema('dogadopt_api')
        .rpc('check_rescue_admin', { p_rescue_id: rescueId });

      if (error) {
        console.error('Error checking rescue admin status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!rescueId,
  });
};

/**
 * Hook to get all rescues that the current user can administer
 */
export const useUserRescueAdmins = () => {
  return useQuery({
    queryKey: ['userRescueAdmins'],
    queryFn: async (): Promise<RescueAdmin[]> => {
      const { data, error } = await supabase
        .schema('dogadopt_api')
        .rpc('get_user_rescue_admins');

      if (error) {
        console.error('Error fetching user rescue admins:', error);
        throw error;
      }

      if (!data) return [];

      // Convert snake_case to camelCase
      return data.map((item: any) => ({
        rescueId: item.rescue_id,
        rescueName: item.rescue_name,
        rescueRegion: item.rescue_region,
        rescueWebsite: item.rescue_website,
        rescueEmail: item.rescue_email,
        grantedAt: item.granted_at,
        notes: item.notes,
      }));
    },
  });
};

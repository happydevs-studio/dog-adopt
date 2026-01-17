import { useMemo } from 'react';
import type { Rescue } from '@/types/dog';

interface UseRescueFiltersParams {
  rescues: Rescue[];
  searchQuery: string;
}

export const useRescueFilters = ({ rescues, searchQuery }: UseRescueFiltersParams) => {
  const filteredRescues = useMemo(() => {
    if (!searchQuery) return rescues;

    const query = searchQuery.toLowerCase();
    return rescues.filter(rescue =>
      rescue.name.toLowerCase().includes(query) ||
      rescue.region.toLowerCase().includes(query)
    );
  }, [rescues, searchQuery]);

  return filteredRescues;
};

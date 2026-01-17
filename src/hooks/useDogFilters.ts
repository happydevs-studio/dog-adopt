import { useMemo } from 'react';
import type { Dog, SizeFilter, AgeFilter, StatusFilter } from '@/types/dog';

interface UseDogFiltersParams {
  dogs: Dog[];
  sizeFilter: SizeFilter;
  ageFilter: AgeFilter;
  statusFilter: StatusFilter;
  searchQuery: string;
}

export const useDogFilters = ({
  dogs,
  sizeFilter,
  ageFilter,
  statusFilter,
  searchQuery
}: UseDogFiltersParams) => {
  const filteredDogs = useMemo(() => {
    let filtered = [...dogs];

    // Apply size filter
    if (sizeFilter !== 'All') {
      filtered = filtered.filter(dog => dog.size === sizeFilter);
    }

    // Apply age filter
    if (ageFilter !== 'All') {
      filtered = filtered.filter(dog => {
        const displayAge = dog.computedAge || dog.age;
        return displayAge === ageFilter;
      });
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(dog => dog.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dog =>
        dog.name.toLowerCase().includes(query) ||
        dog.breed.toLowerCase().includes(query) ||
        dog.location.toLowerCase().includes(query) ||
        dog.rescue.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [dogs, sizeFilter, ageFilter, statusFilter, searchQuery]);

  return filteredDogs;
};

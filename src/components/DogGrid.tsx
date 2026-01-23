import { useState, useEffect, useRef } from 'react';
import FilterSidebar from './FilterSidebar';
import { useDogs } from '@/hooks/useDogs';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDogFilters } from '@/hooks/useDogFilters';
import type { SizeFilter, AgeFilter, StatusFilter } from '@/types/dog';
import { PaginationControls } from '@/components/PaginationControls';
import { SearchBar, LocationControls } from '@/components/SearchAndLocationControls';
import { DogGridResults } from '@/components/DogGridResults';
import { ViewModeSelector } from '@/components/ViewModeSelector';

type ViewMode = 'text-only' | 'with-images';

const ITEMS_PER_PAGE = 10;
// Feature flag: Hide View Mode selector until images feature is ready
const SHOW_VIEW_MODE_SELECTOR = false;

const DogGrid = () => {
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('All');
  const [ageFilter, setAgeFilter] = useState<AgeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('text-only');
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    latitude, 
    longitude, 
    error: locationError, 
    loading: locationLoading,
    hasLocation,
    requestLocation,
    clearLocation 
  } = useGeolocation();
  
  const userLocation = hasLocation ? { latitude: latitude!, longitude: longitude! } : undefined;
  const { data: dogs = [], isLoading, error } = useDogs(userLocation);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const handleLocationRequest = () => {
    requestLocation();
  };

  const filteredDogs = useDogFilters({
    dogs,
    sizeFilter,
    ageFilter,
    statusFilter,
    searchQuery
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredDogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDogs = filteredDogs.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setSizeFilter('All');
    setAgeFilter('All');
    setStatusFilter('available');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSizeChange = (size: SizeFilter) => {
    setSizeFilter(size);
    setCurrentPage(1);
  };

  const handleAgeChange = (age: AgeFilter) => {
    setAgeFilter(age);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Scroll to top of dog grid when page changes
  useEffect(() => {
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  return (
    <section id="dogs" className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12" ref={gridTopRef}>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Dogs Looking for Homes
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Browse our selection of rescue dogs from trusted shelters across the UK. 
            <span className="block mt-2 text-primary font-medium">Each one deserves a loving forever home.</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div className="lg:w-64 shrink-0">
            <FilterSidebar
              sizeFilter={sizeFilter}
              ageFilter={ageFilter}
              statusFilter={statusFilter}
              onSizeChange={handleSizeChange}
              onAgeChange={handleAgeChange}
              onStatusChange={handleStatusChange}
              onClearFilters={handleClearFilters}
            />
          </div>

        <div className="flex-1">
            {SHOW_VIEW_MODE_SELECTOR && (
              <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
            )}

            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
            />

            <LocationControls
              hasLocation={hasLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              onRequestLocation={handleLocationRequest}
              onClearLocation={clearLocation}
            />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-bold text-lg text-foreground">{filteredDogs.length}</span> {filteredDogs.length === 1 ? 'dog' : 'dogs'}
              </p>
              {filteredDogs.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>

            <DogGridResults
              isLoading={isLoading}
              error={error}
              filteredDogs={filteredDogs}
              paginatedDogs={paginatedDogs}
              viewMode={viewMode}
              hasLocation={hasLocation}
            />

            {!isLoading && !error && filteredDogs.length > 0 && totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DogGrid;

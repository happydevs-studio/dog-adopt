import { useState, useEffect } from 'react';
import RescueCard from './RescueCard';
import { useRescues } from '@/hooks/useRescues';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Loader2 } from 'lucide-react';
import { PaginationControls } from '@/components/PaginationControls';
import { SearchBar, LocationControls } from '@/components/SearchAndLocationControls';
import { useRescueFilters } from '@/hooks/useRescueFilters';

const ITEMS_PER_PAGE = 12;

const RescuesSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
  const { data: rescues = [], isLoading, error } = useRescues(userLocation);

  // Debug logging
  useEffect(() => {
    console.log('Location state changed:', { 
      hasLocation, 
      latitude, 
      longitude, 
      locationError, 
      locationLoading 
    });
  }, [hasLocation, latitude, longitude, locationError, locationLoading]);

  useEffect(() => {
    console.log('Rescues loaded:', rescues.length, 'with location:', !!userLocation);
    if (userLocation && rescues.length > 0) {
      const withDistance = rescues.filter(r => r.distance !== undefined).length;
      console.log(`${withDistance} rescues have calculated distances`);
    }
  }, [rescues, userLocation]);

  const handleLocationRequest = () => {
    console.log('Find Near Me button clicked');
    console.log('Navigator geolocation available:', !!navigator.geolocation);
    console.log('Is secure context:', window.isSecureContext);
    console.log('Current protocol:', window.location.protocol);
    requestLocation();
  };

  const filteredRescues = useRescueFilters({ rescues, searchQuery });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredRescues.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRescues = filteredRescues.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <section id="rescues" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rescue Organizations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse rescue organizations across the UK. Each organization is dedicated to finding loving homes for dogs in need.
          </p>
        </div>

        <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

        <LocationControls
          hasLocation={hasLocation}
          locationLoading={locationLoading}
          locationError={locationError}
          onRequestLocation={handleLocationRequest}
          onClearLocation={clearLocation}
          context="rescues"
        />

        <div className="flex items-center justify-end mb-6">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredRescues.length}</span> organizations found
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
            <p className="font-display text-xl text-foreground mb-2">Error loading rescues</p>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        ) : filteredRescues.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedRescues.map((rescue, index) => (
                <div
                  key={rescue.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <RescueCard rescue={rescue} showDistance={hasLocation} />
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
            <p className="font-display text-xl text-foreground mb-2">No rescues found</p>
            <p className="text-muted-foreground">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RescuesSection;

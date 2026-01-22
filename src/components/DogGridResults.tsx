import { Loader2 } from 'lucide-react';
import DogCard from './DogCard';
import type { Dog } from '@/types/dog';

type ViewMode = 'text-only' | 'with-images';

interface DogGridResultsProps {
  isLoading: boolean;
  error: Error | null;
  filteredDogs: Dog[];
  paginatedDogs: Dog[];
  viewMode: ViewMode;
  hasLocation: boolean;
}

export const DogGridResults = ({
  isLoading,
  error,
  filteredDogs,
  paginatedDogs,
  viewMode,
  hasLocation
}: DogGridResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
        <p className="font-display text-xl text-foreground mb-2">Error loading dogs</p>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  if (filteredDogs.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
        <p className="font-display text-xl text-foreground mb-2">No dogs found</p>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {paginatedDogs.map((dog, index) => (
        <div
          key={dog.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <DogCard dog={dog} viewMode={viewMode} showDistance={hasLocation} />
        </div>
      ))}
    </div>
  );
};

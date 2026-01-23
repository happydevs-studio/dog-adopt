import { Loader2, Search } from 'lucide-react';
import DogCard from './DogCard';
import type { Dog } from '@/types/dog';
import { Button } from '@/components/ui/button';

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
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rescue dogs...</p>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
              <div className="p-5 space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-4 w-full bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-20 bg-muted rounded-full" />
                </div>
                <div className="h-10 w-full bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
        <div className="max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <p className="font-display text-xl text-foreground mb-2">Oops! Something went wrong</p>
          <p className="text-muted-foreground mb-4">
            We're having trouble loading the dogs right now.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredDogs.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
        <div className="max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-primary" />
            </div>
            <p className="font-display text-2xl text-foreground mb-2">No dogs found</p>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms to find more rescue dogs.
            </p>
          </div>
          <div className="space-y-3 text-sm text-left bg-muted/50 rounded-xl p-4">
            <p className="font-medium text-foreground">Suggestions:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Clear all filters to see all available dogs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Try searching for a different breed or location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Check back later - new dogs are added regularly</span>
              </li>
            </ul>
          </div>
        </div>
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

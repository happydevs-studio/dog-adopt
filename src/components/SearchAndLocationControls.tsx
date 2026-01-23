import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, MapPin, Navigation, X, Loader2 } from 'lucide-react';

interface LocationControlsProps {
  hasLocation: boolean;
  locationLoading: boolean;
  locationError: string | null;
  onRequestLocation: () => void;
  onClearLocation: () => void;
}

export const LocationControls = ({
  hasLocation,
  locationLoading,
  locationError,
  onRequestLocation,
  onClearLocation
}: LocationControlsProps) => (
  <div className="mb-4 space-y-2">
    <div className="flex items-center gap-2">
      {!hasLocation && !locationLoading && (
        <Button
          onClick={onRequestLocation}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <MapPin className="w-4 h-4" />
          Sort by Distance
        </Button>
      )}
      
      {locationLoading && (
        <Button
          variant="outline"
          size="sm"
          disabled
          className="gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Getting location...
        </Button>
      )}
      
      {hasLocation && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled
          >
            <Navigation className="w-4 h-4" />
            Sorted by distance
          </Button>
          <Button
            onClick={onClearLocation}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </>
      )}
    </div>
    
    {locationError && (
      <Alert variant="destructive">
        <AlertDescription>{locationError}</AlertDescription>
      </Alert>
    )}
  </div>
);

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
    <Input
      type="search"
      placeholder="Search by name, breed, location, or rescue..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="pl-10 h-12 text-base"
    />
  </div>
);

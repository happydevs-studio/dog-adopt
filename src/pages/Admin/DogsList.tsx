import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Search, List, Layers } from 'lucide-react';
import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';

interface DogsListProps {
  dogs: Dog[];
  rescues: Rescue[];
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: string) => void;
}

export function DogsList({ dogs, rescues, onEdit, onDelete }: DogsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [rescueFilter, setRescueFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('list');

  // Filter and search dogs
  const filteredDogs = useMemo(() => {
    let filtered = dogs;

    // Apply rescue filter
    if (rescueFilter !== 'all') {
      filtered = filtered.filter(dog => dog.rescue === rescueFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dog => 
        dog.name.toLowerCase().includes(query) ||
        dog.breed.toLowerCase().includes(query) ||
        dog.rescue.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [dogs, rescueFilter, searchQuery]);

  // Group dogs by rescue
  const groupedDogs = useMemo(() => {
    const groups: Record<string, Dog[]> = {};
    filteredDogs.forEach(dog => {
      if (!groups[dog.rescue]) {
        groups[dog.rescue] = [];
      }
      groups[dog.rescue].push(dog);
    });
    return groups;
  }, [filteredDogs]);

  const rescueNames = useMemo(() => {
    return [...new Set(dogs.map(dog => dog.rescue))].sort();
  }, [dogs]);

  if (dogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No dogs yet. Click "Add Dog" to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="search"
                placeholder="Search by name, breed, or rescue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Rescue Filter */}
            <Select value={rescueFilter} onValueChange={setRescueFilter}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Filter by rescue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rescues</SelectItem>
                {rescueNames.map((rescueName) => (
                  <SelectItem key={rescueName} value={rescueName}>
                    {rescueName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                title="List view"
                className="flex-1 sm:flex-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grouped')}
                title="Group by rescue"
                className="flex-1 sm:flex-none"
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredDogs.length} of {dogs.length} dog{dogs.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Dogs Display */}
      {filteredDogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No dogs found matching your search criteria.
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="grid gap-4">
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDogs).map(([rescueName, rescueDogs]) => (
            <div key={rescueName} className="space-y-3">
              <h3 className="font-display text-lg font-semibold text-foreground sticky top-0 bg-background py-2 z-10">
                {rescueName} ({rescueDogs.length})
              </h3>
              <div className="grid gap-4">
                {rescueDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Extracted DogCard component for reusability
function DogCard({ 
  dog, 
  onEdit, 
  onDelete 
}: { 
  dog: Dog; 
  onEdit: (dog: Dog) => void; 
  onDelete: (dogId: string) => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
        <img
          src={dog.image}
          alt={dog.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">{dog.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {dog.breed} • {dog.age} • {dog.size} • {dog.location}
          </p>
          <p className="text-xs text-muted-foreground truncate">{dog.rescue}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="icon" onClick={() => onEdit(dog)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {dog.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove {dog.name} from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(dog.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import type { Dog } from '@/types/dog';

interface DogsListProps {
  dogs: Dog[];
  onEdit: (dog: Dog) => void;
  onDelete: (dogId: string) => void;
}

export function DogsList({ dogs, onEdit, onDelete }: DogsListProps) {
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
    <div className="grid gap-4">
      {dogs.map((dog) => (
        <Card key={dog.id}>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
            <img
              src={dog.image}
              alt={dog.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">{dog.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {dog.breed} • {dog.age} • {dog.size} • {dog.location}
              </p>
              <p className="text-xs text-muted-foreground">{dog.rescue}</p>
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
      ))}
    </div>
  );
}

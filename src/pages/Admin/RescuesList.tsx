import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import type { Rescue } from '@/hooks/useRescues';

interface RescuesListProps {
  rescues: Rescue[];
  onEdit: (rescue: Rescue) => void;
  onDelete: (rescueId: string) => void;
}

export function RescuesList({ rescues, onEdit, onDelete }: RescuesListProps) {
  if (rescues.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No rescues yet. Click "Add Rescue" to get started.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {rescues.map((rescue) => (
        <Card key={rescue.id}>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">{rescue.name}</h3>
              <p className="text-sm text-muted-foreground">
                {rescue.type} • {rescue.region}
              </p>
              {rescue.website && (
                <a 
                  href={rescue.website.startsWith('http') ? rescue.website : `https://${rescue.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {rescue.website}
                </a>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="icon" onClick={() => onEdit(rescue)}>
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
                    <AlertDialogTitle>Delete {rescue.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove {rescue.name} from the database.
                      {' '}Note: Rescues with associated dogs cannot be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(rescue.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

import { Badge } from '@/components/ui/badge';
import { Navigation } from 'lucide-react';
import type { StatusFilter } from '@/types/dog';
import { formatStatus, getStatusVariant } from './DogCard.helpers';

interface DogBadgesProps {
  status: StatusFilter;
  age: string;
  size: string;
  showDistance?: boolean;
  distance?: number;
}

export const DogBadges = ({ status, age, size, showDistance, distance }: DogBadgesProps) => (
  <div className="flex gap-2 mb-2 flex-wrap">
    <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>
    <Badge variant="warm">{age}</Badge>
    <Badge variant="secondary">{size}</Badge>
    {showDistance && distance !== undefined && (
      <Badge variant="outline" className="gap-1">
        <Navigation className="w-3 h-3" />
        {distance} km
      </Badge>
    )}
  </div>
);

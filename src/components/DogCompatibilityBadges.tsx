import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { Dog } from '@/types/dog';

interface DogCompatibilityBadgesProps {
  dog: Pick<Dog, 'goodWithKids' | 'goodWithDogs' | 'goodWithCats'>;
}

export const DogCompatibilityBadges = ({ dog }: DogCompatibilityBadgesProps) => (
  <div className="flex flex-wrap gap-2">
    {dog.goodWithKids && (
      <Badge variant="success" className="text-xs">
        <Users className="w-3 h-3 mr-1" />
        Good with kids
      </Badge>
    )}
    {dog.goodWithDogs && (
      <Badge variant="success" className="text-xs">
        Good with dogs
      </Badge>
    )}
    {dog.goodWithCats && (
      <Badge variant="success" className="text-xs">
        Good with cats
      </Badge>
    )}
  </div>
);

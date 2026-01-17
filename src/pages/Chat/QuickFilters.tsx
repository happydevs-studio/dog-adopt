import { Badge } from '@/components/ui/badge';

interface QuickFiltersProps {
  onFilterClick: (question: string) => void;
}

const filters = [
  { label: 'Small Dogs', question: 'Show me small dogs' },
  { label: 'Puppies', question: 'Show me puppies' },
  { label: 'Good with Kids', question: 'Dogs good with kids' },
  { label: 'Good with Cats', question: 'Dogs good with cats' },
];

export function QuickFilters({ onFilterClick }: QuickFiltersProps) {
  return (
    <div className="mb-4">
      <p className="text-xs text-muted-foreground mb-2">Quick filters:</p>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge
            key={filter.label}
            variant="outline"
            className="cursor-pointer hover:bg-secondary text-xs"
            onClick={() => onFilterClick(filter.question)}
          >
            {filter.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

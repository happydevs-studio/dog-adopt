import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X } from 'lucide-react';
import type { SizeFilter, AgeFilter } from '@/types/dog';

interface FilterSidebarProps {
  sizeFilter: SizeFilter;
  ageFilter: AgeFilter;
  onSizeChange: (size: SizeFilter) => void;
  onAgeChange: (age: AgeFilter) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({
  sizeFilter,
  ageFilter,
  onSizeChange,
  onAgeChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const hasActiveFilters = sizeFilter !== 'All' || ageFilter !== 'All';

  return (
    <aside className="bg-card rounded-2xl p-6 shadow-soft space-y-6 sticky top-24">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">Size</Label>
          <RadioGroup value={sizeFilter} onValueChange={(value) => onSizeChange(value as SizeFilter)}>
            {['All', 'Small', 'Medium', 'Large'].map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <RadioGroupItem value={size} id={`size-${size}`} />
                <Label htmlFor={`size-${size}`} className="text-muted-foreground cursor-pointer">
                  {size}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="border-t border-border pt-4">
          <Label className="text-sm font-medium text-foreground mb-3 block">Age</Label>
          <RadioGroup value={ageFilter} onValueChange={(value) => onAgeChange(value as AgeFilter)}>
            {['All', 'Puppy', 'Young', 'Adult', 'Senior'].map((age) => (
              <div key={age} className="flex items-center space-x-2">
                <RadioGroupItem value={age} id={`age-${age}`} />
                <Label htmlFor={`age-${age}`} className="text-muted-foreground cursor-pointer">
                  {age}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { X, ChevronDown } from 'lucide-react';
import type { SizeFilter, AgeFilter, StatusFilter } from '@/types/dog';

interface FilterSidebarProps {
  sizeFilter: SizeFilter;
  ageFilter: AgeFilter;
  statusFilter: StatusFilter;
  onSizeChange: (size: SizeFilter) => void;
  onAgeChange: (age: AgeFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
  onClearFilters: () => void;
}

const FilterSidebar = ({
  sizeFilter,
  ageFilter,
  statusFilter,
  onSizeChange,
  onAgeChange,
  onStatusChange,
  onClearFilters,
}: FilterSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = sizeFilter !== 'All' || ageFilter !== 'All' || statusFilter !== 'available';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <aside className="bg-card rounded-xl md:rounded-2xl p-3 md:p-6 shadow-soft sticky top-24">
        <div className="flex items-center justify-between mb-3 md:mb-0">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 p-0 hover:bg-transparent w-full justify-start md:justify-center">
              <h2 className="font-display text-base md:text-lg lg:text-xl font-semibold text-foreground">Filters</h2>
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              {hasActiveFilters && !isOpen && (
                <span className="ml-auto md:hidden text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsOpen(true);
                onClearFilters();
              }} 
              className="text-muted-foreground text-xs md:text-sm md:ml-0"
            >
              <X className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-3 md:space-y-4 lg:space-y-6 pt-3 md:pt-4 lg:pt-6">
          <div>
            <Label className="text-xs md:text-sm font-semibold text-foreground mb-2 block">Size</Label>
            <RadioGroup value={sizeFilter} onValueChange={(value) => onSizeChange(value as SizeFilter)}>
              {['All', 'Small', 'Medium', 'Large'].map((size) => (
                <div key={size} className="flex items-center space-x-2 py-0.5">
                  <RadioGroupItem value={size} id={`size-${size}`} />
                  <Label htmlFor={`size-${size}`} className="text-muted-foreground cursor-pointer text-xs md:text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="border-t border-border pt-3 md:pt-4">
            <Label className="text-xs md:text-sm font-semibold text-foreground mb-2 block">Age</Label>
            <RadioGroup value={ageFilter} onValueChange={(value) => onAgeChange(value as AgeFilter)}>
              {['All', 'Puppy', 'Young', 'Adult', 'Senior'].map((age) => (
                <div key={age} className="flex items-center space-x-2 py-0.5">
                  <RadioGroupItem value={age} id={`age-${age}`} />
                  <Label htmlFor={`age-${age}`} className="text-muted-foreground cursor-pointer text-xs md:text-sm">
                    {age}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Show simplified status on mobile, full list on desktop */}
          <div className="border-t border-border pt-3 md:pt-4">
            <Label className="text-xs md:text-sm font-semibold text-foreground mb-2 block">Status</Label>
            <RadioGroup value={statusFilter} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
              {/* Show only Available on mobile, all options on desktop */}
              <div className="flex items-center space-x-2 py-0.5">
                <RadioGroupItem value="available" id="status-available" />
                <Label htmlFor="status-available" className="text-muted-foreground cursor-pointer text-xs md:text-sm">
                  Available
                </Label>
              </div>
              {/* Additional statuses only visible on desktop */}
              {[
                { value: 'reserved', label: 'Reserved' },
                { value: 'adopted', label: 'Adopted' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'fostered', label: 'Fostered' },
                { value: 'withdrawn', label: 'Withdrawn' },
              ].map((status) => (
                <div key={status.value} className="hidden md:flex items-center space-x-2 py-0.5">
                  <RadioGroupItem value={status.value} id={`status-${status.value}`} />
                  <Label htmlFor={`status-${status.value}`} className="text-muted-foreground cursor-pointer text-xs md:text-sm">
                    {status.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CollapsibleContent>
      </aside>
    </Collapsible>
  );
};

export default FilterSidebar;

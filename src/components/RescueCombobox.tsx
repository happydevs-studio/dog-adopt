import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Rescue } from "@/hooks/useRescues";

interface RescueComboboxProps {
  value: string; // rescue_id
  onChange: (value: string) => void;
  rescues: Rescue[];
  placeholder?: string;
}

export function RescueCombobox({
  value = "",
  onChange,
  rescues,
  placeholder = "Select rescue organisation...",
}: RescueComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedRescue = React.useMemo(() => {
    return rescues.find((rescue) => rescue.id === value);
  }, [rescues, value]);

  const filteredRescues = React.useMemo(() => {
    if (!search) return rescues;
    const searchLower = search.toLowerCase();
    return rescues.filter(
      (rescue) =>
        rescue.name.toLowerCase().includes(searchLower) ||
        rescue.region.toLowerCase().includes(searchLower)
    );
  }, [search, rescues]);

  const handleSelect = (rescueId: string) => {
    onChange(rescueId === value ? "" : rescueId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className={cn(!selectedRescue && "text-muted-foreground")}>
            {selectedRescue ? selectedRescue.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search rescue organisations..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No rescue organisation found.</CommandEmpty>
            <CommandGroup>
              {filteredRescues.map((rescue) => {
                const isSelected = value === rescue.id;
                return (
                  <CommandItem
                    key={rescue.id}
                    value={rescue.id}
                    onSelect={() => handleSelect(rescue.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{rescue.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {rescue.region}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

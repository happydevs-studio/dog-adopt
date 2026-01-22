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

export interface FreeTextComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

/**
 * Combobox that allows free text entry with suggestions
 */
export function FreeTextCombobox({
  value,
  onChange,
  suggestions,
  placeholder = "Enter value...",
  searchPlaceholder = "Search or enter...",
  className,
}: FreeTextComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState(value);

  // Sync search state with value prop when it changes externally
  React.useEffect(() => {
    setSearch(value);
  }, [value]);

  const filteredSuggestions = React.useMemo(() => {
    if (!search) return suggestions;
    const searchLower = search.toLowerCase();
    return suggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(searchLower)
    );
  }, [search, suggestions]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setSearch(newValue);
    // Allow free text entry
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">No suggestions found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to use "{search}"
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredSuggestions.map((suggestion) => {
                const isSelected = value === suggestion;
                return (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {suggestion}
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

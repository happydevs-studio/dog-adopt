import * as React from "react";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { ALL_DOG_BREEDS } from "@/data/dogBreeds";

interface BreedComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
}

export function BreedCombobox({
  value = [],
  onChange,
  placeholder = "Select breeds...",
  maxSelections,
}: BreedComboboxProps) {
  return (
    <MultiSelectCombobox
      options={ALL_DOG_BREEDS}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search breeds..."
      emptyText="No breed found."
      maxSelections={maxSelections}
    />
  );
}

import * as React from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
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
  const options: ComboboxOption[] = React.useMemo(() => 
    rescues.map((rescue) => ({
      value: rescue.id,
      label: rescue.name,
      description: rescue.region,
      keywords: [rescue.region],
    })),
    [rescues]
  );

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search rescue organisations..."
      emptyText="No rescue organisation found."
    />
  );
}

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreedCombobox } from '@/components/BreedCombobox';
import { handleBreedChange } from '@/utils/breedFormHelpers';
import type { DogFormData } from '../../Admin.types';

interface BasicInfoSectionProps {
  formData: DogFormData;
  onFormDataChange: (data: DogFormData) => void;
  isEditing?: boolean;
}

export function BasicInfoSection({ formData, onFormDataChange, isEditing = false }: BasicInfoSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Breed(s)</Label>
        <BreedCombobox
          value={formData.breeds}
          onChange={(breeds) => onFormDataChange(handleBreedChange(breeds, formData, isEditing))}
          placeholder="Select one or more breeds..."
        />
        <p className="text-xs text-muted-foreground">
          Select multiple breeds for cross-breeds or mixes. Size will be auto-populated for new dogs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Select value={formData.age} onValueChange={(v) => onFormDataChange({ ...formData, age: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Puppy">Puppy</SelectItem>
              <SelectItem value="Young">Young</SelectItem>
              <SelectItem value="Adult">Adult</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Select value={formData.size} onValueChange={(v) => onFormDataChange({ ...formData, size: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Small">Small</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender} onValueChange={(v) => onFormDataChange({ ...formData, gender: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}

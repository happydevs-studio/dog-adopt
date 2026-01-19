/* eslint-disable max-lines-per-function */
// Large dialog component with many form fields - disabling line count rule
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X } from 'lucide-react';
import { BreedCombobox } from '@/components/BreedCombobox';
import { RescueCombobox } from '@/components/RescueCombobox';
import { LocationCombobox } from '@/components/LocationCombobox';
import { handleBreedChange } from '@/utils/breedFormHelpers';
import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';
import type { DogFormData } from '../Admin.types';

interface DogFormDialogProps {
  open: boolean;
  editingDog: Dog | null;
  formData: DogFormData;
  rescues: Rescue[];
  imagePreview: string | null;
  imageFile: File | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: DogFormData) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DogFormDialog({
  open,
  editingDog,
  formData,
  rescues,
  imagePreview,
  imageFile,
  isSubmitting,
  onOpenChange,
  onFormDataChange,
  onFileChange,
  onClearImage,
  onSubmit,
}: DogFormDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDog ? 'Edit Dog' : 'Add New Dog'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={(breeds) => onFormDataChange(handleBreedChange(breeds, formData, !!editingDog))}
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

          <div className="space-y-2">
            <Label htmlFor="status">Adoption Status</Label>
            <Select value={formData.status} onValueChange={(v) => onFormDataChange({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="adopted">Adopted</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="fostered">Fostered</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status_notes">Status Notes (Optional)</Label>
            <Textarea
              id="status_notes"
              value={formData.status_notes}
              onChange={(e) => onFormDataChange({ ...formData, status_notes: e.target.value })}
              rows={2}
              placeholder="Optional notes about the adoption status..."
            />
          </div>

          <div className="space-y-2">
            <Label>Birth Date (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter the dog's birth date if known. This will automatically calculate their age category.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="text-xs">Year</Label>
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="YYYY"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.birthYear}
                  onChange={(e) => onFormDataChange({ ...formData, birthYear: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthMonth" className="text-xs">Month</Label>
                <Input
                  id="birthMonth"
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={formData.birthMonth}
                  onChange={(e) => onFormDataChange({ ...formData, birthMonth: e.target.value })}
                  disabled={!formData.birthYear}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDay" className="text-xs">Day</Label>
                <Input
                  id="birthDay"
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={formData.birthDay}
                  onChange={(e) => onFormDataChange({ ...formData, birthDay: e.target.value })}
                  disabled={!formData.birthYear || !formData.birthMonth}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Year is required if you provide month or day. If birth date is not available, the manual age category will be used.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescueSinceDate">In Rescue Since (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Enter the date the dog was taken into the rescue if known.
            </p>
            <Input
              id="rescueSinceDate"
              type="date"
              value={formData.rescueSinceDate}
              onChange={(e) => onFormDataChange({ ...formData, rescueSinceDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescue">Rescue Organisation</Label>
              <RescueCombobox
                value={formData.rescue_id}
                onChange={(rescue_id) => {
                  if (!editingDog) {
                    const selectedRescue = rescues.find(r => r.id === rescue_id);
                    if (selectedRescue) {
                      onFormDataChange({ ...formData, rescue_id, location: selectedRescue.region });
                    } else {
                      onFormDataChange({ ...formData, rescue_id });
                    }
                  } else {
                    onFormDataChange({ ...formData, rescue_id });
                  }
                }}
                rescues={rescues}
                placeholder="Select rescue organisation..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <LocationCombobox
                value={formData.location}
                onChange={(location) => onFormDataChange({ ...formData, location })}
                placeholder="Select or enter location..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dog Image (Optional)</Label>
            <p className="text-xs text-muted-foreground">
              If no image is uploaded, a default "Coming Soon" image will be used.
            </p>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-32 h-32">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  {imageFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={onClearImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </Button>
                {imageFile && (
                  <span className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {imageFile.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileUrl">Dog Profile URL (Optional)</Label>
            <Input
              id="profileUrl"
              type="url"
              value={formData.profileUrl}
              onChange={(e) => onFormDataChange({ ...formData, profileUrl: e.target.value })}
              placeholder="https://rescue-website.com/dogs/dog-name"
            />
            <p className="text-xs text-muted-foreground">
              Link to the dog's profile page on the rescue's website
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="good_with_kids"
                checked={formData.good_with_kids}
                onCheckedChange={(c) => onFormDataChange({ ...formData, good_with_kids: !!c })}
              />
              <Label htmlFor="good_with_kids">Good with kids</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="good_with_dogs"
                checked={formData.good_with_dogs}
                onCheckedChange={(c) => onFormDataChange({ ...formData, good_with_dogs: !!c })}
              />
              <Label htmlFor="good_with_dogs">Good with dogs</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="good_with_cats"
                checked={formData.good_with_cats}
                onCheckedChange={(c) => onFormDataChange({ ...formData, good_with_cats: !!c })}
              />
              <Label htmlFor="good_with_cats">Good with cats</Label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingDog ? 'Save Changes' : 'Add Dog'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

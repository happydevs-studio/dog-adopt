/* eslint-disable max-lines-per-function */
// Large dialog component with many form fields - disabling line count rule
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { Rescue } from '@/hooks/useRescues';
import type { RescueFormData } from '../Admin.types';

interface RescueFormDialogProps {
  open: boolean;
  editingRescue: Rescue | null;
  formData: RescueFormData;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: RescueFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function RescueFormDialog({
  open,
  editingRescue,
  formData,
  isSubmitting,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: RescueFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRescue ? 'Edit Rescue' : 'Add New Rescue'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rescue_name">Name</Label>
            <Input
              id="rescue_name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescue_type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => onFormDataChange({ ...formData, type: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Foster">Foster</SelectItem>
                  <SelectItem value="Sanctuary">Sanctuary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescue_region">Region</Label>
              <Input
                id="rescue_region"
                value={formData.region}
                onChange={(e) => onFormDataChange({ ...formData, region: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescue_website">Website (Optional)</Label>
            <Input
              id="rescue_website"
              type="url"
              value={formData.website}
              onChange={(e) => onFormDataChange({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescue_phone">Phone (Optional)</Label>
              <Input
                id="rescue_phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescue_email">Email (Optional)</Label>
              <Input
                id="rescue_email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescue_address">Address (Optional)</Label>
            <Textarea
              id="rescue_address"
              value={formData.address}
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescue_postcode">Postcode (Optional)</Label>
              <Input
                id="rescue_postcode"
                value={formData.postcode}
                onChange={(e) => onFormDataChange({ ...formData, postcode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescue_charity_number">Charity Number (Optional)</Label>
              <Input
                id="rescue_charity_number"
                value={formData.charity_number}
                onChange={(e) => onFormDataChange({ ...formData, charity_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rescue_latitude">Latitude (Optional)</Label>
              <Input
                id="rescue_latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => onFormDataChange({ ...formData, latitude: e.target.value })}
                placeholder="51.5074"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescue_longitude">Longitude (Optional)</Label>
              <Input
                id="rescue_longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => onFormDataChange({ ...formData, longitude: e.target.value })}
                placeholder="-0.1278"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rescue_contact_notes">Contact Notes (Optional)</Label>
            <Textarea
              id="rescue_contact_notes"
              value={formData.contact_notes}
              onChange={(e) => onFormDataChange({ ...formData, contact_notes: e.target.value })}
              rows={2}
              placeholder="Internal notes about contact information..."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingRescue ? 'Save Changes' : 'Add Rescue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { Rescue } from '@/hooks/useRescues';
import { supabase } from '@/integrations/supabase/client';
import type { RescueFormData } from '../Admin.types';
import { initialRescueFormData } from '../Admin.types';
import {
  buildCreateRescueParams,
  buildUpdateRescueParams,
} from '../Admin.helpers';

export interface RescueDialogState {
  isRescueDialogOpen: boolean;
  editingRescue: Rescue | null;
  rescueFormData: RescueFormData;
  isRescueSubmitting: boolean;
}

export function createOpenRescueDialogHandler(
  setState: (updates: Partial<RescueDialogState>) => void
) {
  return (rescue?: Rescue) => {
    if (rescue) {
      setState({
        editingRescue: rescue,
        rescueFormData: {
          name: rescue.name,
          type: rescue.type,
          region: rescue.region,
          website: rescue.website || '',
          phone: rescue.phone || '',
          email: rescue.email || '',
          address: rescue.address || '',
          postcode: rescue.postcode || '',
          charity_number: rescue.charity_number || '',
          contact_notes: rescue.contact_notes || '',
          latitude: rescue.latitude ? String(rescue.latitude) : '',
          longitude: rescue.longitude ? String(rescue.longitude) : '',
        },
        isRescueDialogOpen: true,
      });
    } else {
      setState({
        editingRescue: null,
        rescueFormData: initialRescueFormData,
        isRescueDialogOpen: true,
      });
    }
  };
}

export async function handleRescueSubmit(
  rescueFormData: RescueFormData,
  editingRescue: Rescue | null,
  toast: (options: { title: string; description?: string; variant?: string }) => void,
  setState: (updates: Partial<RescueDialogState>) => void,
  onSuccess: () => void
): Promise<void> {
  if (!rescueFormData.name.trim()) {
    toast({
      title: 'Validation Error',
      description: 'Rescue name is required',
      variant: 'destructive'
    });
    return;
  }

  setState({ isRescueSubmitting: true });

  try {
    if (editingRescue) {
      const params = buildUpdateRescueParams(editingRescue.id, rescueFormData);
      const { error } = await supabase.schema('dogadopt_api').rpc('update_rescue', params);
      if (error) throw error;
      toast({ title: 'Success', description: 'Rescue updated successfully!' });
    } else {
      const params = buildCreateRescueParams(rescueFormData);
      const { error } = await supabase.schema('dogadopt_api').rpc('create_rescue', params);
      if (error) throw error;
      toast({ title: 'Success', description: 'Rescue added successfully!' });
    }

    setState({ isRescueDialogOpen: false });
    onSuccess();
  } catch (error) {
    console.error('Error saving rescue:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to save rescue',
      variant: 'destructive'
    });
  } finally {
    setState({ isRescueSubmitting: false });
  }
}

export async function handleRescueDelete(
  rescueId: string,
  toast: (options: { title: string; description?: string; variant?: string }) => void,
  onSuccess: () => void
): Promise<void> {
  if (!confirm('Are you sure you want to delete this rescue? All associated dogs will need to be reassigned.')) return;

  try {
    const { error } = await supabase
      .from('rescues')
      .delete()
      .eq('id', rescueId);

    if (error) throw error;
    toast({ title: 'Success', description: 'Rescue deleted successfully!' });
    onSuccess();
  } catch (error) {
    console.error('Error deleting rescue:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to delete rescue',
      variant: 'destructive'
    });
  }
}

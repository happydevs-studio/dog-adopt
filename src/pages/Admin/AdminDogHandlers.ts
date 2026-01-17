import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';
import { supabase } from '@/integrations/supabase/client';
import type { DogFormData } from '../Admin.types';
import { initialFormData } from '../Admin.types';
import {
  validateDogForm,
  validateImageFile,
  buildDogDataPayload,
  buildCreateDogParams,
  buildUpdateDogParams,
} from '../Admin.helpers';

export interface DogDialogState {
  isDialogOpen: boolean;
  editingDog: Dog | null;
  formData: DogFormData;
  imageFile: File | null;
  imagePreview: string | null;
  isSubmitting: boolean;
}

export function createOpenDialogHandler(
  rescues: Rescue[],
  setState: (updates: Partial<DogDialogState>) => void
) {
  return (dog?: Dog) => {
    if (dog) {
      const rescue = rescues.find(r => r.name === dog.rescue);
      const breeds = dog.breeds || (dog.breed ? dog.breed.split(',').map(b => b.trim()) : []);
      
      setState({
        editingDog: dog,
        formData: {
          name: dog.name,
          breeds: breeds,
          age: dog.age,
          birthYear: dog.birthYear ? String(dog.birthYear) : '',
          birthMonth: dog.birthMonth ? String(dog.birthMonth) : '',
          birthDay: dog.birthDay ? String(dog.birthDay) : '',
          rescueSinceDate: dog.rescueSinceDate || '',
          size: dog.size,
          gender: dog.gender,
          status: dog.status,
          status_notes: dog.statusNotes || '',
          location: dog.location,
          rescue_id: rescue?.id || '',
          image: dog.image,
          profileUrl: dog.profileUrl || '',
          description: dog.description,
          good_with_kids: dog.goodWithKids,
          good_with_dogs: dog.goodWithDogs,
          good_with_cats: dog.goodWithCats,
        },
        imagePreview: dog.image,
        imageFile: null,
        isDialogOpen: true,
      });
    } else {
      setState({
        editingDog: null,
        formData: initialFormData,
        imagePreview: null,
        imageFile: null,
        isDialogOpen: true,
      });
    }
  };
}

export function createFileChangeHandler(
  setState: (updates: Partial<DogDialogState>) => void,
  toast: (options: { title: string; description?: string; variant?: string }) => void
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({ title: 'Error', description: validation.error, variant: 'destructive' });
      return;
    }
    
    setState({
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    });
  };
}

export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('dog-adopt-images')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('dog-adopt-images')
    .getPublicUrl(fileName);

  return publicUrl;
}

export function createClearImageHandler(
  editingDog: Dog | null,
  fileInputRef: React.RefObject<HTMLInputElement>,
  setState: (updates: Partial<DogDialogState>) => void
) {
  return () => {
    setState({
      imageFile: null,
      imagePreview: editingDog?.image || null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
}

export async function handleDogSubmit(
  formData: DogFormData,
  imageFile: File | null,
  editingDog: Dog | null,
  toast: (options: { title: string; description?: string; variant?: string }) => void,
  setState: (updates: Partial<DogDialogState>) => void,
  onSuccess: () => void
): Promise<void> {
  const validation = validateDogForm(formData);
  if (!validation.isValid) {
    toast({ title: 'Validation Error', description: validation.error, variant: 'destructive' });
    return;
  }

  setState({ isSubmitting: true });

  try {
    let imageUrl = formData.image;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const dogData = buildDogDataPayload(formData, imageUrl);

    if (editingDog) {
      const params = buildUpdateDogParams(editingDog.id, dogData, formData.breeds);
      const { error } = await supabase.schema('dogadopt_api').rpc('update_dog', params);
      if (error) throw error;
      toast({ title: 'Success', description: 'Dog updated successfully!' });
    } else {
      const params = buildCreateDogParams(dogData, formData.breeds);
      const { error } = await supabase.schema('dogadopt_api').rpc('create_dog', params);
      if (error) throw error;
      toast({ title: 'Success', description: 'Dog added successfully!' });
    }

    setState({ isDialogOpen: false });
    onSuccess();
  } catch (error) {
    console.error('Error saving dog:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to save dog',
      variant: 'destructive'
    });
  } finally {
    setState({ isSubmitting: false });
  }
}

export async function handleDogDelete(
  dogId: string,
  toast: (options: { title: string; description?: string; variant?: string }) => void,
  onSuccess: () => void
): Promise<void> {
  if (!confirm('Are you sure you want to delete this dog?')) return;

  try {
    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', dogId);

    if (error) throw error;
    toast({ title: 'Success', description: 'Dog deleted successfully!' });
    onSuccess();
  } catch (error) {
    console.error('Error deleting dog:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to delete dog',
      variant: 'destructive'
    });
  }
}

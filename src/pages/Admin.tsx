import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogs';
import { useRescues } from '@/hooks/useRescues';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';
import { DevBypassBanner } from '@/components/auth/DevBypassBanner';
import { DEFAULT_DOG_IMAGE } from '@/lib/constants';
import type { DogFormData, RescueFormData } from './Admin.types';
import { initialFormData, initialRescueFormData } from './Admin.types';
import {
  validateDogForm,
  validateImageFile,
  buildDogDataPayload,
  buildCreateDogParams,
  buildUpdateDogParams,
  buildCreateRescueParams,
  buildUpdateRescueParams,
} from './Admin.helpers';
import { AdminHeader } from './Admin/AdminHeader';
import { DogFormDialog } from './Admin/DogFormDialog';
import { RescueFormDialog } from './Admin/RescueFormDialog';
import { DogsList } from './Admin/DogsList';
import { RescuesList } from './Admin/RescuesList';

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading, signOut, isDevBypass } = useAuth();
  const { data: dogs = [], isLoading: dogsLoading, refetch } = useDogs();
  const { data: rescues = [] } = useRescues();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const [formData, setFormData] = useState<DogFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rescue management state
  const [isRescueDialogOpen, setIsRescueDialogOpen] = useState(false);
  const [editingRescue, setEditingRescue] = useState<Rescue | null>(null);
  const [rescueFormData, setRescueFormData] = useState<RescueFormData>(initialRescueFormData);
  const [isRescueSubmitting, setIsRescueSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive'
      });
      navigate('/');
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  const handleOpenDialog = (dog?: Dog) => {
    if (dog) {
      setEditingDog(dog);
      // Find rescue_id from rescue name
      const rescue = rescues.find(r => r.name === dog.rescue);
      // Parse breeds from the breed string (could be comma-separated)
      const breeds = dog.breeds || (dog.breed ? dog.breed.split(',').map(b => b.trim()) : []);
      setFormData({
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
      });
      setImagePreview(dog.image);
    } else {
      setEditingDog(null);
      setFormData(initialFormData);
      setImagePreview(null);
    }
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({ title: 'Error', description: validation.error, variant: 'destructive' });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
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
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(editingDog?.image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        imageUrl = await uploadImage(imageFile);
        setIsUploading(false);
      }

      // Use default image if no image is provided
      if (!imageUrl) {
        imageUrl = DEFAULT_DOG_IMAGE;
      }

      // Validate form
      const validation = validateDogForm(formData);
      if (!validation.isValid) {
        toast({ title: 'Error', description: validation.error, variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      const dogData = buildDogDataPayload(formData, imageUrl);

      if (editingDog) {
        const params = buildUpdateDogParams(editingDog.id, dogData, formData.breeds);
        const { error } = await supabase
          .schema('dogadopt_api')
          .rpc('update_dog', params);

        if (error) throw error;
      } else {
        const params = buildCreateDogParams(dogData, formData.breeds);
        const { error } = await supabase
          .schema('dogadopt_api')
          .rpc('create_dog', params);

        if (error) throw error;
      }

      toast({ 
        title: 'Success', 
        description: editingDog ? 'Dog updated successfully' : 'Dog added successfully' 
      });

      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (dogId: string) => {
    try {
      // Use API layer delete function
      const { error } = await supabase
        .schema('dogadopt_api')
        .rpc('delete_dog', {
        p_dog_id: dogId
      });

      if (error) throw error;
      toast({ title: 'Success', description: 'Dog removed successfully' });
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete dog';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Rescue management handlers
  const handleOpenRescueDialog = (rescue?: Rescue) => {
    if (rescue) {
      setEditingRescue(rescue);
      setRescueFormData({
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
      });
    } else {
      setEditingRescue(null);
      setRescueFormData(initialRescueFormData);
    }
    setIsRescueDialogOpen(true);
  };

  const handleRescueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRescueSubmitting(true);

    try {
      if (editingRescue) {
        const params = buildUpdateRescueParams(editingRescue.id, rescueFormData);
        const { error } = await supabase
          .schema('dogadopt_api')
          .rpc('update_rescue', params);

        if (error) throw error;
      } else {
        const params = buildCreateRescueParams(rescueFormData);
        const { error } = await supabase
          .schema('dogadopt_api')
          .rpc('create_rescue', params);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: editingRescue ? 'Rescue updated successfully' : 'Rescue added successfully'
      });

      setIsRescueDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsRescueSubmitting(false);
    }
  };

  const handleRescueDelete = async (rescueId: string) => {
    try {
      const { error } = await supabase
        .schema('dogadopt_api')
        .rpc('delete_rescue', {
          p_rescue_id: rescueId
        });

      if (error) throw error;
      toast({ title: 'Success', description: 'Rescue removed successfully' });
      queryClient.invalidateQueries({ queryKey: ['rescues'] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete rescue';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || dogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {isDevBypass && <DevBypassBanner />}
      <AdminHeader userEmail={user.email} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dogs" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="dogs">Dogs</TabsTrigger>
            <TabsTrigger value="rescues">Rescues</TabsTrigger>
          </TabsList>

          <TabsContent value="dogs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">Manage Dogs</h1>
              <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </div>

            <DogFormDialog
              open={isDialogOpen}
              editingDog={editingDog}
              formData={formData}
              rescues={rescues}
              imagePreview={imagePreview}
              imageFile={imageFile}
              isSubmitting={isSubmitting}
              onOpenChange={setIsDialogOpen}
              onFormDataChange={setFormData}
              onFileChange={handleFileChange}
              onClearImage={clearImage}
              onSubmit={handleSubmit}
            />

            <DogsList
              dogs={dogs}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          </TabsContent>

      <TabsContent value="rescues">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Manage Rescues</h1>
          <Button onClick={() => handleOpenRescueDialog()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Rescue
          </Button>
        </div>

        <RescueFormDialog
          open={isRescueDialogOpen}
          editingRescue={editingRescue}
          formData={rescueFormData}
          isSubmitting={isRescueSubmitting}
          onOpenChange={setIsRescueDialogOpen}
          onFormDataChange={setRescueFormData}
          onSubmit={handleRescueSubmit}
        />

        <RescuesList
          rescues={rescues}
          onEdit={handleOpenRescueDialog}
          onDelete={handleRescueDelete}
        />
      </TabsContent>
      </Tabs>
    </main>
  </div>
);
};

export default Admin;

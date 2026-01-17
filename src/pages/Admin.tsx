import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDogs } from '@/hooks/useDogs';
import { useRescues } from '@/hooks/useRescues';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DevBypassBanner } from '@/components/auth/DevBypassBanner';
import { AdminHeader } from './Admin/AdminHeader';
import { DogFormDialog } from './Admin/DogFormDialog';
import { RescueFormDialog } from './Admin/RescueFormDialog';
import { DogsList } from './Admin/DogsList';
import { RescuesList } from './Admin/RescuesList';
import { useAdminState } from './Admin/useAdminState';

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading, signOut, isDevBypass } = useAuth();
  const { data: dogs = [], isLoading: dogsLoading } = useDogs();
  const { data: rescues = [] } = useRescues();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const adminState = useAdminState(rescues);

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
              <Button onClick={() => adminState.handleOpenDialog()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Dog
              </Button>
            </div>

            <DogFormDialog
              open={adminState.isDialogOpen}
              editingDog={adminState.editingDog}
              formData={adminState.formData}
              rescues={rescues}
              imagePreview={adminState.imagePreview}
              imageFile={adminState.imageFile}
              isSubmitting={adminState.isSubmitting}
              onOpenChange={adminState.setIsDialogOpen}
              onFormDataChange={adminState.setFormData}
              onFileChange={adminState.handleFileChange}
              onClearImage={adminState.handleClearImage}
              onSubmit={adminState.handleSubmit}
            />

            <DogsList
              dogs={dogs}
              onEdit={adminState.handleOpenDialog}
              onDelete={adminState.handleDelete}
            />
          </TabsContent>

          <TabsContent value="rescues">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">Manage Rescues</h1>
              <Button onClick={() => adminState.handleOpenRescueDialog()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Rescue
              </Button>
            </div>

            <RescueFormDialog
              open={adminState.isRescueDialogOpen}
              editingRescue={adminState.editingRescue}
              formData={adminState.rescueFormData}
              isSubmitting={adminState.isRescueSubmitting}
              onOpenChange={adminState.setIsRescueDialogOpen}
              onFormDataChange={adminState.setRescueFormData}
              onSubmit={adminState.handleRescueSubmit}
            />

            <RescuesList
              rescues={rescues}
              onEdit={adminState.handleOpenRescueDialog}
              onDelete={adminState.handleRescueDelete}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

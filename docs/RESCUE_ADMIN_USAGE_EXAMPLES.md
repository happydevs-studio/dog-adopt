// Example: Using Rescue Admin Permissions in a React Component
// This demonstrates how to use the rescue admin hooks in a typical UI scenario

import { useIsRescueAdmin, useUserRescueAdmins } from '@/hooks/useRescueAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

// Example 1: Check if user can edit a specific rescue
export function RescueEditButton({ rescueId }: { rescueId: string }) {
  const { user, isAdmin: isGlobalAdmin } = useAuth();
  const { data: isRescueAdmin } = useIsRescueAdmin(rescueId);

  // Show edit button if user is either a global admin OR a rescue admin for this rescue
  const canEdit = isGlobalAdmin || isRescueAdmin;

  if (!user || !canEdit) {
    return null; // Don't show button if user can't edit
  }

  return (
    <Button onClick={() => handleEdit()}>
      Edit Rescue
    </Button>
  );
}

// Example 2: Show list of rescues the user can manage
export function MyRescuesPanel() {
  const { user } = useAuth();
  const { data: rescueAdmins, isLoading } = useUserRescueAdmins();

  if (!user) {
    return <p>Please sign in to manage your rescues</p>;
  }

  if (isLoading) {
    return <p>Loading your rescues...</p>;
  }

  if (!rescueAdmins || rescueAdmins.length === 0) {
    return <p>You don't have admin access to any rescues yet.</p>;
  }

  return (
    <div>
      <h2>Your Rescues</h2>
      <ul>
        {rescueAdmins.map((rescueAdmin) => (
          <li key={rescueAdmin.rescueId}>
            <h3>{rescueAdmin.rescueName}</h3>
            <p>Region: {rescueAdmin.rescueRegion}</p>
            <p>Admin since: {new Date(rescueAdmin.grantedAt).toLocaleDateString()}</p>
            <Button onClick={() => navigateToRescue(rescueAdmin.rescueId)}>
              Manage Dogs
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example 3: Conditionally render admin features
export function RescueDetailsPage({ rescueId }: { rescueId: string }) {
  const { isAdmin: isGlobalAdmin } = useAuth();
  const { data: isRescueAdmin } = useIsRescueAdmin(rescueId);

  const canManage = isGlobalAdmin || isRescueAdmin;

  return (
    <div>
      <RescueInfo rescueId={rescueId} />
      
      {canManage && (
        <div className="admin-actions">
          <Button>Edit Rescue Details</Button>
          <Button>Add New Dog</Button>
          <Button>Manage Dogs</Button>
        </div>
      )}
      
      <DogsList rescueId={rescueId} canEdit={canManage} />
    </div>
  );
}

// Example 4: Use in a form to restrict who can submit
export function DogFormDialog({ rescueId }: { rescueId: string }) {
  const { isAdmin: isGlobalAdmin } = useAuth();
  const { data: isRescueAdmin, isLoading } = useIsRescueAdmin(rescueId);

  const canSubmit = isGlobalAdmin || isRescueAdmin;

  const handleSubmit = async (formData: DogFormData) => {
    if (!canSubmit) {
      console.error('User does not have permission to add dogs for this rescue');
      return;
    }

    // Submit the form...
  };

  return (
    <Dialog>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          
          <Button 
            type="submit" 
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? 'Checking permissions...' : 'Add Dog'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Example 5: Display admin badge
export function RescueCard({ rescue }: { rescue: Rescue }) {
  const { user } = useAuth();
  const { data: isRescueAdmin } = useIsRescueAdmin(rescue.id);

  return (
    <div className="rescue-card">
      <h3>{rescue.name}</h3>
      {user && isRescueAdmin && (
        <span className="badge">You manage this rescue</span>
      )}
      <p>{rescue.region}</p>
      {/* Rest of card content */}
    </div>
  );
}

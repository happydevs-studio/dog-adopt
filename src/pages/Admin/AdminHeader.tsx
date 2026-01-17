import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, LogOut, ArrowLeft } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string;
  onSignOut: () => void;
}

export function AdminHeader({ userEmail, onSignOut }: AdminHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display text-lg sm:text-xl font-semibold text-foreground">
                Admin Panel
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

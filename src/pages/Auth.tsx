/* eslint-disable max-lines-per-function */
// Auth page with multiple form sections - disabling line count rule
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { DevBypassBanner } from '@/components/auth/DevBypassBanner';
import { AuthForm } from './Auth/AuthForm';
import { GoogleSignInButton } from './Auth/GoogleSignInButton';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, signIn, signUp, signInWithGoogle, isLoading, isDevBypass } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: 'Validation Error',
        description: validation.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message === 'Invalid login credentials' 
              ? 'Invalid email or password' 
              : error.message,
            variant: 'destructive'
          });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please log in instead.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Sign Up Failed',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Check Your Email',
            description: 'We sent you a confirmation link to verify your account.',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: 'Google Sign In Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
    setIsGoogleLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isDevBypass && <DevBypassBanner />}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/brand_images/logos/Original Logo Symbol.png" 
              alt="DogAdopt Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <CardTitle className="font-display text-2xl">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Sign in to access the admin panel' 
              : 'Sign up to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            isLogin={isLogin}
            email={email}
            password={password}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />
          {!isDevBypass && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
              <GoogleSignInButton
                isLoading={isGoogleLoading}
                onClick={handleGoogleSignIn}
              />
            </>
          )}
          {isDevBypass && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
                <strong>Development Mode:</strong> Authentication is bypassed. Navigate to any page to access the app with admin privileges.
              </p>
            </div>
          )}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </button>
          </div>
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-primary hover:underline">
              ← Back to home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;

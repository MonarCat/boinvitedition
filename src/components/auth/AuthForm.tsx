
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogIn, UserPlus, Lock, Shield } from 'lucide-react';
import { AuthAlerts } from './AuthAlerts';
import SignInForm from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';
import { PasswordResetCard } from './PasswordResetCard';

export const AuthForm = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to dashboard:', user.email);
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const clearError = () => {
    setAuthError(null);
    setResetEmailSent(false);
    setSignUpSuccess(false);
  };

  const handleSignUpSuccess = (email: string) => {
    setSignUpSuccess(true);
    setPendingEmail(email);
    toast.success('Account created! Please check your email for the confirmation link.');
    setAuthError(null);
  };

  const handleResetSuccess = () => {
    setResetEmailSent(true);
    toast.success('Password reset email sent! Check your inbox.');
    setAuthError(null);
  };

  const handleError = (error: string | null) => {
    console.log('Auth form error:', error);
    setAuthError(error);
    setLoading(false);
    if (error) {
      toast.error(error);
    }
  };

  const isFormDisabled = loading || authLoading;

  // Check if user is in password reset flow
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const type = urlParams.get('type');
    const accessToken = urlParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      setActiveTab('password-reset');
    }
  }, [location]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full auth-card">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
              alt="Boinvit Logo" 
              className="h-20 w-auto drop-shadow-lg"
            />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-royal-blue to-royal-red bg-clip-text text-transparent">
            Welcome to Boinvit
          </CardTitle>
          <CardDescription className="text-royal-blue/80 font-medium text-base mt-2">
            Your complete booking management solution
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <AuthAlerts 
            authError={authError}
            signUpSuccess={signUpSuccess}
            resetEmailSent={resetEmailSent}
            pendingEmail={pendingEmail}
          />
          
          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearError(); }} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-cream to-cream-dark border-2 border-royal-blue/20 rounded-xl p-1 h-14">
              <TabsTrigger 
                value="signin" 
                className="flex items-center gap-2 rounded-lg h-12 font-semibold text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue data-[state=active]:to-royal-blue-dark data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="flex items-center gap-2 rounded-lg h-12 font-semibold text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-red data-[state=active]:to-royal-red-dark data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reset"
                className="flex items-center gap-1 rounded-lg h-12 font-semibold text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-blue/80 data-[state=active]:to-royal-blue data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </TabsTrigger>
              <TabsTrigger 
                value="password-reset"
                className="flex items-center gap-1 rounded-lg h-12 font-semibold text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-royal-red/80 data-[state=active]:to-royal-red data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Lock className="h-3 w-3" />
                <span className="hidden sm:inline">Password</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-0">
              <SignInForm 
                loading={isFormDisabled}
                authError={authError}
                pendingEmail={pendingEmail}
                onError={handleError}
              />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <SignUpForm 
                loading={isFormDisabled}
                authError={authError}
                onError={handleError}
                onSignUpSuccess={handleSignUpSuccess}
                onTabChange={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="reset" className="mt-0">
              <PasswordResetForm 
                loading={isFormDisabled}
                authError={authError}
                onError={handleError}
                onResetSuccess={handleResetSuccess}
              />
            </TabsContent>

            <TabsContent value="password-reset" className="mt-0">
              <PasswordResetCard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail, LogIn, UserPlus, Ticket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export const AuthForm = () => {
  const { signIn, signUp, user, resetPassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Check for email confirmation on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // User is coming back from email confirmation
      toast.success('Email confirmed successfully! You are now signed in.');
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to dashboard:', user.email);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Mix of uppercase and lowercase');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one number');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('At least one special character');
    }

    let color = 'text-red-500';
    if (score >= 3) color = 'text-yellow-500';
    if (score === 4) color = 'text-green-500';

    return { score, feedback, color };
  };

  const passwordStrength = checkPasswordStrength(password);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading) return;
    
    setLoading(true);
    setAuthError(null);
    
    console.log('Attempting sign in for:', email);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!password) {
      setAuthError('Please enter your password.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signIn(email, password);
      console.log('Sign in result:', { error });
      
      if (error) {
        console.error('Sign in error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see it.');
          // Switch to sign up tab to show the resend option
          setActiveTab('signup');
          setPendingEmail(email);
        } else if (error.message.includes('Too many requests')) {
          setAuthError('Too many sign-in attempts. Please wait a moment and try again.');
        } else {
          setAuthError(error.message);
        }
        toast.error('Sign in failed');
      } else {
        console.log('Sign in successful');
        toast.success('Welcome back!');
        setAuthError(null);
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || authLoading) return;
    
    setLoading(true);
    setAuthError(null);

    // Validation
    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setAuthError('Please enter your first and last name.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setAuthError('Please choose a stronger password.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Please sign in instead.');
          setActiveTab('signin');
        } else if (error.message.includes('Password should be at least')) {
          setAuthError('Password must be at least 6 characters long.');
        } else {
          setAuthError(error.message);
        }
        toast.error('Sign up failed');
      } else {
        setSignUpSuccess(true);
        setPendingEmail(email);
        toast.success('Account created! Please check your email for the confirmation link.');
        setAuthError(null);
        // Clear form
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      toast.error('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setAuthError(null);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setAuthError(error.message);
        toast.error('Password reset failed');
      } else {
        setResetEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
        setAuthError(null);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      toast.error('An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setAuthError(null);
    setResetEmailSent(false);
    setSignUpSuccess(false);
  };

  const isFormDisabled = loading || authLoading;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Ticket className="h-12 w-12 text-royal-red" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Boinvit</CardTitle>
          <CardDescription>Your complete booking management solution</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {signUpSuccess && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <div className="font-medium">Please confirm your email address</div>
                  <div className="text-sm">
                    We've sent a confirmation link to <strong>{pendingEmail}</strong>.
                    Click the link in the email to activate your account and sign in.
                  </div>
                  <div className="text-sm text-blue-600">
                    Don't see the email? Check your spam folder or wait a few minutes.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {resetEmailSent && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Password reset email sent! Check your inbox and follow the instructions.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); clearError(); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    disabled={isFormDisabled}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isFormDisabled}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {pendingEmail && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-800 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>
                        Account requires email confirmation. Please check your email for the confirmation link.
                      </span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-royal-red hover:bg-royal-red/90" disabled={isFormDisabled}>
                  {isFormDisabled ? 'Signing in...' : 'Sign In'}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Don't have an account? Switch to the Sign Up tab above.
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">First Name</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isFormDisabled}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Last Name</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isFormDisabled}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    disabled={isFormDisabled}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isFormDisabled}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              passwordStrength.score === 1 ? 'bg-red-500 w-1/4' :
                              passwordStrength.score === 2 ? 'bg-yellow-500 w-2/4' :
                              passwordStrength.score === 3 ? 'bg-yellow-500 w-3/4' :
                              passwordStrength.score === 4 ? 'bg-green-500 w-full' : 'w-0'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.score === 1 ? 'Weak' :
                           passwordStrength.score === 2 ? 'Fair' :
                           passwordStrength.score === 3 ? 'Good' :
                           passwordStrength.score === 4 ? 'Strong' : ''}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <p>Password should include:</p>
                          <ul className="list-disc list-inside">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (authError) setAuthError(null);
                      }}
                      disabled={isFormDisabled}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isFormDisabled}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                    <div className="flex items-center text-xs text-green-600">
                      <CheckCircle size={14} className="mr-1" />
                      Passwords match
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2 text-blue-800 text-sm">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium mb-1">Email confirmation required</div>
                      <div>
                        After creating your account, you'll receive a confirmation email. 
                        Click the link in the email to activate your account and sign in.
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-royal-red hover:bg-royal-red/90" 
                  disabled={isFormDisabled || password !== confirmPassword || passwordStrength.score < 3}
                >
                  {isFormDisabled ? 'Creating account...' : 'Create Account'}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Already have an account? Switch to the Sign In tab above.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    disabled={isFormDisabled}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-royal-red hover:bg-royal-red/90" disabled={isFormDisabled}>
                  {isFormDisabled ? 'Sending reset email...' : 'Send Reset Email'}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Remember your password? Switch to the Sign In tab above.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

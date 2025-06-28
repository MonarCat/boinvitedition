import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, UserPlus, Loader2 } from 'lucide-react';
import { PasswordStrength } from './PasswordStrength';
import { CountrySelector } from './CountrySelector';

interface SignUpFormProps {
  loading: boolean;
  authError: string | null;
  onError: (error: string | null) => void;
  onSignUpSuccess: (email: string) => void;
  onTabChange: (tab: string) => void;
}

export const SignUpForm = ({ loading, authError, onError, onSignUpSuccess, onTabChange }: SignUpFormProps) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country, setCountry] = useState<string | undefined>(undefined);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    onError(null);

    if (!validateEmail(email)) {
      onError('Please enter a valid email address.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      onError('Please enter your first and last name.');
      return;
    }

    if (!country) {
      onError('Please select your country.');
      return;
    }

    if (password !== confirmPassword) {
      onError('Passwords do not match.');
      return;
    }

    if (checkPasswordStrength(password) < 3) {
      onError('Please choose a stronger password.');
      return;
    }
    
    try {
      const { error } = await signUp(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: country,
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          onError('An account with this email already exists. Please sign in instead.');
          onTabChange('signin');
        } else if (error.message.includes('Password should be at least')) {
          onError('Password must be at least 6 characters long.');
        } else {
          onError(error.message);
        }
      } else {
        onSignUpSuccess(email);
        // Clear form
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setCountry(undefined);
      }
    } catch (error) {
      onError('An unexpected error occurred. Please try again.');
    }
  };

  const passwordStrength = checkPasswordStrength(password);
  const isFormDisabled = loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstname" className="text-royal-blue font-semibold">First Name</Label>
          <Input
            id="signup-firstname"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (authError) onError(null);
            }}
            disabled={isFormDisabled}
            className="auth-input h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastname" className="text-royal-blue font-semibold">Last Name</Label>
          <Input
            id="signup-lastname"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (authError) onError(null);
            }}
            disabled={isFormDisabled}
            className="auth-input h-12"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="country" className="text-royal-blue font-semibold">Country</Label>
        <CountrySelector 
          value={country}
          onValueChange={setCountry}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-royal-blue font-semibold">Email Address</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (authError) onError(null);
          }}
          disabled={isFormDisabled}
          className="auth-input h-12"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-royal-blue font-semibold">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authError) onError(null);
            }}
            disabled={isFormDisabled}
            className="auth-input h-12 pr-12"
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isFormDisabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-royal-blue/60 hover:text-royal-blue transition-colors disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <PasswordStrength password={password} confirmPassword={confirmPassword} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password" className="text-royal-blue font-semibold">Confirm Password</Label>
        <div className="relative">
          <Input
            id="signup-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (authError) onError(null);
            }}
            disabled={isFormDisabled}
            className="auth-input h-12 pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isFormDisabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-royal-blue/60 hover:text-royal-blue transition-colors disabled:opacity-50"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-royal-blue/5 to-royal-blue/10 border-l-4 border-royal-blue rounded-xl">
        <div className="flex items-start gap-3 text-royal-blue text-sm">
          <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 text-royal-blue" />
          <div>
            <div className="font-bold mb-1 text-royal-blue">Email Confirmation Required</div>
            <div className="text-royal-blue/80">
              After creating your account, you'll receive a confirmation email from <strong>support@boinvit.com</strong>. 
              Click the link in the email to activate your account and sign in.
            </div>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="auth-button-secondary w-full h-14 text-base font-bold shadow-xl hover:shadow-2xl" 
        disabled={isFormDisabled || password !== confirmPassword || passwordStrength < 3}
      >
        {isFormDisabled ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating Your Account...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-5 w-5" />
            Create Your Account
          </>
        )}
      </Button>
      
      <div className="text-center pt-2">
        <p className="text-royal-blue/70 text-sm">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onTabChange('signin')}
            className="text-royal-blue font-semibold hover:text-royal-blue-dark hover:underline transition-colors duration-200"
            disabled={isFormDisabled}
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
};

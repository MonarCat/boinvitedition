
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

export const PasswordResetCard = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least one special character');
    return errors;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // Use Supabase's updateUser method to change password
      const { supabase } = await import('@/integrations/supabase/client');
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePassword(newPassword);
  const isStrong = passwordStrength.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-royal-blue to-royal-blue-dark rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-royal-blue mb-2">Reset Your Password</h2>
        <p className="text-royal-blue/70">Enter your new password below</p>
      </div>

      {error && (
        <Alert className="border-royal-red/20 bg-royal-red/10">
          <AlertDescription className="text-royal-red font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handlePasswordReset} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-royal-blue font-semibold">New Password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              className={`auth-input h-12 pr-12 ${newPassword && !isStrong ? 'border-orange-300 focus:border-orange-500' : ''}`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-royal-blue/60 hover:text-royal-blue"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={loading}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {newPassword && passwordStrength.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="font-semibold text-orange-800 text-sm mb-2">Password must have:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                {passwordStrength.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
          {newPassword && isStrong && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Strong password
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-royal-blue font-semibold">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={loading}
              className={`auth-input h-12 pr-12 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-royal-blue/60 hover:text-royal-blue"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-600 text-sm font-medium">Passwords do not match</p>
          )}
          {confirmPassword && newPassword === confirmPassword && newPassword && (
            <p className="text-green-600 text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Passwords match
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 bg-gradient-to-r from-royal-blue to-royal-blue-dark hover:from-royal-blue-light hover:to-royal-blue text-white font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]" 
          disabled={loading || !isStrong || newPassword !== confirmPassword}
        >
          {loading ? (
            <>
              <Lock className="mr-2 h-5 w-5 animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-5 w-5" />
              Update Password
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

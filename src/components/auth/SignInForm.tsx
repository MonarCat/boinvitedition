import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';

import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

const SignInForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();
  
  const { logSecurityEvent, monitorFailedLogins } = useSecurityMonitoring();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Log failed login attempt
        const currentAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0') + 1;
        localStorage.setItem('failed_login_attempts', currentAttempts.toString());
        
        await logSecurityEvent('FAILED_LOGIN', `Failed login attempt for email: ${email}`, {
          email,
          attempts: currentAttempts,
          user_agent: navigator.userAgent
        });

        monitorFailedLogins();
        setError(error.message);
      } else {
        // Clear failed attempts on successful login
        localStorage.removeItem('failed_login_attempts');
        
        await logSecurityEvent('SUCCESSFUL_LOGIN', `User successfully logged in`, {
          email,
          user_agent: navigator.userAgent
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
        <Link href="/reset-password" className="text-sm text-gray-500 hover:text-gray-700">
          Forgot password?
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;

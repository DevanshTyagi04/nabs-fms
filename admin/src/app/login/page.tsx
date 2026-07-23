'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/hooks/useToast';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Login Successful', 'Welcome to NABS Admin Console.');
      router.push('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Card className="w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-xl mb-2">
            N
          </div>
          <CardTitle className="text-xl font-bold">NABS Admin Console</CardTitle>
          <CardDescription>Sign in to access platform management</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
                <Icon name="alert-circle" className="text-rose-500 shrink-0" size="sm" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="admin@nabs.com"
              leftIcon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </CardContent>

          <CardFooter className="pt-2">
            <Button variant="primary" type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

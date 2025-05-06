'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Assuming Alert component exists
import { verifyAdminCredentials } from '@/lib/mock-data'; // Use mock auth function
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyAdminCredentials(username, password);

      if (isValid) {
        // In a real app, set a session cookie or token here
        // For this mock, we'll just assume login is successful and redirect
        console.log('Login successful');
        sessionStorage.setItem('isAdminAuthenticated', 'true'); // Very basic session flag (NOT SECURE FOR PRODUCTION)
        toast({
            title: "Login Successful",
            description: "Redirecting to admin dashboard...",
            variant: "default", // Or "success" if you add that variant
          });
        router.push('/admin'); // Redirect to admin dashboard
      } else {
        setError('Invalid username or password.');
         toast({
            title: "Login Failed",
            description: "Invalid username or password.",
            variant: "destructive",
          });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
       toast({
            title: "Login Error",
            description: "An unexpected error occurred.",
            variant: "destructive",
          });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
             {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="password123"
              />
            </div>
            <Button type="submit" className="w-full" variant="primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="text-xs text-muted-foreground text-center block">
            Use username: admin, password: password123
        </CardFooter>
      </Card>
    </div>
  );
}

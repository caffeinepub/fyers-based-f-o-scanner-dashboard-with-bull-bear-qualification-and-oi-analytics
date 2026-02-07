import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { identity, login, isInitializing, isLoggingIn } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img 
                src="/assets/generated/app-logo.dim_512x512.png" 
                alt="F&O Scanner Logo" 
                className="h-20 w-20 mx-auto rounded-lg"
              />
            </div>
            <CardTitle className="text-2xl">Welcome to F&O Scanner</CardTitle>
            <CardDescription>
              Sign in to access your personalized F&O stock scanner dashboard with bull/bear qualification and OI analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={login} 
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

import Login from '@/pages/login';
import Signup from '@/pages/signup';
import VerifyEmail from '@/pages/verify-email';
import ForgotPassword from '@/pages/forgot-password';
import ResetPassword from '@/pages/reset-password';
import Onboarding from '@/pages/onboarding';
import ExpertDashboard from '@/pages/expert-dashboard';
import CompanyDashboard from '@/pages/company-dashboard';
import Settings from '@/pages/settings';

const queryClient = new QueryClient();

// Full screen loader
function FullPageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

// Redirects authenticated users away from auth pages
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && session) {
      if (!profile?.account_type) {
        setLocation('/onboarding');
      } else if (profile.account_type === 'expert') {
        setLocation('/dashboard');
      } else {
        setLocation('/company-dashboard');
      }
    }
  }, [session, profile, isLoading, setLocation]);

  if (isLoading || session) return <FullPageLoader />;
  
  return <Component />;
}

// Protects routes that require authentication
function ProtectedRoute({ component: Component, requireAccountType }: { component: React.ComponentType, requireAccountType?: 'expert' | 'company' }) {
  const { session, profile, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        setLocation('/login');
      } else if (location !== '/onboarding' && !profile?.account_type) {
        setLocation('/onboarding');
      } else if (requireAccountType && profile?.account_type && profile.account_type !== requireAccountType) {
        // Wrong dashboard type
        setLocation(profile.account_type === 'expert' ? '/dashboard' : '/company-dashboard');
      }
    }
  }, [session, profile, isLoading, setLocation, location, requireAccountType]);

  if (isLoading || !session) return <FullPageLoader />;
  
  if (location !== '/onboarding' && !profile?.account_type) return <FullPageLoader />;
  if (requireAccountType && profile?.account_type !== requireAccountType) return <FullPageLoader />;
  
  return <Component />;
}

// Root redirector
function RootRedirect() {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        setLocation('/login');
      } else if (!profile?.account_type) {
        setLocation('/onboarding');
      } else if (profile.account_type === 'expert') {
        setLocation('/dashboard');
      } else {
        setLocation('/company-dashboard');
      }
    }
  }, [session, profile, isLoading, setLocation]);

  return <FullPageLoader />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      
      {/* Public / Auth routes */}
      <Route path="/login"><PublicRoute component={Login} /></Route>
      <Route path="/signup"><PublicRoute component={Signup} /></Route>
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/forgot-password"><PublicRoute component={ForgotPassword} /></Route>
      <Route path="/reset-password"><PublicRoute component={ResetPassword} /></Route>
      
      {/* Protected routes */}
      <Route path="/onboarding"><ProtectedRoute component={Onboarding} /></Route>
      <Route path="/dashboard"><ProtectedRoute component={ExpertDashboard} requireAccountType="expert" /></Route>
      <Route path="/company-dashboard"><ProtectedRoute component={CompanyDashboard} requireAccountType="company" /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

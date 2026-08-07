import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Route,
  Switch,
  Router as WouterRouter,
  useLocation,
} from 'wouter';
import { Loader2 } from 'lucide-react';

import { AuthProvider, useAuth } from '@/hooks/use-auth';

import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import VerifyEmail from '@/pages/verify-email';
import ForgotPassword from '@/pages/forgot-password';
import ResetPassword from '@/pages/reset-password';
import Onboarding from '@/pages/onboarding';
import ExpertDashboard from '@/pages/expert-dashboard';
import CompanyDashboard from '@/pages/company-dashboard';
import Settings from '@/pages/settings';
import Landing from '@/pages/landing';
import FindExperts from '@/pages/FindExperts';
import AdminDashboard from '@/pages/admin-dashboard';

const queryClient = new QueryClient();

/*
============================================================
ADMIN
============================================================
*/

const ADMIN_USER_ID = '0f29b27d-45b6-4377-9242-e983f95039af';

/*
============================================================
LOADER
============================================================
*/

function FullPageLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/*
============================================================
PUBLIC ROUTE
Redirects authenticated users away from login/signup pages.
============================================================
*/

interface PublicRouteProps {
  component: React.ComponentType;
}

function PublicRoute({
  component: Component,
}: PublicRouteProps) {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading || !session) return;

    // Logged in but onboarding has not been completed.
    if (!profile?.account_type) {
      setLocation('/onboarding');
      return;
    }

    // Expert account.
    if (profile.account_type === 'expert') {
      setLocation('/dashboard');
      return;
    }

    // Company account.
    if (profile.account_type === 'company') {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    profile,
    isLoading,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (session) {
    return <FullPageLoader />;
  }

  return <Component />;
}

/*
============================================================
ONBOARDING ROUTE
============================================================
*/

interface OnboardingRouteProps {
  component: React.ComponentType;
}

function OnboardingRoute({
  component: Component,
}: OnboardingRouteProps) {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated.
    if (!session) {
      setLocation('/login');
      return;
    }

    // Onboarding already completed.
    if (profile?.account_type === 'expert') {
      setLocation('/dashboard');
      return;
    }

    if (profile?.account_type === 'company') {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    profile,
    isLoading,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  // If onboarding is incomplete, show it.
  if (!profile?.account_type) {
    return <Component />;
  }

  return <FullPageLoader />;
}

/*
============================================================
PROTECTED ROUTE
============================================================
*/

interface ProtectedRouteProps {
  component: React.ComponentType;
  requireAccountType?: 'expert' | 'company';
}

function ProtectedRoute({
  component: Component,
  requireAccountType,
}: ProtectedRouteProps) {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in.
    if (!session) {
      setLocation('/login');
      return;
    }

    // Logged in but onboarding is incomplete.
    if (!profile?.account_type) {
      setLocation('/onboarding');
      return;
    }

    // User is trying to access the wrong dashboard.
    if (
      requireAccountType &&
      profile.account_type !== requireAccountType
    ) {
      if (profile.account_type === 'expert') {
        setLocation('/dashboard');
      } else if (profile.account_type === 'company') {
        setLocation('/company-dashboard');
      }
    }
  }, [
    session,
    profile,
    isLoading,
    requireAccountType,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  if (!profile) {
    return <FullPageLoader />;
  }

  if (!profile.account_type) {
    return <FullPageLoader />;
  }

  if (
    requireAccountType &&
    profile.account_type !== requireAccountType
  ) {
    return <FullPageLoader />;
  }

  return <Component />;
}

/*
============================================================
ADMIN ROUTE
Only your specific Supabase user ID can access this route.
============================================================
*/

interface AdminRouteProps {
  component: React.ComponentType;
}

function AdminRoute({
  component: Component,
}: AdminRouteProps) {
  const { session, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in.
    if (!session) {
      setLocation('/login');
      return;
    }

    // Logged in but not the administrator.
    if (session.user.id !== ADMIN_USER_ID) {
      setLocation('/dashboard');
      return;
    }
  }, [
    session,
    isLoading,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  if (session.user.id !== ADMIN_USER_ID) {
    return <FullPageLoader />;
  }

  return <Component />;
}

/*
============================================================
ROOT ROUTE
============================================================
*/

function RootRedirect() {
  const { session, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      setLocation('/login');
      return;
    }

    // Admin gets the admin dashboard.
    if (session.user.id === ADMIN_USER_ID) {
      setLocation('/admin');
      return;
    }

    if (!profile?.account_type) {
      setLocation('/onboarding');
      return;
    }

    if (profile.account_type === 'expert') {
      setLocation('/dashboard');
      return;
    }

    if (profile.account_type === 'company') {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    profile,
    isLoading,
    setLocation,
  ]);

  return <FullPageLoader />;
}

/*
============================================================
ROUTER
============================================================
*/

function AppRouter() {
  return (
    <Switch>

      {/* ======================================================
          LANDING
          ====================================================== */}

      <Route
        path="/"
        component={Landing}
      />

      {/* ======================================================
          PUBLIC / AUTH
          ====================================================== */}

      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>

      <Route path="/signup">
        <PublicRoute component={Signup} />
      </Route>

      <Route
        path="/verify-email"
        component={VerifyEmail}
      />

      <Route path="/forgot-password">
        <PublicRoute component={ForgotPassword} />
      </Route>

      <Route path="/reset-password">
        <PublicRoute component={ResetPassword} />
      </Route>

      {/* ======================================================
          ONBOARDING
          ====================================================== */}

      <Route path="/onboarding">
        <OnboardingRoute component={Onboarding} />
      </Route>

      {/* ======================================================
          EXPERT DASHBOARD
          ====================================================== */}

      <Route path="/dashboard">
        <ProtectedRoute
          component={ExpertDashboard}
          requireAccountType="expert"
        />
      </Route>

      {/* ======================================================
          COMPANY DASHBOARD
          ====================================================== */}

      <Route path="/company-dashboard">
        <ProtectedRoute
          component={CompanyDashboard}
          requireAccountType="company"
        />
      </Route>

      {/* ======================================================
          COMPANY — FIND EXPERTS
          ====================================================== */}

      <Route path="/company/find-experts">
        <ProtectedRoute
          component={FindExperts}
          requireAccountType="company"
        />
      </Route>

      {/* ======================================================
          ADMIN DASHBOARD
          ====================================================== */}

      <Route path="/admin">
        <AdminRoute component={AdminDashboard} />
      </Route>

      {/* ======================================================
          SETTINGS
          ====================================================== */}

      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>

      {/* ======================================================
          FALLBACK
          ====================================================== */}

      <Route component={NotFound} />

    </Switch>
  );
}

/*
============================================================
APP
============================================================
*/

function App() {
  const basePath = import.meta.env.BASE_URL.replace(
    /\/$/,
    ''
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>

        <TooltipProvider>

          <WouterRouter base={basePath}>
            <AppRouter />
          </WouterRouter>

          <Toaster />

        </TooltipProvider>

      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

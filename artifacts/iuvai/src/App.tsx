import { useEffect } from 'react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { Toaster } from '@/components/ui/toaster';

import { TooltipProvider } from '@/components/ui/tooltip';

import {
  Route,
  Switch,
  Router as WouterRouter,
  useLocation,
} from 'wouter';

import { Loader2 } from 'lucide-react';

import {
  AuthProvider,
  useAuth,
} from '@/hooks/use-auth';

import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Signup from '@/pages/signup';
import VerifyEmail from '@/pages/verify-email';
import ForgotPassword from '@/pages/forgot-password';
import ResetPassword from '@/pages/reset-password';
import Onboarding from '@/pages/onboarding';

import ExpertDashboard from '@/pages/expert-dashboard';
import CompanyDashboard from '@/pages/company-dashboard';

import AdminDashboard from '@/pages/admin-dashboard';
import AdminProjects from '@/pages/admin-projects';
import ProjectExperts from '@/pages/ProjectExperts';
import AdminExpertReview from '@/pages/admin-expert-review';
import AdminExperts from '@/pages/admin-experts';
import AdminExpertProfile from '@/pages/admin-expert-profile';

import Settings from '@/pages/settings';
import Landing from '@/pages/landing';
import FindExperts from '@/pages/FindExperts';

const queryClient = new QueryClient();

/*
============================================================
ADMIN ACCOUNT
============================================================
IUVAI operator/admin account.

IMPORTANT:
This is frontend routing protection only.

Sensitive admin database operations must ALSO be protected
using Supabase RLS policies.
============================================================
*/

const ADMIN_USER_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';

/* ============================================================
   LOADER
   ============================================================ */

function FullPageLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/* ============================================================
   ADMIN CHECK
   ============================================================ */

function isAdminUser(
  userId: string | undefined
) {
  return userId === ADMIN_USER_ID;
}

/* ============================================================
   PUBLIC ROUTE
   ============================================================ */

interface PublicRouteProps {
  component: React.ComponentType;
}

function PublicRoute({
  component: Component,
}: PublicRouteProps) {
  const {
    session,
    user,
    profile,
    isLoading,
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session) {
      return;
    }

    /*
    ----------------------------------------------------------
    IMPORTANT

    Password recovery is NOT handled here.

    /reset-password is deliberately NOT wrapped in
    PublicRoute.

    Therefore normal authenticated routing cannot
    accidentally redirect the recovery session.
    ----------------------------------------------------------
    */

    if (isAdminUser(user?.id)) {
      setLocation('/admin');
      return;
    }

    if (!profile?.account_type) {
      setLocation('/onboarding');
      return;
    }

    if (
      profile.account_type === 'expert'
    ) {
      setLocation('/dashboard');
      return;
    }

    if (
      profile.account_type === 'company'
    ) {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    user,
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

/* ============================================================
   ONBOARDING ROUTE
   ============================================================ */

interface OnboardingRouteProps {
  component: React.ComponentType;
}

function OnboardingRoute({
  component: Component,
}: OnboardingRouteProps) {
  const {
    session,
    user,
    profile,
    isLoading,
    isPasswordRecovery,
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    /*
    A recovery session should never enter onboarding.
    */
    if (isPasswordRecovery) {
      setLocation('/reset-password');
      return;
    }

    if (!session) {
      setLocation('/login');
      return;
    }

    if (isAdminUser(user?.id)) {
      setLocation('/admin');
      return;
    }

    if (
      profile?.account_type === 'expert'
    ) {
      setLocation('/dashboard');
      return;
    }

    if (
      profile?.account_type === 'company'
    ) {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    user,
    profile,
    isLoading,
    isPasswordRecovery,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  if (isPasswordRecovery) {
    return <FullPageLoader />;
  }

  if (!profile?.account_type) {
    return <Component />;
  }

  return <FullPageLoader />;
}

/* ============================================================
   PROTECTED ROUTE
   ============================================================ */

interface ProtectedRouteProps {
  component: React.ComponentType;
  requireAccountType?: 'expert' | 'company';
}

function ProtectedRoute({
  component: Component,
  requireAccountType,
}: ProtectedRouteProps) {
  const {
    session,
    profile,
    isLoading,
    isPasswordRecovery,
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    /*
    Recovery sessions must never be allowed to render
    protected dashboard pages.
    */
    if (isPasswordRecovery) {
      setLocation('/reset-password');
      return;
    }

    if (!session) {
      setLocation('/login');
      return;
    }

    if (!profile?.account_type) {
      setLocation('/onboarding');
      return;
    }

    if (
      requireAccountType &&
      profile.account_type !== requireAccountType
    ) {
      if (
        profile.account_type === 'expert'
      ) {
        setLocation('/dashboard');
        return;
      }

      if (
        profile.account_type === 'company'
      ) {
        setLocation('/company-dashboard');
        return;
      }
    }
  }, [
    session,
    profile,
    isLoading,
    isPasswordRecovery,
    requireAccountType,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  if (isPasswordRecovery) {
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

/* ============================================================
   ADMIN ROUTE
   ============================================================ */

interface AdminRouteProps {
  component: React.ComponentType;
}

function AdminRoute({
  component: Component,
}: AdminRouteProps) {
  const {
    session,
    user,
    isLoading,
    isPasswordRecovery,
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isPasswordRecovery) {
      setLocation('/reset-password');
      return;
    }

    if (!session) {
      setLocation('/login');
      return;
    }

    if (!isAdminUser(user?.id)) {
      setLocation('/company-dashboard');
      return;
    }
  }, [
    session,
    user,
    isLoading,
    isPasswordRecovery,
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
    return <FullPageLoader />;
  }

  if (isPasswordRecovery) {
    return <FullPageLoader />;
  }

  if (!isAdminUser(user?.id)) {
    return <FullPageLoader />;
  }

  return <Component />;
}

/* ============================================================
   ROUTER
   ============================================================ */

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
          LOGIN
          ====================================================== */}

      <Route path="/login">
        <PublicRoute
          component={Login}
        />
      </Route>

      {/* ======================================================
          SIGNUP
          ====================================================== */}

      <Route path="/signup">
        <PublicRoute
          component={Signup}
        />
      </Route>

      {/* ======================================================
          EMAIL VERIFICATION
          ====================================================== */}

      <Route
        path="/verify-email"
        component={VerifyEmail}
      />

      {/* ======================================================
          FORGOT PASSWORD
          ====================================================== */}

      <Route path="/forgot-password">
        <PublicRoute
          component={ForgotPassword}
        />
      </Route>

      {/* ======================================================
          PASSWORD RESET

          CRITICAL:

          DO NOT put this inside PublicRoute.

          Supabase creates a temporary authenticated
          recovery session when the reset email is clicked.

          ResetPassword needs that session so it can call:

          supabase.auth.updateUser({
            password
          })

          No authentication redirect is allowed to
          interfere with this route.
          ====================================================== */}

      <Route
        path="/reset-password"
        component={ResetPassword}
      />

      {/* ======================================================
          ONBOARDING
          ====================================================== */}

      <Route path="/onboarding">
        <OnboardingRoute
          component={Onboarding}
        />
      </Route>

      {/* ======================================================
          ADMIN
          ====================================================== */}

      <Route path="/admin">
        <AdminRoute
          component={AdminDashboard}
        />
      </Route>

      {/* ======================================================
          ADMIN PROJECTS
          ====================================================== */}

      <Route path="/admin/projects">
        <AdminRoute
          component={AdminProjects}
        />
      </Route>

      {/* ======================================================
          ADMIN PROJECT EXPERTS
          ====================================================== */}

      <Route path="/admin/projects/:projectId/experts">
        <AdminRoute
          component={ProjectExperts}
        />
      </Route>

      {/* ======================================================
          ADMIN EXPERTS
          ====================================================== */}

      <Route path="/admin/experts">
        <AdminRoute
          component={AdminExperts}
        />
      </Route>

      {/* ======================================================
          ADMIN EXPERT PROFILE
          ====================================================== */}

      <Route path="/admin/experts/:expertId">
        <AdminRoute
          component={AdminExpertProfile}
        />
      </Route>

      {/* ======================================================
          ADMIN EXPERT REVIEW
          ====================================================== */}

      <Route path="/admin/projects/:projectId/experts/:expertId">
        <AdminRoute
          component={AdminExpertReview}
        />
      </Route>

      {/* ======================================================
          ADMIN SINGLE PROJECT
          ====================================================== */}

      <Route path="/admin/projects/:projectId">
        <AdminRoute
          component={AdminProjects}
        />
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
          FIND EXPERTS
          ====================================================== */}

      <Route path="/company/find-experts">
        <ProtectedRoute
          component={FindExperts}
          requireAccountType="company"
        />
      </Route>

      {/* ======================================================
          SETTINGS
          ====================================================== */}

      <Route path="/settings">
        <ProtectedRoute
          component={Settings}
        />
      </Route>

      {/* ======================================================
          404
          ====================================================== */}

      <Route
        component={NotFound}
      />

    </Switch>
  );
}

/* ============================================================
   APP
   ============================================================ */

function App() {
  const basePath =
    import.meta.env.BASE_URL.replace(
      /\/$/,
      ''
    );

  return (
    <QueryClientProvider
      client={queryClient}
    >
      <AuthProvider>

        <TooltipProvider>

          <WouterRouter
            base={basePath}
          >
            <AppRouter />
          </WouterRouter>

          <Toaster />

        </TooltipProvider>

      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

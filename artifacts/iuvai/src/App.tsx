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
   ============================================================

   Used for:
   /login
   /signup
   /forgot-password

   Authenticated users are redirected to their workspace.

   IMPORTANT:
   DO NOT use this for /reset-password.

   Supabase creates a temporary authenticated recovery
   session when the user clicks the password reset link.
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
    if (isLoading || !session) return;

    if (isAdminUser(user?.id)) {
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
   RESET PASSWORD ROUTE
   ============================================================

   This route is intentionally NOT a PublicRoute.

   Supabase establishes a temporary authenticated session
   after the user clicks the recovery email.

   Therefore:

   session === true

   is EXPECTED here.

   We must allow ResetPassword to render instead of sending
   the user to onboarding/dashboard.
============================================================ */

interface ResetPasswordRouteProps {
  component: React.ComponentType;
}

function ResetPasswordRoute({
  component: Component,
}: ResetPasswordRouteProps) {
  const {
    isLoading,
  } = useAuth();

  /*
   * We intentionally do NOT redirect based on session,
   * profile, or account_type here.
   *
   * The ResetPassword page itself handles the recovery
   * session and password update.
   */

  if (isLoading) {
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
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      setLocation('/login');
      return;
    }

    if (isAdminUser(user?.id)) {
      setLocation('/admin');
      return;
    }

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
    user,
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
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

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
      if (profile.account_type === 'expert') {
        setLocation('/dashboard');
      } else if (
        profile.account_type === 'company'
      ) {
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
  } = useAuth();

  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

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
    setLocation,
  ]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!session) {
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
          PUBLIC LANDING PAGE
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

      {/* ======================================================
          PASSWORD RESET

          IMPORTANT:

          This MUST NOT use PublicRoute.

          Supabase creates a recovery session when the
          user clicks the reset email.
          ====================================================== */}

      <Route path="/reset-password">
        <ResetPasswordRoute
          component={ResetPassword}
        />
      </Route>

      {/* ======================================================
          ONBOARDING
          ====================================================== */}

      <Route path="/onboarding">
        <OnboardingRoute
          component={Onboarding}
        />
      </Route>

      {/* ======================================================
          ADMIN DASHBOARD
          ====================================================== */}

      <Route path="/admin">
        <AdminRoute
          component={AdminDashboard}
        />
      </Route>

      {/* ======================================================
          ADMIN — PROJECTS
          ====================================================== */}

      <Route path="/admin/projects">
        <AdminRoute
          component={AdminProjects}
        />
      </Route>

      {/* ======================================================
          ADMIN — PROJECT EXPERTS
          ====================================================== */}

      <Route path="/admin/projects/:projectId/experts">
        <AdminRoute
          component={ProjectExperts}
        />
      </Route>

      {/* ======================================================
          ADMIN — EXPERTS
          ====================================================== */}

      <Route path="/admin/experts">
        <AdminRoute
          component={AdminExperts}
        />
      </Route>

      {/* ======================================================
          ADMIN — EXPERT PROFILE
          ====================================================== */}

      <Route path="/admin/experts/:expertId">
        <AdminRoute
          component={AdminExpertProfile}
        />
      </Route>

      {/* ======================================================
          ADMIN — EXPERT REVIEW

          /admin/projects/PROJECT_ID/experts/EXPERT_ID
          ====================================================== */}

      <Route path="/admin/projects/:projectId/experts/:expertId">
        <AdminRoute
          component={AdminExpertReview}
        />
      </Route>

      {/* ======================================================
          ADMIN — SINGLE PROJECT
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
          COMPANY — FIND EXPERTS
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
          FALLBACK
          ====================================================== */}

      <Route component={NotFound} />

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

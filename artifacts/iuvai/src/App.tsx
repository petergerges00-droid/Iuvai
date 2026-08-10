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
  useRoute,
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
import ExpertProjects from '@/pages/expert-projects';
import ExpertProject from '@/pages/expert-project';
import ExpertProjectWorkspace from '@/pages/expert-project-workspace';
import ExpertEvaluations from '@/pages/expert-evaluations';
import EvaluationPage from '@/pages/EvaluationPage';

import CompanyDashboard from '@/pages/company-dashboard';
import FindExperts from '@/pages/FindExperts';
import CreateProject from '@/pages/create-project';
import CompanyProject from '@/pages/company-project';
import EditProject from '@/pages/edit-project';
import CompanyProjectApplications from '@/pages/company-project-applications';

import ApplyProject from '@/pages/apply-project';

import AdminDashboard from '@/pages/admin-dashboard';
import AdminProjects from '@/pages/admin-projects';
import ProjectExperts from '@/pages/ProjectExperts';
import AdminExpertReview from '@/pages/admin-expert-review';
import AdminExperts from '@/pages/admin-experts';
import AdminExpertProfile from '@/pages/admin-expert-profile';
import AdminEvaluations from '@/pages/AdminEvaluations';
import AdminEvaluationEditor from '@/pages/AdminEvaluationEditor';
import ExpertProjectWorkspace from '@/pages/expert-project-workspace';

import Settings from '@/pages/settings';
import Landing from '@/pages/landing';

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
      if (profile.account_type === 'expert') {
        setLocation('/dashboard');
        return;
      }

      if (profile.account_type === 'company') {
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
   EXPERT EVALUATION ROUTE
   ============================================================

   EvaluationPage requires:

   - evaluationId
   - expertId

   Wouter provides evaluationId from the URL.
   Auth provides the currently logged-in expert.

============================================================ */

function ExpertEvaluationRoute() {
  const [, params] =
    useRoute('/evaluations/:evaluationId');

  const { user } = useAuth();

  if (!params?.evaluationId) {
    return <FullPageLoader />;
  }

  /*
   * The evaluation submission is tied to the expert.
   *
   * If your evaluations tables use the Supabase auth user ID
   * as expert_id, user.id is correct.
   */
  const expertId = user?.id;

  if (!expertId) {
    return <FullPageLoader />;
  }

  return (
    <ProtectedRoute
      component={() => (
        <EvaluationPage
          evaluationId={params.evaluationId}
          expertId={expertId}
        />
      )}
      requireAccountType="expert"
    />
  );
}

/* ============================================================
   ADMIN EVALUATIONS LIST ROUTE
   ============================================================ */

function AdminEvaluationsRoute() {
  const [, setLocation] = useLocation();

  return (
    <AdminRoute
      component={() => (
        <AdminEvaluations
          onCreate={() => {
            /*
             * Evaluation creation is not implemented yet.
             *
             * We will add /admin/evaluations/new once the
             * createEvaluation() Supabase function exists.
             */
            setLocation('/admin/evaluations/new');
          }}
          onEdit={(evaluationId) => {
            setLocation(
              `/admin/evaluations/${evaluationId}`
            );
          }}
        />
      )}
    />
  );
}

/* ============================================================
   ADMIN EVALUATION EDITOR ROUTE
   ============================================================ */

function AdminEvaluationEditorRoute() {
  const [, params] =
    useRoute(
      '/admin/evaluations/:evaluationId'
    );

  const [, setLocation] = useLocation();

  if (!params?.evaluationId) {
    return <FullPageLoader />;
  }

  return (
    <AdminRoute
      component={() => (
        <AdminEvaluationEditor
          evaluationId={params.evaluationId}
          onBack={() =>
            setLocation('/admin/evaluations')
          }
        />
      )}
    />
  );
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
          COMPANY PROJECT EDIT
          ====================================================== */}

      <Route
        path="/company-dashboard/projects/:projectId/edit"
      >
        <ProtectedRoute
          component={EditProject}
          requireAccountType="company"
        />
      </Route>

      {/* ======================================================
          LOGIN
          ====================================================== */}

      <Route path="/login">
        <PublicRoute
          component={Login}
        />
      </Route>
<Route path="/expert/projects/:projectId/workspace">
  <ProtectedRoute
    component={ExpertProjectWorkspace}
    requireAccountType="expert"
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
          ADMIN EVALUATIONS LIST
          ====================================================== */}

      <Route path="/admin/evaluations">
        <AdminEvaluationsRoute />
      </Route>

      {/* ======================================================
          ADMIN EVALUATION EDITOR
          ====================================================== */}

      <Route
        path="/admin/evaluations/:evaluationId"
      >
        <AdminEvaluationEditorRoute />
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
          EXPERT EVALUATIONS LIST
          ====================================================== */}

      <Route path="/evaluations">
        <ProtectedRoute
          component={ExpertEvaluations}
          requireAccountType="expert"
        />
      </Route>

      {/* ======================================================
          SINGLE EXPERT EVALUATION
          ====================================================== */}

      <Route
        path="/evaluations/:evaluationId"
      >
        <ExpertEvaluationRoute />
      </Route>

      {/* ======================================================
          EXPERT PROJECTS
          ====================================================== */}

      <Route path="/expert/projects">
        <ProtectedRoute
          component={ExpertProjects}
          requireAccountType="expert"
        />
      </Route>

      {/* ======================================================
          EXPERT PROJECT APPLICATION
          ====================================================== */}

      <Route
        path="/expert/projects/:projectId/apply"
      >
        <ProtectedRoute
          component={ApplyProject}
          requireAccountType="expert"
        />
      </Route>

      {/* ======================================================
          EXPERT PROJECT WORKSPACE
          ======================================================

          This is the actual work environment for an expert
          who has been assigned to a project.

          URL:

          /expert/projects/:projectId/workspace

          The workspace will later:
          - Load assigned tasks
          - Allow the expert to start a task
          - Display the client's task/input
          - Allow the expert to enter an answer
          - Save/submit the answer
          - Track task progress
          - Eventually support reviewer feedback
      ====================================================== */}

      <Route
        path="/expert/projects/:projectId/workspace"
      >
        <ProtectedRoute
          component={ExpertProjectWorkspace}
          requireAccountType="expert"
        />
      </Route>

      {/* ======================================================
          EXPERT SINGLE PROJECT
          ====================================================== */}

      <Route
        path="/expert/projects/:projectId"
      >
        <ProtectedRoute
          component={ExpertProject}
          requireAccountType="expert"
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
          COMPANY PROJECT APPLICATIONS
          ====================================================== */}

      <Route
        path="/company-dashboard/projects/:projectId/applications"
      >
        <ProtectedRoute
          component={CompanyProjectApplications}
          requireAccountType="company"
        />
      </Route>

      {/* ======================================================
          COMPANY PROJECT
          ====================================================== */}

      <Route
        path="/company-dashboard/projects/:projectId"
      >
        <ProtectedRoute
          component={CompanyProject}
          requireAccountType="company"
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
          CREATE COMPANY PROJECT
          ====================================================== */}

      <Route path="/company-dashboard/projects/new">
        <ProtectedRoute
          component={CreateProject}
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

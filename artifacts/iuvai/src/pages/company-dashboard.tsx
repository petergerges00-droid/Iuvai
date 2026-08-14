import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Users,
  Activity,
  Plus,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';

import {
  getCompanyProfile,
  CompanyProfile,
  supabase,
} from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AutomationProject = {
  id: string;
  title: string;
  description: string | null;
  business_goal: string | null;
  industry: string | null;
  status: string;
  budget: string | null;
  timeline: string | null;
  created_at: string;
  updated_at: string;
};

export default function CompanyDashboard() {
  const { user, profile } = useAuth();

  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile | null>(null);

  const [automationProjects, setAutomationProjects] =
    useState<AutomationProject[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [projectsError, setProjectsError] =
    useState<string | null>(null);

  /*
   * =========================================================
   * LOAD COMPANY DATA
   * =========================================================
   */

  useEffect(() => {
    if (!user?.id) return;

    const loadCompanyData = async () => {
      setIsLoading(true);
      setProjectsError(null);

      try {
        /*
         * -----------------------------------------------------
         * COMPANY PROFILE
         * -----------------------------------------------------
         */

        const companyData = await getCompanyProfile(user.id);

        console.log('COMPANY PROFILE:', companyData);

        setCompanyProfile(companyData);

        /*
         * -----------------------------------------------------
         * AUTOMATION PROJECTS
         * -----------------------------------------------------
         *
         * RLS policy:
         *
         * company_id = auth.uid()
         *
         * Therefore this query only returns projects
         * belonging to the currently authenticated company.
         */

        const {
          data: automationData,
          error: automationError,
        } = await supabase
          .from('automation_projects')
          .select(
            `
              id,
              title,
              description,
              business_goal,
              industry,
              status,
              budget,
              timeline,
              created_at,
              updated_at
            `
          )
          .eq('company_id', user.id)
          .order('created_at', {
            ascending: false,
          });

        if (automationError) {
          console.error(
            'AUTOMATION PROJECTS ERROR:',
            automationError
          );

          setProjectsError(
            'Unable to load automation projects.'
          );

          setAutomationProjects([]);
        } else {
          console.log(
            'AUTOMATION PROJECTS:',
            automationData
          );

          setAutomationProjects(
            (automationData ||
              []) as AutomationProject[]
          );
        }
      } catch (error) {
        console.error(
          'COMPANY DASHBOARD ERROR:',
          error
        );

        setProjectsError(
          'Unable to load workspace data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [user?.id]);

  /*
   * =========================================================
   * DERIVED PROJECT DATA
   * =========================================================
   */

  const activeAutomationProjects = useMemo(() => {
    const terminalStatuses = [
      'completed',
      'cancelled',
      'archived',
    ];

    return automationProjects.filter(
      (project) =>
        !terminalStatuses.includes(
          project.status.toLowerCase()
        )
    );
  }, [automationProjects]);

  const recentAutomationProjects =
    automationProjects.slice(0, 3);

  /*
   * =========================================================
   * AUTH / PROFILE INITIALIZATION
   * =========================================================
   */

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
          </div>

          <p className="text-sm text-muted-foreground">
            Initializing workspace...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
            <Building2 className="h-5 w-5 animate-pulse text-muted-foreground" />
          </div>

          <h1 className="text-xl font-semibold">
            Loading workspace
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your company workspace...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * COMPANY PROFILE NOT FOUND
   * =========================================================
   */

  if (!companyProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>

          <h1 className="text-xl font-semibold">
            Company profile not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We couldn't load your company profile.
            Please complete onboarding or try signing
            in again.
          </p>
        </div>
      </div>
    );
  }

  const companyName =
    companyProfile.company_name ||
    profile.full_name ||
    'Your company';

  /*
   * =========================================================
   * STATUS HELPERS
   * =========================================================
   */

  const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown';

    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === 'completed') {
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500';
    }

    if (
      normalized === 'cancelled' ||
      normalized === 'archived'
    ) {
      return 'border-red-500/30 bg-red-500/10 text-red-500';
    }

    if (
      normalized === 'active' ||
      normalized === 'in_progress' ||
      normalized === 'in progress'
    ) {
      return 'border-primary/30 bg-primary/10 text-primary';
    }

    return 'border-border/60 bg-muted/20 text-muted-foreground';
  };

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <AppLayout title="Overview">
      <div className="space-y-6">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06]">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="mb-5 flex flex-wrap items-center gap-2">

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    <Building2 className="mr-2 h-3 w-3" />
                    COMPANY
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Workspace active
                  </Badge>

                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Company workspace
                </p>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back,{' '}
                  <span className="text-primary">
                    {companyName}
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Connect your AI work with the right
                  intelligence. Access verified human
                  expertise for AI development, or work
                  with IUVAI to automate the workflows
                  behind your business.
                </p>

              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="absolute inset-0 rounded-2xl border border-primary/10" />
                </div>
              </div>

            </div>

            {/* ACTIONS */}

            <div className="relative mt-8 grid gap-3 border-t border-primary/10 pt-6 sm:grid-cols-2">

              {/* HUMAN INTELLIGENCE */}

              <Link
                href="/company-dashboard/projects/new"
                className="group"
              >
                <div className="rounded-xl border border-primary/20 bg-primary/[0.05] p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.08]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[9px] uppercase tracking-[0.18em] text-primary/70">
                        Human Intelligence
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        Build with experts
                      </p>

                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />

                  </div>

                </div>
              </Link>

              {/* AI AUTOMATION */}

              <Link
                href="/company-dashboard/automation/new"
                className="group"
              >
                <div className="rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Workflow className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        AI Automation
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        Automate your workflows
                      </p>

                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />

                  </div>

                </div>
              </Link>

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* QUICK STATS */}
        {/* ================================================= */}

        <div className="grid gap-3 sm:grid-cols-3">

          {/* ACTIVE AUTOMATION PROJECTS */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Active Projects
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {activeAutomationProjects.length}
                </p>

              </div>

            </div>

          </div>

          {/* EXPERTS */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Experts Engaged
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  0
                </p>

              </div>

            </div>

          </div>

          {/* APPLICATIONS */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <FileText className="h-4 w-4 text-emerald-500" />
              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Applications
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  0
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* IUVAI SERVICES */}

          <section className="lg:col-span-2">

            <div className="mb-4">

              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                IUVAI services
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                What are you building?
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Choose the IUVAI service that fits your
                current AI development needs.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* HUMAN INTELLIGENCE */}

              <Link
                href="/company-dashboard/projects/new"
                className="group block"
              >

                <div className="relative h-full overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 transition-all hover:border-primary/40 hover:bg-primary/[0.07]">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>

                  <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-primary/70">
                    Human Intelligence
                  </p>

                  <h4 className="mt-2 text-lg font-semibold">
                    AI training & expert projects
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Access verified specialists to
                    evaluate, train, test, and improve
                    your AI systems.
                  </p>

                  <div className="mt-6 flex items-center text-xs font-medium text-primary">
                    Start a project
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>

                </div>

              </Link>

              {/* AI AUTOMATION */}

              <Link
                href="/company-dashboard/automation/new"
                className="group block"
              >

                <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Workflow className="h-5 w-5 text-primary" />
                  </div>

                  <p className="mt-6 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    AI Automation
                  </p>

                  <h4 className="mt-2 text-lg font-semibold">
                    Automate your workflows
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Let IUVAI design, build, test, and
                    deploy AI-powered workflows for your
                    business.
                  </p>

                  <div className="mt-6 flex items-center text-xs font-medium text-primary">
                    Request automation
                    <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>

                </div>

              </Link>

            </div>

          </section>

          {/* COMPANY PROFILE */}

          <section className="space-y-4">

            <div>

              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                Organization
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                Company profile
              </h3>

            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40">

              <div className="border-b border-border/60 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">

                    <h4 className="truncate text-sm font-semibold">
                      {companyName}
                    </h4>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {companyProfile.industry ||
                        'Industry not specified'}
                    </p>

                  </div>

                </div>

              </div>

              <div className="space-y-5 p-5">

                <div>

                  <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Company size
                  </p>

                  <p className="text-sm font-medium">
                    {companyProfile.company_size ||
                      'Not specified'}
                  </p>

                </div>

                <div>

                  <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Website
                  </p>

                  {companyProfile.website ? (
                    <a
                      href={companyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm font-medium text-primary hover:underline"
                    >
                      {companyProfile.website}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not specified
                    </p>
                  )}

                </div>

                <div className="border-t border-border/60 pt-4">

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">

                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                    <span>
                      Your organization profile is ready
                      for project creation.
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ================================================= */}
        {/* AUTOMATION PROJECTS */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-border/60 bg-card/40">

          <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

            <div>

              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                AI Automation
              </p>

              <h3 className="mt-1 text-sm font-semibold">
                Recent automation projects
              </h3>

            </div>

            <div className="flex items-center gap-2">

              <Badge
                variant="outline"
                className="border-border/60 bg-muted/20 text-[9px] uppercase tracking-wider"
              >
                {automationProjects.length}{' '}
                {automationProjects.length === 1
                  ? 'project'
                  : 'projects'}
              </Badge>

              <Button
                size="sm"
                asChild
              >
                <Link href="/company-dashboard/automation/new">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  New project
                </Link>
              </Button>

            </div>

          </div>

          {/* ERROR */}

          {projectsError ? (
            <div className="p-8 text-center sm:p-10">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5">
                <Activity className="h-5 w-5 text-red-500" />
              </div>

              <h4 className="mt-4 text-sm font-semibold">
                Unable to load projects
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {projectsError}
              </p>

            </div>
          ) : recentAutomationProjects.length === 0 ? (

            /* EMPTY STATE */

            <div className="p-8 text-center sm:p-10">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                <Workflow className="h-5 w-5 text-muted-foreground" />
              </div>

              <h4 className="mt-4 text-sm font-semibold">
                No automation projects yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Define a workflow you'd like to automate
                and IUVAI will help turn it into an
                AI-powered system.
              </p>

              <Button
                className="mt-5"
                asChild
              >
                <Link href="/company-dashboard/automation/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first automation
                </Link>
              </Button>

            </div>

          ) : (

            /* PROJECT LIST */

            <div className="divide-y divide-border/60">

              {recentAutomationProjects.map(
                (project) => (
                  <Link
                    key={project.id}
                    href={`/company-dashboard/automation/${project.id}`}
                    className="group block"
                  >

                    <div className="p-5 transition-colors hover:bg-primary/[0.025] sm:p-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h4 className="truncate text-sm font-semibold">
                              {project.title}
                            </h4>

                            <Badge
                              variant="outline"
                              className={`text-[9px] uppercase tracking-wider ${getStatusClass(
                                project.status
                              )}`}
                            >
                              {getStatusLabel(
                                project.status
                              )}
                            </Badge>

                          </div>

                          {project.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {project.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">

                            {project.industry && (
                              <span>
                                {project.industry}
                              </span>
                            )}

                            {project.timeline && (
                              <span>
                                {project.timeline}
                              </span>
                            )}

                            {project.budget && (
                              <span>
                                {project.budget}
                              </span>
                            )}

                          </div>

                        </div>

                        <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />

                      </div>

                    </div>

                  </Link>
                )
              )}

            </div>

          )}

          {/* VIEW ALL */}

          {automationProjects.length > 3 && (
            <div className="border-t border-border/60 p-4 text-center">

              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href="/company-dashboard/automation">
                  View all automation projects
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>

            </div>
          )}

        </section>

        {/* ================================================= */}
        {/* GETTING STARTED */}
        {/* ================================================= */}

        <section>

          <div className="mb-4">

            <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
              Getting started
            </p>

            <h3 className="mt-1 text-xl font-semibold tracking-tight">
              Build with IUVAI
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Start by defining what your AI initiative
              needs, then connect with the right solution.
            </p>

          </div>

          <div className="space-y-3">

            {/* STEP 1 */}

            <Link
              href="/company-dashboard/automation/new"
              className="group block"
            >

              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-5 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                    <span className="font-mono text-sm font-semibold text-primary">
                      01
                    </span>

                  </div>

                  <div className="min-w-0 flex-1">

                    <h4 className="font-semibold">
                      Define your AI initiative
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Create an automation project or
                      define the human expertise your AI
                      system requires.
                    </p>

                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />

                </div>

              </div>

            </Link>

            {/* STEP 2 */}

            <Link
              href="/company/find-experts"
              className="group block"
            >

              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-5 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">

                <div className="flex items-center gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                    <span className="font-mono text-sm font-semibold text-primary">
                      02
                    </span>

                  </div>

                  <div className="min-w-0 flex-1">

                    <h4 className="font-semibold">
                      Connect the intelligence
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      Find verified specialists when your
                      AI project requires human expertise.
                    </p>

                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />

                </div>

              </div>

            </Link>

            {/* STEP 3 */}

            <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">

                  <span className="font-mono text-sm font-semibold text-emerald-500">
                    03
                  </span>

                </div>

                <div className="min-w-0 flex-1">

                  <h4 className="font-semibold">
                    Build and improve
                  </h4>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Build your workflow, evaluate the
                    results, and continuously improve your
                    AI system.
                  </p>

                </div>

                <span className="shrink-0 text-[8px] uppercase tracking-[0.18em] text-muted-foreground/40">
                  IUVAI
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* RECENT ACTIVITY */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-border/60 bg-card/40">

          <div className="flex items-center justify-between border-b border-border/60 p-5 sm:p-6">

            <div>

              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Workspace
              </p>

              <h3 className="mt-1 text-sm font-semibold">
                Recent activity
              </h3>

            </div>

            <Badge
              variant="outline"
              className="border-border/60 bg-muted/20 text-[9px] uppercase tracking-wider"
            >
              {automationProjects.length > 0
                ? `${automationProjects.length} project${
                    automationProjects.length === 1
                      ? ''
                      : 's'
                  }`
                : 'No activity'}
            </Badge>

          </div>

          {automationProjects.length === 0 ? (

            <div className="p-8 text-center sm:p-10">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>

              <h4 className="mt-4 text-sm font-semibold">
                Your workspace is ready
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Once you create projects, invite experts,
                or receive applications, activity will
                appear here.
              </p>

              <Button
                className="mt-5"
                asChild
              >
                <Link href="/company-dashboard/automation/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first project
                </Link>
              </Button>

            </div>

          ) : (

            <div className="divide-y divide-border/60">

              {automationProjects
                .slice(0, 5)
                .map((project) => (
                  <Link
                    key={project.id}
                    href={`/company-dashboard/automation/${project.id}`}
                    className="group block"
                  >

                    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-primary/[0.025] sm:p-5">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Workflow className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="truncate text-sm font-medium">
                            {project.title}
                          </p>

                          <Badge
                            variant="outline"
                            className={`text-[8px] uppercase tracking-wider ${getStatusClass(
                              project.status
                            )}`}
                          >
                            {getStatusLabel(
                              project.status
                            )}
                          </Badge>

                        </div>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {project.industry ||
                            'AI automation project'}
                        </p>

                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />

                    </div>

                  </Link>
                ))}

            </div>

          )}

        </section>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-2 border-t border-border/50 pt-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 uppercase tracking-[0.16em]">

            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

            IUVAI workspace active

          </div>

          <div className="flex items-center gap-2 uppercase tracking-[0.16em] text-muted-foreground/40">

            <Sparkles className="h-3 w-3" />

            Human intelligence infrastructure

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

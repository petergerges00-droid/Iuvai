import { useEffect, useState } from 'react';
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
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();

  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadCompanyProfile = async () => {
      setIsLoading(true);

      try {
        const data = await getCompanyProfile(user.id);

        console.log('COMPANY PROFILE:', data);

        setCompanyProfile(data);
      } catch (error) {
        console.error(
          'COMPANY PROFILE ERROR:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyProfile();
  }, [user?.id]);

  /*
   * Auth/profile initialization
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
   * Company profile loading
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
   * Company profile could not be loaded
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
                  Connect your AI work with the right intelligence.
                  Access verified human expertise for AI development,
                  or work with IUVAI to automate the workflows behind
                  your business.
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
                  0
                </p>
              </div>

            </div>
          </div>

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
                Choose the IUVAI service that fits your current
                AI development needs.
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
                    Access verified specialists to evaluate,
                    train, test, and improve your AI systems.
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
                    Let IUVAI design, build, test, and deploy
                    AI-powered workflows for your business.
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
              No activity
            </Badge>

          </div>

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
              <Link href="/company-dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first project
              </Link>
            </Button>

          </div>

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

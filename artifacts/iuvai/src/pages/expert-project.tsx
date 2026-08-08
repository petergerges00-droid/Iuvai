import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/*
============================================================
PROJECT TYPE
============================================================
*/

interface Project {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  project_type: string | null;
  required_field: string | null;
  required_skills: string[] | null;
  experts_needed: number | null;
  estimated_hours: number | null;
  deadline: string | null;
  budget: string | number | null;
  status:
    | 'draft'
    | 'open'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | string;
  created_at: string;
  updated_at?: string | null;
}

/*
============================================================
STATUS HELPERS
============================================================
*/

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status.replace(/_/g, ' ');
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'open':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500';

    case 'in_progress':
      return 'border-primary/30 bg-primary/10 text-primary';

    case 'completed':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-500';

    case 'draft':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-500';

    case 'cancelled':
      return 'border-destructive/30 bg-destructive/10 text-destructive';

    default:
      return 'border-border/60 bg-muted/20 text-muted-foreground';
  }
}

function formatDate(date: string | null) {
  if (!date) {
    return 'Not specified';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/*
============================================================
PAGE
============================================================
*/

export default function ExpertProject() {
  const { user, profile } = useAuth();

  const [, params] = useRoute(
    '/expert/projects/:projectId'
  );

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
  ============================================================
  LOAD PROJECT
  ============================================================
  */

  useEffect(() => {
    if (!user?.id || !projectId) {
      return;
    }

    let mounted = true;

    async function loadProject() {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data,
          error: projectError,
        } = await supabase
          .from('projects')
          .select(
            `
              id,
              company_id,
              title,
              description,
              project_type,
              required_field,
              required_skills,
              experts_needed,
              estimated_hours,
              deadline,
              budget,
              status,
              created_at,
              updated_at
            `
          )
          .eq('id', projectId)
          .eq('status', 'open')
          .maybeSingle();

        if (projectError) {
          console.error(
            'EXPERT PROJECT LOAD ERROR:',
            projectError
          );

          if (mounted) {
            setError(
              'We could not load this project.'
            );
          }

          return;
        }

        if (!data) {
          if (mounted) {
            setError(
              'This project is no longer available or could not be found.'
            );
          }

          return;
        }

        if (mounted) {
          setProject(data as Project);
        }
      } catch (err) {
        console.error(
          'EXPERT PROJECT LOAD EXCEPTION:',
          err
        );

        if (mounted) {
          setError(
            'Something went wrong while loading the project.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      mounted = false;
    };
  }, [user?.id, projectId]);

  /*
  ============================================================
  AUTH / PROFILE INITIALIZATION
  ============================================================
  */

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <p className="text-sm text-muted-foreground">
            Initializing workspace...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <h1 className="text-xl font-semibold">
            Loading project
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing project details...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error || !project) {
    return (
      <AppLayout title="Project">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold">
              Project unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error ||
                'This project could not be found.'}
            </p>

            <Button
              className="mt-6"
              variant="outline"
              asChild
            >
              <Link href="/expert/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  NORMALIZED VALUES
  ============================================================
  */

  const skills =
    Array.isArray(project.required_skills)
      ? project.required_skills
      : [];

  const statusLabel =
    getStatusLabel(project.status);

  const statusClasses =
    getStatusClasses(project.status);

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Project">
      <div className="space-y-6">

        {/* ==================================================
            HEADER
            ================================================== */}

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.045]">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />

          <div className="relative p-6 sm:p-8">

            <Link
              href="/expert/projects"
              className="mb-6 inline-flex items-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Available projects
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

              <div className="min-w-0 max-w-3xl">

                <div className="mb-4 flex flex-wrap items-center gap-2">

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    <Briefcase className="mr-2 h-3 w-3" />
                    PROJECT
                  </Badge>

                  <Badge
                    variant="outline"
                    className={statusClasses}
                  >
                    {project.status === 'open' && (
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}

                    {statusLabel}
                  </Badge>

                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Expert opportunity
                </p>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {project.title}
                </h1>

                {project.description && (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {project.description}
                  </p>
                )}

              </div>

              <div className="shrink-0">

                <Button
                  size="lg"
                  asChild
                  className="min-w-[170px]"
                >
                  <Link
                    href={`/expert/projects/${project.id}/apply`}
                  >
                    Apply to Project
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

              </div>

            </div>
          </div>
        </section>

        {/* ==================================================
            PROJECT OVERVIEW
            ================================================== */}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ProjectStat
            icon={
              <Layers3 className="h-4 w-4 text-primary" />
            }
            label="Project type"
            value={
              project.project_type ||
              'Not specified'
            }
          />

          <ProjectStat
            icon={
              <ShieldCheck className="h-4 w-4 text-primary" />
            }
            label="Expertise"
            value={
              project.required_field ||
              'Not specified'
            }
          />

          <ProjectStat
            icon={
              <Clock3 className="h-4 w-4 text-primary" />
            }
            label="Estimated hours"
            value={
              project.estimated_hours != null
                ? `${project.estimated_hours} hrs`
                : 'Not specified'
            }
          />

          <ProjectStat
            icon={
              <DollarSign className="h-4 w-4 text-emerald-500" />
            }
            label="Budget"
            value={
              project.budget != null &&
              project.budget !== ''
                ? String(project.budget)
                : 'Not specified'
            }
          />

        </div>

        {/* ==================================================
            MAIN CONTENT
            ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ==================================================
              REQUIREMENTS
              ================================================== */}

          <section className="lg:col-span-2">

            <div className="mb-4">
              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                Project requirements
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                What we're looking for
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Review the requirements carefully before
                submitting your application.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40">

              {/* REQUIRED FIELD */}

              <div className="border-b border-border/60 p-5 sm:p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                      Required expertise
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {project.required_field ||
                        'Not specified'}
                    </p>

                  </div>

                </div>

              </div>

              {/* SKILLS */}

              <div className="p-5 sm:p-6">

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Required skills
                </p>

                {skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">

                    {skills.map(
                      (skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          variant="outline"
                          className="border-primary/15 bg-primary/[0.04] text-xs font-normal"
                        >
                          {skill}
                        </Badge>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No specific skills listed.
                  </p>
                )}

              </div>

            </div>
          </section>

          {/* ==================================================
              PROJECT DETAILS
              ================================================== */}

          <section>

            <div className="mb-4">
              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                Project details
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                Timeline & compensation
              </h2>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40">

              <div className="space-y-5 p-5 sm:p-6">

                <DetailRow
                  icon={
                    <CalendarDays className="h-4 w-4" />
                  }
                  label="Deadline"
                  value={formatDate(
                    project.deadline
                  )}
                />

                <DetailRow
                  icon={
                    <Clock3 className="h-4 w-4" />
                  }
                  label="Estimated work"
                  value={
                    project.estimated_hours !=
                    null
                      ? `${project.estimated_hours} hours`
                      : 'Not specified'
                  }
                />

                <DetailRow
                  icon={
                    <Users className="h-4 w-4" />
                  }
                  label="Experts needed"
                  value={
                    project.experts_needed !=
                    null
                      ? `${project.experts_needed} expert${
                          project.experts_needed ===
                          1
                            ? ''
                            : 's'
                        }`
                      : 'Not specified'
                  }
                />

                <DetailRow
                  icon={
                    <DollarSign className="h-4 w-4" />
                  }
                  label="Project budget"
                  value={
                    project.budget != null &&
                    project.budget !== ''
                      ? String(project.budget)
                      : 'Not specified'
                  }
                />

              </div>

              <div className="border-t border-border/60 p-5">

                <div className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">

                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                  <span>
                    Project information is provided by the
                    organization and is intended for
                    authorized marketplace participants.
                  </span>

                </div>

              </div>

            </div>
          </section>
        </div>

        {/* ==================================================
            APPLICATION CTA
            ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <h2 className="text-xl font-semibold tracking-tight">
                  Think you're a good fit?
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Tell the company why your expertise is
                  relevant to this project. Your application
                  will be reviewed by the project team.
                </p>

              </div>

              <Button
                size="lg"
                asChild
                className="shrink-0"
              >
                <Link
                  href={`/expert/projects/${project.id}/apply`}
                >
                  Apply to Project
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

            </div>

          </div>
        </section>

        {/* ==================================================
            FOOTER
            ================================================== */}

        <div className="flex flex-col gap-2 border-t border-border/50 pt-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 uppercase tracking-[0.16em]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Expert marketplace
          </div>

          <div className="flex items-center gap-2 uppercase tracking-[0.16em] text-muted-foreground/40">
            <FileText className="h-3 w-3" />
            IUVAI Studio
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

/*
============================================================
PROJECT STAT
============================================================
*/

function ProjectStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
            {label}
          </p>

          <p className="mt-0.5 truncate text-sm font-medium">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

/*
============================================================
DETAIL ROW
============================================================
*/

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium">
          {value}
        </p>

      </div>

    </div>
  );
}

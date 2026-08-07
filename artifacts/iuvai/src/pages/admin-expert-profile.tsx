import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import {
  Loader2,
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getExperts,
  getCompanyProjects,
  ExpertWithProfile,
  Project,
} from '@/lib/supabase';

const ADMIN_COMPANY_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';

export default function AdminExpertProfile() {
  const params = useParams<{
    expertId: string;
  }>();

  const expertId = params.expertId;

  const [expert, setExpert] =
    useState<ExpertWithProfile | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
  ============================================================
  LOAD EXPERT
  ============================================================
  */

  useEffect(() => {
    async function loadExpert() {
      try {
        setIsLoading(true);
        setError(null);

        if (!expertId) {
          throw new Error(
            'Expert ID is missing.'
          );
        }

        /*
        --------------------------------------------------------
        Load all experts.
        We filter here because the existing getExperts()
        function already returns ExpertWithProfile[].
        --------------------------------------------------------
        */

        const experts = await getExperts();

        const foundExpert = experts.find(
          (item) =>
            item.id === expertId
        );

        if (!foundExpert) {
          throw new Error(
            'Expert not found.'
          );
        }

        setExpert(foundExpert);

        /*
        --------------------------------------------------------
        Load available IUVAI projects.
        --------------------------------------------------------
        */

        const companyProjects =
          await getCompanyProjects(
            ADMIN_COMPANY_ID
          );

        setProjects(companyProjects);
      } catch (err) {
        console.error(
          'ADMIN EXPERT PROFILE LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load expert.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadExpert();
  }, [expertId]);

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (isLoading) {
    return (
      <AppLayout title="Expert">

        <div className="flex min-h-[400px] items-center justify-center">

          <Loader2 className="h-7 w-7 animate-spin text-primary" />

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error || !expert) {
    return (
      <AppLayout title="Expert">

        <div className="space-y-6">

          <Link
            href="/admin/experts"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to experts
          </Link>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">

            <p className="text-sm font-medium text-destructive">
              Unable to load expert
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {error ||
                'The requested expert could not be found.'}
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  EXPERT DATA
  ============================================================
  */

  const name =
    expert.profile?.full_name ||
    'Unnamed expert';

  const country =
    expert.profile?.country ||
    'Country not specified';

  const primaryField =
    expert.primary_field ||
    'Field not specified';

  const specialization =
    expert.specialization ||
    'Specialization not specified';

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Expert Profile">

      <div className="space-y-8">

        {/* ====================================================
            BACK
            ==================================================== */}

        <Link
          href="/admin/experts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to experts
        </Link>

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-6">

            <div className="flex flex-col gap-5 md:flex-row md:items-center">

              {/* Avatar */}

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">

                <span className="text-xl font-semibold">

                  {name
                    .charAt(0)
                    .toUpperCase()}

                </span>

              </div>

              {/* Identity */}

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <ShieldCheck className="h-4 w-4 text-primary" />

                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                    IUVAI Expert
                  </p>

                </div>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {primaryField}
                  {specialization
                    ? ` · ${specialization}`
                    : ''}
                </p>

              </div>

              {/* Status */}

              <div className="shrink-0">

                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                  Pending review
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              BASIC INFORMATION
              ================================================== */}

          <div className="grid gap-px bg-border/60 md:grid-cols-3">

            <div className="bg-card/70 p-5">

              <div className="flex items-center gap-2">

                <User className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Primary field
                </p>

              </div>

              <p className="mt-2 text-sm font-medium">
                {primaryField}
              </p>

            </div>

            <div className="bg-card/70 p-5">

              <div className="flex items-center gap-2">

                <Briefcase className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Specialization
                </p>

              </div>

              <p className="mt-2 text-sm font-medium">
                {specialization}
              </p>

            </div>

            <div className="bg-card/70 p-5">

              <div className="flex items-center gap-2">

                <MapPin className="h-4 w-4 text-muted-foreground" />

                <p className="text-xs text-muted-foreground">
                  Country
                </p>

              </div>

              <p className="mt-2 text-sm font-medium">
                {country}
              </p>

            </div>

          </div>

        </div>

        {/* ====================================================
            PROJECTS
            ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Projects
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Select a project to review this expert for that project.
            </p>

          </div>

          {projects.length === 0 ? (
            <div className="p-10 text-center">

              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/40" />

              <p className="mt-3 text-sm font-medium">
                No projects available
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Create a project before reviewing experts.
              </p>

              <Link
                href="/admin/projects"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View projects
                <ChevronRight className="h-4 w-4" />
              </Link>

            </div>
          ) : (
            <div className="divide-y divide-border/60">

              {projects.map(
                (project) => (
                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}/experts/${expert.id}`}
                    className="group block transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
                  >

                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

                      <div className="min-w-0">

                        <p className="font-medium">
                          {project.title}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">

                          {project.primary_field ||
                            'Field not specified'}

                          {project.specialization
                            ? ` · ${project.specialization}`
                            : ''}

                        </p>

                        {project.description && (
                          <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                            {project.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">

                          {project.required_skills?.map(
                            (skill) => (
                              <span
                                key={skill}
                                className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                              >
                                {skill}
                              </span>
                            )
                          )}

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                          {project.status}
                        </span>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

                      </div>

                    </div>

                  </Link>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </AppLayout>
  );
}

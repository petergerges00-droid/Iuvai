import { useEffect, useState } from 'react';
import {
  Loader2,
  FolderKanban,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getAllProjects,
  Project,
} from '@/lib/supabase';

export default function AdminProjects() {
  const [, setLocation] = useLocation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAllProjects();

        console.log('ADMIN PROJECTS LOADED:', data);

        setProjects(data);
      } catch (err) {
        console.error(
          'ADMIN PROJECT LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load projects.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  /*
   * ============================================================
   * OPEN PROJECT
   * ============================================================
   *
   * We intentionally use native browser navigation here instead
   * of Wouter's setLocation().
   *
   * This removes Wouter from the equation while we debug the
   * project → experts navigation.
   */
  function openProject(projectId: string) {
    const destination =
      `/admin/projects/${projectId}/experts`;

    console.log(
      '===================================='
    );

    console.log(
      'OPENING PROJECT:',
      projectId
    );

    console.log(
      'NAVIGATING TO:',
      destination
    );

    console.log(
      '===================================='
    );

    window.location.assign(destination);
  }

  /*
   * ============================================================
   * BACK TO ADMIN
   * ============================================================
   */

  function goToAdmin() {
    setLocation('/admin');
  }

  return (
    <AppLayout title="Projects">
      <div className="space-y-8">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-primary" />

            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
              IUVAI / Internal
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Project Network
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Review projects and connect them with suitable experts.
          </p>

          {/* Back button */}
          <button
            type="button"
            onClick={goToAdmin}
            className="mt-4 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to admin dashboard
          </button>
        </div>

        {/* ======================================================
            STATS
            ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          {/* Total */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Total projects
              </p>

              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {projects.length}
            </p>
          </div>

          {/* Open */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Open
              </p>

              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === 'open'
                ).length
              }
            </p>
          </div>

          {/* In progress */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                In progress
              </p>

              <Users className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === 'in_progress'
                ).length
              }
            </p>
          </div>

        </div>

        {/* ======================================================
            PROJECT LIST
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          {/* Header */}
          <div className="border-b border-border/60 p-5">
            <h3 className="font-medium">
              Projects
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Projects available for expert matching.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="p-6">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            </div>
          )}

          {/* No projects */}
          {!isLoading &&
            !error &&
            projects.length === 0 && (
              <div className="p-10 text-center">

                <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No projects yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Projects you add to IUVAI will appear here.
                </p>

              </div>
            )}

          {/* Projects */}
          {!isLoading &&
            !error &&
            projects.length > 0 && (
              <div className="divide-y divide-border/60">

                {projects.map((project) => (

                  <div
                    key={project.id}
                    className="group flex w-full flex-col gap-4 p-5 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
                  >

                    {/* Project information */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h4 className="font-medium">
                          {project.title}
                        </h4>

                        <span className="shrink-0 rounded-full border border-border/60 px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {project.status.replace(
                            '_',
                            ' '
                          )}
                        </span>

                      </div>

                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {project.description ||
                          'No project description provided.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">

                        {project.primary_field && (
                          <span>
                            Field: {project.primary_field}
                          </span>
                        )}

                        {project.specialization && (
                          <span>
                            Specialization:{' '}
                            {project.specialization}
                          </span>
                        )}

                        {project.project_type && (
                          <span>
                            Type: {project.project_type}
                          </span>
                        )}

                        {project.budget && (
                          <span>
                            Budget: {project.budget}
                          </span>
                        )}

                        {project.duration && (
                          <span>
                            Duration: {project.duration}
                          </span>
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        OPEN PROJECT BUTTON
                        ================================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        openProject(project.id)
                      }
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/50 active:scale-[0.98]"
                    >
                      Open

                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>

                  </div>

                ))}

              </div>
            )}

        </div>

      </div>
    </AppLayout>
  );
}

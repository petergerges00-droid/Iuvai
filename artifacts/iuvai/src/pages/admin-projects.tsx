import { useEffect, useState } from 'react';

import {
  Loader2,
  FolderKanban,
  Clock,
  Users,
  ChevronRight,
  Trash2,
} from 'lucide-react';

import { useLocation } from 'wouter';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getAllProjects,
  deleteProject,
  Project,
} from '@/lib/supabase';

export default function AdminProjects() {
  const [, setLocation] = useLocation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /*
   * Stores the ID of the project currently being deleted.
   *
   * This lets us show a loading state only on the project
   * that is being deleted rather than disabling the entire
   * project list.
   */
  const [deletingProjectId, setDeletingProjectId] =
    useState<string | null>(null);

  /* ============================================================
     LOAD PROJECTS
     ============================================================ */

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAllProjects();

        console.log(
          'ADMIN PROJECTS LOADED:',
          data
        );

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

  /* ============================================================
     OPEN PROJECT
     ============================================================

     We intentionally use native browser navigation here instead
     of Wouter's setLocation().

     This keeps project → experts navigation independent from
     Wouter while debugging.
     ============================================================ */

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

  /* ============================================================
     DELETE PROJECT
     ============================================================ */

  async function handleDeleteProject(
    project: Project
  ) {
    /*
     * Prevent another deletion while one is already in progress.
     */

    if (deletingProjectId) {
      return;
    }

    /*
     * Ask for confirmation before deleting.
     *
     * We deliberately include the project title so the admin
     * knows exactly which project is being deleted.
     */

    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingProjectId(project.id);
      setError(null);

      console.log(
        '===================================='
      );

      console.log(
        'DELETING PROJECT:',
        project.id
      );

      console.log(
        'PROJECT TITLE:',
        project.title
      );

      console.log(
        '===================================='
      );

      /*
       * Delete the project from Supabase.
       */

      await deleteProject(project.id);

      /*
       * Remove the project from the local UI after the database
       * deletion succeeds.
       */

      setProjects((currentProjects) =>
        currentProjects.filter(
          (currentProject) =>
            currentProject.id !== project.id
        )
      );

      console.log(
        'PROJECT DELETED SUCCESSFULLY:',
        project.id
      );
    } catch (err) {
      console.error(
        'PROJECT DELETE ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete project.'
      );
    } finally {
      setDeletingProjectId(null);
    }
  }

  /* ============================================================
     BACK TO ADMIN
     ============================================================ */

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

          {/* ==================================================
              GLOBAL ERROR
              ================================================== */}

          {!isLoading && error && (
            <div className="border-b border-border/60 p-5">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            </div>
          )}

          {/* ==================================================
              LOADING
              ================================================== */}

          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {/* ==================================================
              NO PROJECTS
              ================================================== */}

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

          {/* ==================================================
              PROJECTS
              ================================================== */}

          {!isLoading &&
            projects.length > 0 && (
              <div className="divide-y divide-border/60">

                {projects.map((project) => {
                  const isDeleting =
                    deletingProjectId === project.id;

                  return (
                    <div
                      key={project.id}
                      className="group flex w-full flex-col gap-4 p-5 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
                    >

                      {/* ======================================
                          PROJECT INFORMATION
                          ====================================== */}

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

                      {/* ======================================
                          ACTIONS
                          ====================================== */}

                      <div className="flex shrink-0 items-center gap-2">

                        {/* OPEN */}

                        <button
                          type="button"
                          onClick={() =>
                            openProject(project.id)
                          }
                          disabled={isDeleting}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Open

                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProject(
                              project
                            )
                          }
                          disabled={
                            deletingProjectId !==
                              null
                          }
                          title="Delete project"
                          aria-label={`Delete ${project.title}`}
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive transition-all hover:border-destructive/50 hover:bg-destructive/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </div>

      </div>
    </AppLayout>
  );
}

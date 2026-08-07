import { useEffect, useState } from 'react';
import {
  Loader2,
  FolderKanban,
  Clock,
  Users,
  ChevronRight,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import {
  getAllProjects,
  Project,
} from '@/lib/supabase';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getAllProjects();
        setProjects(data);
      } catch (err) {
        console.error('ADMIN PROJECT LOAD ERROR:', err);

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

  return (
    <AppLayout title="Projects">
      <div className="space-y-8">

        {/* Header */}
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
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">

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
                  (project) => project.status === 'open'
                ).length
              }
            </p>
          </div>

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

        {/* Project list */}
        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">
            <h3 className="font-medium">
              Projects
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Projects available for expert matching.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-10 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                No projects yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Projects you add to IUVAI will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">

              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    window.location.href =
                      `/admin/projects/${project.id}`;
                  }}
                  className="group flex w-full flex-col gap-4 p-5 text-left transition hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
                >

                  <div className="min-w-0">

                    <div className="flex items-center gap-3">
                      <h4 className="truncate font-medium">
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

                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 md:block" />

                </button>
              ))}

            </div>
          )}

        </div>

      </div>
    </AppLayout>
  );
}

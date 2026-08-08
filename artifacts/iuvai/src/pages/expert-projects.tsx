import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Clock3,
  DollarSign,
  Loader2,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  status: string;
  created_at: string;
  updated_at?: string | null;
}

const PROJECT_TYPES = [
  'All project types',
  'AI model evaluation',
  'AI training / data annotation',
  'Expert review',
  'Data validation',
  'Content evaluation',
  'Domain-specific quality assurance',
  'Research',
  'Other',
];

const EXPERTISE_FIELDS = [
  'All expertise fields',
  'Medicine',
  'Law',
  'Finance',
  'Engineering',
  'Science',
  'Education',
  'Technology',
  'Business',
  'Languages',
  'Other',
];

function formatDate(date: string | null) {
  if (!date) return 'No deadline';

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

function formatBudget(
  budget: string | number | null
) {
  if (budget === null || budget === '') {
    return 'Budget not specified';
  }

  const numericBudget = Number(budget);

  if (Number.isFinite(numericBudget)) {
    return `$${numericBudget.toLocaleString()}`;
  }

  return String(budget);
}

export default function ExpertProjects() {
  const { user, profile } = useAuth();

  const [projects, setProjects] = useState<Project[]>(
    []
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState('');

  const [projectType, setProjectType] =
    useState('All project types');

  const [expertiseField, setExpertiseField] =
    useState('All expertise fields');

  /*
  ============================================================
  LOAD OPEN PROJECTS
  ============================================================
  */

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    async function loadProjects() {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data,
          error: projectsError,
        } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'open')
          .order('created_at', {
            ascending: false,
          });

        if (projectsError) {
          console.error(
            'EXPERT PROJECTS LOAD ERROR:',
            projectsError
          );

          if (mounted) {
            setError(
              'We could not load available projects.'
            );
          }

          return;
        }

        if (mounted) {
          setProjects(
            (data || []) as Project[]
          );
        }
      } catch (err) {
        console.error(
          'EXPERT PROJECTS LOAD EXCEPTION:',
          err
        );

        if (mounted) {
          setError(
            'Something went wrong while loading projects.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  /*
  ============================================================
  FILTER PROJECTS
  ============================================================
  */

  const filteredProjects = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        project.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        project.required_field
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        project.required_skills?.some((skill) =>
          skill
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesType =
        projectType === 'All project types' ||
        project.project_type === projectType;

      const matchesField =
        expertiseField ===
          'All expertise fields' ||
        project.required_field ===
          expertiseField;

      return (
        matchesSearch &&
        matchesType &&
        matchesField
      );
    });
  }, [
    projects,
    search,
    projectType,
    expertiseField,
  ]);

  const hasFilters =
    search.trim() !== '' ||
    projectType !== 'All project types' ||
    expertiseField !==
      'All expertise fields';

  function clearFilters() {
    setSearch('');
    setProjectType('All project types');
    setExpertiseField(
      'All expertise fields'
    );
  }

  /*
  ============================================================
  AUTH
  ============================================================
  */

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-primary" />

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
            Loading projects
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Finding available expert opportunities...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppLayout title="Projects">
      <div className="space-y-6">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    <Briefcase className="mr-2 h-3 w-3" />
                    EXPERT MARKETPLACE
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {projects.length} open{' '}
                    {projects.length === 1
                      ? 'project'
                      : 'projects'}
                  </Badge>
                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Available opportunities
                </p>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Find projects that need your expertise
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Browse open AI projects looking for
                  qualified human experts. Review the
                  requirements, understand the work, and
                  apply to projects that match your
                  expertise.
                </p>
              </div>

              <div className="hidden shrink-0 lg:flex">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* SEARCH / FILTERS */}
        {/* ================================================= */}

        <section className="rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
              Project discovery
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Find the right opportunity
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search projects, skills, or expertise..."
                className="h-11 border-border/60 bg-background/40 pl-10"
              />
            </div>

            <select
              value={projectType}
              onChange={(event) =>
                setProjectType(event.target.value)
              }
              className="h-11 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={expertiseField}
              onChange={(event) =>
                setExpertiseField(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            >
              {EXPERTISE_FIELDS.map(
                (field) => (
                  <option
                    key={field}
                    value={field}
                  >
                    {field}
                  </option>
                )
              )}
            </select>

            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : (
              <div />
            )}
          </div>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <section className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3">
            <p className="text-xs font-medium text-destructive">
              Unable to load projects
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {error}
            </p>
          </section>
        )}

        {/* ================================================= */}
        {/* RESULTS HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
              Open opportunities
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              {filteredProjects.length}{' '}
              {filteredProjects.length === 1
                ? 'project'
                : 'projects'}{' '}
              available
            </h2>
          </div>

          {hasFilters && (
            <p className="text-xs text-muted-foreground">
              Showing filtered results
            </p>
          )}
        </div>

        {/* ================================================= */}
        {/* PROJECT LIST */}
        {/* ================================================= */}

        {filteredProjects.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredProjects.map(
              (project) => {
                const skills =
                  Array.isArray(
                    project.required_skills
                  )
                    ? project.required_skills
                    : [];

                return (
                  <Link
                    key={project.id}
                    href={`/expert/projects/${project.id}`}
                    className="group block"
                  >
                    <article className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all hover:border-primary/30 hover:bg-primary/[0.025] sm:p-6">
                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                            >
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Open
                            </Badge>

                            {project.project_type && (
                              <Badge
                                variant="outline"
                                className="border-border/60 bg-muted/20 text-[10px] font-normal"
                              >
                                {project.project_type}
                              </Badge>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                            {project.title}
                          </h3>
                        </div>

                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>

                      {/* DESCRIPTION */}

                      {project.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {project.description}
                        </p>
                      )}

                      {/* EXPERTISE */}

                      <div className="mt-5 rounded-xl border border-border/50 bg-background/20 p-4">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                          Required expertise
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {project.required_field ||
                            'General expertise'}
                        </p>
                      </div>

                      {/* SKILLS */}

                      {skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                            Required skills
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {skills
                              .slice(0, 6)
                              .map(
                                (
                                  skill
                                ) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className="border-primary/15 bg-primary/[0.035] text-[10px] font-normal"
                                  >
                                    {skill}
                                  </Badge>
                                )
                              )}

                            {skills.length >
                              6 && (
                              <Badge
                                variant="outline"
                                className="border-border/60 bg-muted/20 text-[10px] font-normal"
                              >
                                +
                                {skills.length -
                                  6}{' '}
                                more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* DETAILS */}

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-4 sm:grid-cols-4">
                        <ProjectMeta
                          icon={
                            <Users className="h-3.5 w-3.5" />
                          }
                          label="Experts"
                          value={
                            project.experts_needed !=
                            null
                              ? String(
                                  project.experts_needed
                                )
                              : '—'
                          }
                        />

                        <ProjectMeta
                          icon={
                            <Clock3 className="h-3.5 w-3.5" />
                          }
                          label="Hours"
                          value={
                            project.estimated_hours !=
                            null
                              ? `${project.estimated_hours}`
                              : '—'
                          }
                        />

                        <ProjectMeta
                          icon={
                            <DollarSign className="h-3.5 w-3.5" />
                          }
                          label="Budget"
                          value={formatBudget(
                            project.budget
                          )}
                        />

                        <ProjectMeta
                          icon={
                            <CalendarDays className="h-3.5 w-3.5" />
                          }
                          label="Deadline"
                          value={formatDate(
                            project.deadline
                          )}
                        />
                      </div>

                      {/* CTA */}

                      <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                        <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/40">
                          View project
                        </span>

                        <span className="inline-flex items-center text-xs font-medium text-primary">
                          Review opportunity
                          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              }
            )}
          </div>
        ) : (
          /* ================================================= */
          /* EMPTY STATE */
          /* ================================================= */

          <section className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/20">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-5 text-lg font-semibold">
              {projects.length === 0
                ? 'No projects available yet'
                : 'No matching projects'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {projects.length === 0
                ? 'New opportunities will appear here when companies publish projects that need expert human input.'
                : 'Try adjusting your search or filters to find other available opportunities.'}
            </p>

            {hasFilters && (
              <Button
                className="mt-5"
                variant="outline"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-2 border-t border-border/50 pt-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 uppercase tracking-[0.16em]">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            IUVAI expert marketplace
          </div>

          <div className="flex items-center gap-2 uppercase tracking-[0.16em] text-muted-foreground/40">
            <Briefcase className="h-3 w-3" />
            Human intelligence infrastructure
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/*
============================================================
PROJECT META
============================================================
*/

function ProjectMeta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground/50">
        {icon}

        <p className="text-[8px] uppercase tracking-[0.14em]">
          {label}
        </p>
      </div>

      <p className="mt-1 truncate text-xs font-medium">
        {value}
      </p>
    </div>
  );
}

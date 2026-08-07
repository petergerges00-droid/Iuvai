import { useEffect, useState, type FormEvent } from 'react';
import {
  Loader2,
  ShieldCheck,
  Users,
  Briefcase,
  Plus,
  X,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getExperts,
  getCompanyProjects,
  createProject,
  type ExpertWithProfile,
  type Project,
} from '@/lib/supabase';

/*
============================================================
IUVAI ADMIN COMPANY
============================================================
This is the same ID used for the admin account.
============================================================
*/
const ADMIN_COMPANY_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';

export default function AdminDashboard() {
  /*
  ============================================================
  STATE
  ============================================================
  */

  const [experts, setExperts] = useState<ExpertWithProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoadingExperts, setIsLoadingExperts] =
    useState(true);

  const [isLoadingProjects, setIsLoadingProjects] =
    useState(true);

  const [expertsError, setExpertsError] =
    useState<string | null>(null);

  const [projectsError, setProjectsError] =
    useState<string | null>(null);

  const [showProjectForm, setShowProjectForm] =
    useState(false);

  const [isCreatingProject, setIsCreatingProject] =
    useState(false);

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    primary_field: '',
    specialization: '',
    required_skills: '',
    project_type: '',
    budget: '',
    duration: '',
    status: 'open' as const,
  });

  /*
  ============================================================
  LOAD EXPERTS
  ============================================================
  */

  useEffect(() => {
    let isMounted = true;

    async function loadExperts() {
      try {
        setIsLoadingExperts(true);
        setExpertsError(null);

        const data = await getExperts();

        if (!isMounted) return;

        setExperts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          'ADMIN DASHBOARD - EXPERT LOAD ERROR:',
          err
        );

        if (!isMounted) return;

        setExperts([]);
        setExpertsError(
          err instanceof Error
            ? err.message
            : 'Unable to load experts.'
        );
      } finally {
        if (isMounted) {
          setIsLoadingExperts(false);
        }
      }
    }

    loadExperts();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  ============================================================
  LOAD PROJECTS
  ============================================================
  */

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        setIsLoadingProjects(true);
        setProjectsError(null);

        const data =
          await getCompanyProjects(ADMIN_COMPANY_ID);

        if (!isMounted) return;

        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          'ADMIN DASHBOARD - PROJECT LOAD ERROR:',
          err
        );

        if (!isMounted) return;

        setProjects([]);
        setProjectsError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects.'
        );
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  ============================================================
  CREATE PROJECT
  ============================================================
  */

  async function handleCreateProject(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!projectForm.title.trim()) {
      return;
    }

    try {
      setIsCreatingProject(true);

      const newProject = await createProject({
        company_id: ADMIN_COMPANY_ID,

        title: projectForm.title.trim(),

        description:
          projectForm.description.trim() || null,

        primary_field:
          projectForm.primary_field.trim() || null,

        specialization:
          projectForm.specialization.trim() || null,

        required_skills:
          projectForm.required_skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),

        project_type:
          projectForm.project_type.trim() || null,

        budget:
          projectForm.budget.trim() || null,

        duration:
          projectForm.duration.trim() || null,

        status: projectForm.status,
      });

      setProjects((current) => [
        newProject,
        ...current,
      ]);

      setProjectForm({
        title: '',
        description: '',
        primary_field: '',
        specialization: '',
        required_skills: '',
        project_type: '',
        budget: '',
        duration: '',
        status: 'open',
      });

      setShowProjectForm(false);
    } catch (err) {
      console.error(
        'ADMIN DASHBOARD - CREATE PROJECT ERROR:',
        err
      );

      setProjectsError(
        err instanceof Error
          ? err.message
          : 'Failed to create project.'
      );
    } finally {
      setIsCreatingProject(false);
    }
  }

  /*
  ============================================================
  DERIVED STATS
  ============================================================
  */

  const activeProjects = projects.filter(
    (project) =>
      project.status === 'open' ||
      project.status === 'in_progress'
  );

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Admin">
      <div className="space-y-8">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />

              <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                IUVAI / Internal
              </p>
            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              IUVAI Operations
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage the expert network and projects.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowProjectForm(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add project
          </button>
        </div>

        {/* ====================================================
            STATS
        ==================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          {/* Experts */}

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Total experts
              </p>

              <Users className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {isLoadingExperts ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              ) : (
                experts.length
              )}
            </p>
          </div>

          {/* Active projects */}

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>

              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {isLoadingProjects ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              ) : (
                activeProjects.length
              )}
            </p>
          </div>

          {/* Total projects */}

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <p className="text-xs text-muted-foreground">
              Total projects
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {isLoadingProjects ? (
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              ) : (
                projects.length
              )}
            </p>
          </div>
        </div>

        {/* ====================================================
            CREATE PROJECT FORM
        ==================================================== */}

        {showProjectForm && (
          <div className="rounded-2xl border border-border/60 bg-card/70">

            <div className="flex items-center justify-between border-b border-border/60 p-5">
              <div>
                <h3 className="font-medium">
                  Add project
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add an external AI project that IUVAI will recruit experts for.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowProjectForm(false)
                }
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateProject}
              className="space-y-5 p-5"
            >

              {/* Title */}

              <div>
                <label className="text-sm font-medium">
                  Project title
                </label>

                <input
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      title: event.target.value,
                    })
                  }
                  placeholder="Medical AI evaluation project"
                  className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Description */}

              <div>
                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe the project and the work experts will perform..."
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Fields */}

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="text-sm font-medium">
                    Primary field
                  </label>

                  <input
                    value={projectForm.primary_field}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        primary_field:
                          event.target.value,
                      })
                    }
                    placeholder="Medicine"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Specialization
                  </label>

                  <input
                    value={projectForm.specialization}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        specialization:
                          event.target.value,
                      })
                    }
                    placeholder="Neurosurgery"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Project type
                  </label>

                  <input
                    value={projectForm.project_type}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        project_type:
                          event.target.value,
                      })
                    }
                    placeholder="AI evaluation / annotation"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Budget
                  </label>

                  <input
                    value={projectForm.budget}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        budget:
                          event.target.value,
                      })
                    }
                    placeholder="$25/hour"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Duration
                  </label>

                  <input
                    value={projectForm.duration}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        duration:
                          event.target.value,
                      })
                    }
                    placeholder="4 weeks"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Required skills
                  </label>

                  <input
                    value={projectForm.required_skills}
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        required_skills:
                          event.target.value,
                      })
                    }
                    placeholder="Clinical knowledge, AI evaluation, medical writing"
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  />

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Separate skills with commas.
                  </p>
                </div>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowProjectForm(false)
                  }
                  className="h-10 rounded-lg border border-border/70 px-4 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {isCreatingProject ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create project'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====================================================
            PROJECTS
        ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">
            <h3 className="font-medium">
              Projects
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Projects you are recruiting experts for.
            </p>
          </div>

          {isLoadingProjects ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : projectsError ? (
            <div className="p-6">
              <p className="text-sm font-medium text-destructive">
                Unable to load projects
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {projectsError}
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-10 text-center">

              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No projects yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add your first external project to begin recruiting experts.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">

              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >

                  <div>

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

                    {project.required_skills &&
                      project.required_skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.required_skills.map(
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
                      )}
                  </div>

                  <div className="shrink-0">
                    <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                      {project.status}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================
            EXPERTS
        ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Registered experts
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Experts currently registered with IUVAI.
            </p>

          </div>

          {isLoadingExperts ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : expertsError ? (
            <div className="p-6">

              <p className="text-sm font-medium text-destructive">
                Unable to load experts
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {expertsError}
              </p>

            </div>
          ) : experts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No experts registered yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">

              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >

                  <div>

                    <p className="font-medium">
                      {expert.profile?.full_name ||
                        'Unnamed expert'}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {expert.primary_field ||
                        'Field not specified'}

                      {expert.specialization
                        ? ` · ${expert.specialization}`
                        : ''}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {expert.profile?.country ||
                        'Country not specified'}
                    </p>

                  </div>

                  <div className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                    Pending review
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

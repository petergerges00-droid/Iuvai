import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Loader2,
  ShieldCheck,
  Users,
  Briefcase,
  ClipboardCheck,
  Plus,
  X,
  ArrowRight,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getExperts,
  ExpertWithProfile,
  getCompanyProjects,
  createProject,
  Project,
} from '@/lib/supabase';

const ADMIN_COMPANY_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';

export default function AdminDashboard() {
  const [experts, setExperts] =
    useState<ExpertWithProfile[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [isLoadingExperts, setIsLoadingExperts] =
    useState(true);

  const [isLoadingProjects, setIsLoadingProjects] =
    useState(true);

  const [error, setError] =
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
    async function loadExperts() {
      try {
        setIsLoadingExperts(true);
        setError(null);

        const data = await getExperts();

        setExperts(data);
      } catch (err) {
        console.error(
          'ADMIN EXPERT LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load experts.'
        );
      } finally {
        setIsLoadingExperts(false);
      }
    }

    loadExperts();
  }, []);

  /*
  ============================================================
  LOAD PROJECTS
  ============================================================
  */

  useEffect(() => {
    async function loadProjects() {
      try {
        setIsLoadingProjects(true);

        const data =
          await getCompanyProjects(
            ADMIN_COMPANY_ID
          );

        setProjects(data);
      } catch (err) {
        console.error(
          'ADMIN PROJECT LOAD ERROR:',
          err
        );
      } finally {
        setIsLoadingProjects(false);
      }
    }

    loadProjects();
  }, []);

  /*
  ============================================================
  CREATE PROJECT
  ============================================================
  */

  async function handleCreateProject(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!projectForm.title.trim()) {
      return;
    }

    try {
      setIsCreatingProject(true);
      setError(null);

      const newProject =
        await createProject({
          company_id: ADMIN_COMPANY_ID,

          title:
            projectForm.title.trim(),

          description:
            projectForm.description.trim() ||
            null,

          primary_field:
            projectForm.primary_field.trim() ||
            null,

          specialization:
            projectForm.specialization.trim() ||
            null,

          required_skills:
            projectForm.required_skills
              .split(',')
              .map((skill) =>
                skill.trim()
              )
              .filter(Boolean),

          project_type:
            projectForm.project_type.trim() ||
            null,

          budget:
            projectForm.budget.trim() ||
            null,

          duration:
            projectForm.duration.trim() ||
            null,

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
        'CREATE PROJECT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create project.'
      );
    } finally {
      setIsCreatingProject(false);
    }
  }

  return (
    <AppLayout title="Admin">

      <div className="space-y-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

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
              Manage the expert network, projects, and evaluations.
            </p>

          </div>

          <div className="flex flex-wrap gap-2">

            <Link
              href="/admin/evaluations"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ClipboardCheck className="h-4 w-4" />
              Evaluations
            </Link>

            <button
              type="button"
              onClick={() =>
                setShowProjectForm(true)
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add project
            </button>

          </div>

        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          {/* TOTAL EXPERTS */}

          <Link
            href="/admin/experts"
            className="block rounded-2xl border border-border/60 bg-card/70 p-5 transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
          >

            <div className="flex items-center justify-between">

              <p className="text-xs text-muted-foreground">
                Total experts
              </p>

              <Users className="h-4 w-4 text-muted-foreground" />

            </div>

            <p className="mt-3 text-3xl font-semibold">
              {experts.length}
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs text-primary">
              View experts
              <ArrowRight className="h-3.5 w-3.5" />
            </div>

          </Link>

          {/* ACTIVE PROJECTS */}

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

            <div className="flex items-center justify-between">

              <p className="text-xs text-muted-foreground">
                Active projects
              </p>

              <Briefcase className="h-4 w-4 text-muted-foreground" />

            </div>

            <p className="mt-3 text-3xl font-semibold">
              {
                projects.filter(
                  (project) =>
                    project.status === 'open' ||
                    project.status === 'in_progress'
                ).length
              }
            </p>

          </div>

          {/* TOTAL PROJECTS */}

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

            <p className="text-xs text-muted-foreground">
              Total projects
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {projects.length}
            </p>

          </div>

        </div>

        {/* =====================================================
            EVALUATIONS
        ====================================================== */}

        <Link
          href="/admin/evaluations"
          className="block rounded-2xl border border-border/60 bg-card/70 transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
        >

          <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>

              <div>

                <h3 className="font-medium">
                  Expert evaluations
                </h3>

                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Create and manage domain-expert assessments used to verify expert knowledge before they participate in IUVAI projects.
                </p>

                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  Manage evaluations
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>

              </div>

            </div>

            <div className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
              Evaluation system
            </div>

          </div>

        </Link>

        {/* =====================================================
            CREATE PROJECT FORM
        ====================================================== */}

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

              {/* PROJECT TITLE */}

              <div>

                <label className="text-sm font-medium">
                  Project title
                </label>

                <input
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="Medical AI evaluation project"
                  className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  required
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={
                    projectForm.description
                  }
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

              {/* PROJECT FIELDS */}

              <div className="grid gap-5 md:grid-cols-2">

                {/* PRIMARY FIELD */}

                <div>

                  <label className="text-sm font-medium">
                    Primary field
                  </label>

                  <input
                    value={
                      projectForm.primary_field
                    }
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

                {/* SPECIALIZATION */}

                <div>

                  <label className="text-sm font-medium">
                    Specialization
                  </label>

                  <input
                    value={
                      projectForm.specialization
                    }
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

                {/* PROJECT TYPE */}

                <div>

                  <label className="text-sm font-medium">
                    Project type
                  </label>

                  <input
                    value={
                      projectForm.project_type
                    }
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

                {/* BUDGET */}

                <div>

                  <label className="text-sm font-medium">
                    Budget
                  </label>

                  <input
                    value={
                      projectForm.budget
                    }
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

                {/* DURATION */}

                <div>

                  <label className="text-sm font-medium">
                    Duration
                  </label>

                  <input
                    value={
                      projectForm.duration
                    }
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

                {/* REQUIRED SKILLS */}

                <div>

                  <label className="text-sm font-medium">
                    Required skills
                  </label>

                  <input
                    value={
                      projectForm.required_skills
                    }
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

              {/* FORM ACTIONS */}

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
                  disabled={
                    isCreatingProject
                  }
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

        {/* =====================================================
            PROJECTS
        ====================================================== */}

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

                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="block transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
                >

                  <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

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

                    <div className="shrink-0">

                      <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                        {project.status}
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

        {/* =====================================================
            EXPERTS
        ====================================================== */}

        <Link
          href="/admin/experts"
          className="block rounded-2xl border border-border/60 bg-card/70 transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
        >

          {/* EXPERT HEADER */}

          <div className="flex items-center justify-between border-b border-border/60 p-5">

            <div>

              <div className="flex items-center gap-2">

                <Users className="h-4 w-4 text-primary" />

                <h3 className="font-medium">
                  Registered experts
                </h3>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Experts currently registered with IUVAI.
              </p>

            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

          </div>

          {/* EXPERT CONTENT */}

          {isLoadingExperts ? (

            <div className="flex items-center justify-center p-12">

              <Loader2 className="h-6 w-6 animate-spin text-primary" />

            </div>

          ) : error ? (

            <div className="p-6 text-sm text-destructive">
              {error}
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

        </Link>

      </div>

    </AppLayout>
  );
}

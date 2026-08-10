import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';

import {
  ExpertWithProfile,
  Project,
  ProjectExpert,
  ProjectExpertStatus,
  getAdminProject,
  getExperts,
  getProjectAssignments,
  updateProject,
  updateProjectStatus,
  deleteProject,
  assignExpertToProject,
  removeExpertFromProject,
  updateProjectExpertStatus,
} from '@/lib/supabase';

export default function AdminProjectDetail() {
  const [, params] = useRoute(
    '/admin/projects/:projectId'
  );

  const [, setLocation] = useLocation();

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [experts, setExperts] =
    useState<ExpertWithProfile[]>([]);

  const [assignments, setAssignments] =
    useState<ProjectExpert[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingExperts, setIsLoadingExperts] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isAssigning, setIsAssigning] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [expertSearch, setExpertSearch] =
    useState('');

  const [showAssignPanel, setShowAssignPanel] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [editingProject, setEditingProject] =
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
    status: 'open' as Project['status'],
  });

  /*
  ============================================================
  LOAD PROJECT
  ============================================================
  */

  useEffect(() => {
    if (!projectId) {
      return;
    }

    async function loadProject() {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getAdminProject(projectId);

        if (!data) {
          setError('Project not found.');
          return;
        }

        setProject(data);

        setProjectForm({
          title: data.title || '',
          description:
            data.description || '',
          primary_field:
            data.primary_field || '',
          specialization:
            data.specialization || '',
          required_skills:
            data.required_skills?.join(', ') ||
            '',
          project_type:
            data.project_type || '',
          budget:
            data.budget || '',
          duration:
            data.duration || '',
          status: data.status,
        });
      } catch (err) {
        console.error(
          'ADMIN PROJECT LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load project.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  /*
  ============================================================
  LOAD EXPERTS
  ============================================================
  */

  useEffect(() => {
    async function loadExperts() {
      try {
        setIsLoadingExperts(true);

        const data =
          await getExperts();

        setExperts(data);
      } catch (err) {
        console.error(
          'ADMIN EXPERT LOAD ERROR:',
          err
        );
      } finally {
        setIsLoadingExperts(false);
      }
    }

    loadExperts();
  }, []);

  /*
  ============================================================
  LOAD ASSIGNMENTS
  ============================================================
  */

  async function loadAssignments() {
    if (!projectId) {
      return;
    }

    try {
      const data =
        await getProjectAssignments(
          projectId
        );

      setAssignments(data);
    } catch (err) {
      console.error(
        'PROJECT ASSIGNMENTS LOAD ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load project assignments.'
      );
    }
  }

  useEffect(() => {
    loadAssignments();
  }, [projectId]);

  /*
  ============================================================
  UPDATE PROJECT
  ============================================================
  */

  async function handleSaveProject(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!projectId) {
      return;
    }

    if (!projectForm.title.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updated =
        await updateProject(
          projectId,
          {
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

            status:
              projectForm.status,

            updated_at:
              new Date().toISOString(),
          }
        );

      setProject(updated);
      setEditingProject(false);
    } catch (err) {
      console.error(
        'UPDATE PROJECT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update project.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
  ============================================================
  CHANGE STATUS
  ============================================================
  */

  async function handleStatusChange(
    status: Project['status']
  ) {
    if (!projectId || !project) {
      return;
    }

    try {
      setError(null);

      const updated =
        await updateProjectStatus(
          projectId,
          status
        );

      setProject(updated);

      setProjectForm((current) => ({
        ...current,
        status,
      }));
    } catch (err) {
      console.error(
        'UPDATE PROJECT STATUS ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update project status.'
      );
    }
  }

  /*
  ============================================================
  DELETE PROJECT
  ============================================================
  */

  async function handleDeleteProject() {
    if (!projectId) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await deleteProject(projectId);

      setLocation('/admin/projects');
    } catch (err) {
      console.error(
        'DELETE PROJECT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete project.'
      );

      setIsDeleting(false);
    }
  }

  /*
  ============================================================
  ASSIGN EXPERT
  ============================================================
  */

  async function handleAssignExpert(
    expertId: string
  ) {
    if (!projectId) {
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);

      await assignExpertToProject(
        projectId,
        expertId
      );

      await loadAssignments();
    } catch (err) {
      console.error(
        'ASSIGN EXPERT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to assign expert.'
      );
    } finally {
      setIsAssigning(false);
    }
  }

  /*
  ============================================================
  REMOVE EXPERT
  ============================================================
  */

  async function handleRemoveExpert(
    expertId: string
  ) {
    if (!projectId) {
      return;
    }

    try {
      setError(null);

      await removeExpertFromProject(
        projectId,
        expertId
      );

      await loadAssignments();
    } catch (err) {
      console.error(
        'REMOVE EXPERT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove expert.'
      );
    }
  }

  /*
  ============================================================
  UPDATE ASSIGNMENT STATUS
  ============================================================
  */

  async function handleAssignmentStatus(
    assignmentId: string,
    status: ProjectExpertStatus
  ) {
    try {
      setError(null);

      const updated =
        await updateProjectExpertStatus(
          assignmentId,
          status
        );

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id ===
          assignmentId
            ? updated
            : assignment
        )
      );
    } catch (err) {
      console.error(
        'UPDATE ASSIGNMENT STATUS ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update assignment.'
      );
    }
  }

  /*
  ============================================================
  HELPERS
  ============================================================
  */

  function getExpertById(
    expertId: string
  ) {
    return experts.find(
      (expert) =>
        expert.id === expertId
    );
  }

  const assignedExpertIds =
    new Set(
      assignments.map(
        (assignment) =>
          assignment.expert_id
      )
    );

  const filteredExperts =
    experts.filter((expert) => {
      if (
        assignedExpertIds.has(
          expert.id
        )
      ) {
        return false;
      }

      const search =
        expertSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return true;
      }

      const searchable = [
        expert.profile?.full_name,
        expert.profile?.country,
        expert.primary_field,
        expert.specialization,
        expert.previous_ai_experience,
        ...(expert.skills || []),
        ...(expert.languages || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(
        search
      );
    });

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (isLoading) {
    return (
      <AppLayout title="Project">

        <div className="flex min-h-[60vh] items-center justify-center">

          <Loader2 className="h-7 w-7 animate-spin text-primary" />

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  ERROR / NOT FOUND
  ============================================================
  */

  if (!project) {
    return (
      <AppLayout title="Project">

        <div className="space-y-6">

          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-10 text-center">

            <Briefcase className="mx-auto h-9 w-9 text-muted-foreground/50" />

            <h2 className="mt-4 font-medium">
              Project not found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {error ||
                'This project could not be found.'}
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  MAIN
  ============================================================
  */

  return (
    <AppLayout title="Project">

      <div className="space-y-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div>

            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>

            <div className="mt-5 flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-semibold tracking-tight">
                    {project.title}
                  </h2>

                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium capitalize text-primary">
                    {project.status.replace(
                      '_',
                      ' '
                    )}
                  </span>

                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  Manage this project and its expert assignments.
                </p>

              </div>

            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                setEditingProject(
                  !editingProject
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              {editingProject ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel editing
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit project
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowAssignPanel(
                  !showAssignPanel
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {showAssignPanel ? (
                <>
                  <X className="h-4 w-4" />
                  Close
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Assign expert
                </>
              )}
            </button>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                setError(null)
              }
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

          </div>

        )}

        {/* =====================================================
            PROJECT INFORMATION
        ====================================================== */}

        {editingProject ? (

          <div className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">

              <h3 className="font-medium">
                Edit project
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Update the project requirements and recruitment information.
              </p>

            </div>

            <form
              onSubmit={handleSaveProject}
              className="space-y-5 p-5"
            >

              <div>

                <label className="text-sm font-medium">
                  Project title
                </label>

                <input
                  value={
                    projectForm.title
                  }
                  onChange={(event) =>
                    setProjectForm({
                      ...projectForm,
                      title:
                        event.target.value,
                    })
                  }
                  required
                  className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                />

              </div>

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
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />

              </div>

              <div className="grid gap-5 md:grid-cols-2">

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

                <div>

                  <label className="text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={
                      projectForm.status
                    }
                    onChange={(event) =>
                      setProjectForm({
                        ...projectForm,
                        status:
                          event.target.value as Project['status'],
                      })
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-border/70 bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="open">
                      Open
                    </option>

                    <option value="in_progress">
                      In progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>

                </div>

              </div>

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

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setEditingProject(
                      false
                    )
                  }
                  className="h-10 rounded-lg border border-border/70 px-4 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >

                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}

                </button>

              </div>

            </form>

          </div>

        ) : (

          <div className="grid gap-5 lg:grid-cols-3">

            {/* PROJECT DETAILS */}

            <div className="rounded-2xl border border-border/60 bg-card/70 lg:col-span-2">

              <div className="border-b border-border/60 p-5">

                <h3 className="font-medium">
                  Project details
                </h3>

              </div>

              <div className="space-y-6 p-5">

                {project.description && (

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Description
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {project.description}
                    </p>

                  </div>

                )}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Primary field
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.primary_field ||
                        'Not specified'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Specialization
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.specialization ||
                        'Not specified'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Project type
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.project_type ||
                        'Not specified'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Budget
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.budget ||
                        'Not specified'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Duration
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.duration ||
                        'Not specified'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-muted-foreground">
                      Experts needed
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {project.experts_needed ??
                        'Not specified'}
                    </p>

                  </div>

                </div>

                <div>

                  <p className="text-xs text-muted-foreground">
                    Required skills
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {project.required_skills &&
                    project.required_skills.length >
                      0 ? (
                      project.required_skills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground"
                          >
                            {skill}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No specific skills listed.
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="rounded-2xl border border-border/60 bg-card/70">

              <div className="border-b border-border/60 p-5">

                <h3 className="font-medium">
                  Project status
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Update the recruitment lifecycle.
                </p>

              </div>

              <div className="space-y-2 p-5">

                {(
                  [
                    'draft',
                    'open',
                    'in_progress',
                    'completed',
                    'cancelled',
                  ] as Project['status'][]
                ).map((status) => (

                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      handleStatusChange(
                        status
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      project.status ===
                      status
                        ? 'border-primary/30 bg-primary/5 text-primary'
                        : 'border-border/60 hover:bg-muted/40'
                    }`}
                  >

                    <span className="capitalize">
                      {status.replace(
                        '_',
                        ' '
                      )}
                    </span>

                    {project.status ===
                      status && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                  </button>

                ))}

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            ASSIGN EXPERT PANEL
        ====================================================== */}

        {showAssignPanel && (

          <div className="rounded-2xl border border-primary/20 bg-card/70">

            <div className="flex items-center justify-between border-b border-border/60 p-5">

              <div>

                <h3 className="font-medium">
                  Assign experts
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Select experts from the IUVAI network for this project.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAssignPanel(
                    false
                  )
                }
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="p-5">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={
                    expertSearch
                  }
                  onChange={(event) =>
                    setExpertSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search experts by name, field, specialization, skills..."
                  className="h-11 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                />

              </div>

              {isLoadingExperts ? (

                <div className="flex items-center justify-center p-10">

                  <Loader2 className="h-6 w-6 animate-spin text-primary" />

                </div>

              ) : filteredExperts.length ===
                0 ? (

                <div className="p-10 text-center">

                  <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />

                  <p className="mt-3 text-sm font-medium">
                    No available experts
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    All matching experts may already be assigned to this project.
                  </p>

                </div>

              ) : (

                <div className="mt-5 divide-y divide-border/60 rounded-xl border border-border/60">

                  {filteredExperts.map(
                    (expert) => (

                      <div
                        key={expert.id}
                        className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                      >

                        <div>

                          <p className="font-medium">
                            {expert.profile
                              ?.full_name ||
                              'Unnamed expert'}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {expert.primary_field ||
                              'Field not specified'}

                            {expert.specialization
                              ? ` · ${expert.specialization}`
                              : ''}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">

                            {expert.skills
                              ?.slice(
                                0,
                                5
                              )
                              .map(
                                (
                                  skill
                                ) => (
                                  <span
                                    key={
                                      skill
                                    }
                                    className="rounded-full border border-border/60 px-2 py-1 text-[10px] text-muted-foreground"
                                  >
                                    {
                                      skill
                                    }
                                  </span>
                                )
                              )}

                          </div>

                        </div>

                        <button
                          type="button"
                          disabled={
                            isAssigning
                          }
                          onClick={() =>
                            handleAssignExpert(
                              expert.id
                            )
                          }
                          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
                        >

                          {isAssigning ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}

                          Assign

                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        )}

        {/* =====================================================
            ASSIGNED EXPERTS
        ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <Users className="h-4 w-4 text-primary" />

                <h3 className="font-medium">
                  Assigned experts
                </h3>

                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {assignments.length}
                </span>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Experts currently assigned to this project.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowAssignPanel(
                  true
                )
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border/70 px-3 text-xs font-medium hover:bg-muted"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add expert
            </button>

          </div>

          {assignments.length ===
          0 ? (

            <div className="p-10 text-center">

              <Users className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                No experts assigned
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Add qualified experts to begin staffing this project.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAssignPanel(
                    true
                  )
                }
                className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign first expert
              </button>

            </div>

          ) : (

            <div className="divide-y divide-border/60">

              {assignments.map(
                (assignment) => {

                  const expert =
                    getExpertById(
                      assignment.expert_id
                    );

                  return (
                    <div
                      key={
                        assignment.id
                      }
                      className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div className="min-w-0">

                        <Link
                          href={`/admin/experts/${assignment.expert_id}`}
                          className="font-medium hover:text-primary"
                        >
                          {expert
                            ?.profile
                            ?.full_name ||
                            'Unnamed expert'}
                        </Link>

                        <p className="mt-1 text-sm text-muted-foreground">

                          {expert
                            ?.primary_field ||
                            'Field not specified'}

                          {expert
                            ?.specialization
                            ? ` · ${expert.specialization}`
                            : ''}

                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">

                          {expert
                            ?.profile
                            ?.country ||
                            'Country not specified'}

                        </p>

                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <select
                          value={
                            assignment.status
                          }
                          onChange={(
                            event
                          ) =>
                            handleAssignmentStatus(
                              assignment.id,
                              event.target
                                .value as ProjectExpertStatus
                            )
                          }
                          className="h-9 rounded-lg border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
                        >

                          <option value="assigned">
                            Assigned
                          </option>

                          <option value="accepted">
                            Accepted
                          </option>

                          <option value="declined">
                            Declined
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExpert(
                              assignment.expert_id
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-destructive/20 px-3 text-xs font-medium text-destructive hover:bg-destructive/5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* =====================================================
            PROJECT METADATA
        ====================================================== */}

        <div className="grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

            <div className="flex items-center gap-2">

              <Clock3 className="h-4 w-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                Created
              </p>

            </div>

            <p className="mt-2 text-sm font-medium">
              {new Date(
                project.created_at
              ).toLocaleString()}
            </p>

          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

            <div className="flex items-center gap-2">

              <Clock3 className="h-4 w-4 text-muted-foreground" />

              <p className="text-xs text-muted-foreground">
                Last updated
              </p>

            </div>

            <p className="mt-2 text-sm font-medium">
              {new Date(
                project.updated_at
              ).toLocaleString()}
            </p>

          </div>

        </div>

        {/* =====================================================
            DANGER ZONE
        ====================================================== */}

        <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.02]">

          <div className="border-b border-destructive/10 p-5">

            <h3 className="font-medium text-destructive">
              Danger zone
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Permanently remove this project from IUVAI.
            </p>

          </div>

          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-medium">
                Delete project
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                This action cannot be undone.
              </p>

            </div>

            {!showDeleteConfirm ? (

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    true
                  )
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-destructive/20 px-4 text-xs font-medium text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete project
              </button>

            ) : (

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteConfirm(
                      false
                    )
                  }
                  className="h-9 rounded-lg border border-border/70 px-4 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteProject
                  }
                  disabled={
                    isDeleting
                  }
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-xs font-medium text-destructive-foreground disabled:opacity-50"
                >

                  {isDeleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}

                  {isDeleting
                    ? 'Deleting...'
                    : 'Confirm delete'}

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </AppLayout>
  );
}

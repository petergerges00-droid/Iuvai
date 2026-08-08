import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  status: string;
}

/*
============================================================
FORM TYPE
============================================================
*/

interface ProjectForm {
  title: string;
  description: string;
  projectType: string;
  requiredField: string;
  expertsNeeded: string;
  estimatedHours: string;
  deadline: string;
  budget: string;
}

/*
============================================================
OPTIONS
============================================================
*/

const PROJECT_TYPES = [
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

/*
============================================================
PAGE
============================================================
*/

export default function EditProject() {
  const { user, profile } = useAuth();
  const [, params] = useRoute(
    '/company-dashboard/projects/:projectId/edit'
  );
  const [, setLocation] = useLocation();

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [form, setForm] = useState<ProjectForm>({
    title: '',
    description: '',
    projectType: '',
    requiredField: '',
    expertsNeeded: '1',
    estimatedHours: '',
    deadline: '',
    budget: '',
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

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
          .select('*')
          .eq('id', projectId)
          .eq('company_id', user.id)
          .maybeSingle();

        if (projectError) {
          console.error(
            'EDIT PROJECT LOAD ERROR:',
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
              'This project could not be found or you do not have access to it.'
            );
          }

          return;
        }

        const loadedProject =
          data as Project;

        if (!mounted) return;

        setProject(loadedProject);

        /*
        ========================================================
        POPULATE FORM
        ========================================================
        */

        setForm({
          title:
            loadedProject.title || '',

          description:
            loadedProject.description || '',

          projectType:
            loadedProject.project_type || '',

          requiredField:
            loadedProject.required_field || '',

          expertsNeeded:
            loadedProject.experts_needed !=
            null
              ? String(
                  loadedProject.experts_needed
                )
              : '1',

          estimatedHours:
            loadedProject.estimated_hours !=
            null
              ? String(
                  loadedProject.estimated_hours
                )
              : '',

          deadline:
            loadedProject.deadline
              ? loadedProject.deadline.slice(
                  0,
                  10
                )
              : '',

          budget:
            loadedProject.budget != null
              ? String(
                  loadedProject.budget
                )
              : '',
        });

        /*
        ========================================================
        POPULATE SKILLS
        ========================================================
        */

        setSkills(
          Array.isArray(
            loadedProject.required_skills
          )
            ? loadedProject.required_skills
            : []
        );
      } catch (err) {
        console.error(
          'EDIT PROJECT LOAD EXCEPTION:',
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
  FORM HELPERS
  ============================================================
  */

  function updateField(
    field: keyof ProjectForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
  }

  function addSkill() {
    const skill = skillInput.trim();

    if (!skill) return;

    if (
      skills.some(
        (existing) =>
          existing.toLowerCase() ===
          skill.toLowerCase()
      )
    ) {
      setSkillInput('');
      return;
    }

    setSkills((previous) => [
      ...previous,
      skill,
    ]);

    setSkillInput('');
    setError(null);
  }

  function removeSkill(skill: string) {
    setSkills((previous) =>
      previous.filter(
        (item) => item !== skill
      )
    );
  }

  function handleSkillKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ','
    ) {
      event.preventDefault();
      addSkill();
    }
  }

  /*
  ============================================================
  VALIDATION
  ============================================================
  */

  function validateForm() {
    if (!user?.id) {
      return 'You must be signed in to edit a project.';
    }

    if (!projectId) {
      return 'Project ID is missing.';
    }

    if (!form.title.trim()) {
      return 'Please enter a project title.';
    }

    if (form.title.trim().length < 5) {
      return 'Project title must be at least 5 characters.';
    }

    if (!form.description.trim()) {
      return 'Please describe the project.';
    }

    if (form.description.trim().length < 20) {
      return 'Please provide a more detailed project description.';
    }

    if (!form.projectType) {
      return 'Please select a project type.';
    }

    if (!form.requiredField) {
      return 'Please select the required expertise field.';
    }

    const expertsNeeded =
      Number(form.expertsNeeded);

    if (
      !Number.isFinite(expertsNeeded) ||
      expertsNeeded < 1 ||
      !Number.isInteger(expertsNeeded)
    ) {
      return 'Experts needed must be a whole number of at least 1.';
    }

    if (form.estimatedHours) {
      const hours =
        Number(form.estimatedHours);

      if (
        !Number.isFinite(hours) ||
        hours <= 0
      ) {
        return 'Estimated hours must be greater than 0.';
      }
    }

    if (form.budget) {
      const budget =
        Number(form.budget);

      if (
        !Number.isFinite(budget) ||
        budget < 0
      ) {
        return 'Budget cannot be negative.';
      }
    }

    if (form.deadline) {
      const deadline =
        new Date(form.deadline);

      if (
        Number.isNaN(
          deadline.getTime()
        )
      ) {
        return 'Please enter a valid deadline.';
      }

      if (
        deadline.getTime() <
        Date.now()
      ) {
        return 'Deadline must be in the future.';
      }
    }

    if (skills.length === 0) {
      return 'Please add at least one required skill.';
    }

    return null;
  }

  /*
  ============================================================
  UPDATE PROJECT
  ============================================================
  */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user?.id || !projectId) {
      setError(
        'You must be signed in and have a valid project to continue.'
      );

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      /*
      ========================================================
      UPDATE PROJECT
      ========================================================

      IMPORTANT:
      We deliberately DO NOT update `status`.

      The existing project status is preserved.
      */

      const { data, error: updateError } =
        await supabase
          .from('projects')
          .update({
            title: form.title.trim(),

            description:
              form.description.trim(),

            project_type:
              form.projectType,

            required_field:
              form.requiredField,

            required_skills:
              skills,

            experts_needed:
              Number(form.expertsNeeded),

            estimated_hours:
              form.estimatedHours
                ? Number(
                    form.estimatedHours
                  )
                : null,

            deadline:
              form.deadline
                ? form.deadline
                : null,

            budget:
              form.budget
                ? Number(form.budget)
                : null,
          })
          .eq('id', projectId)
          .eq('company_id', user.id)
          .select('id')
          .single();

      if (updateError) {
        console.error(
          'UPDATE PROJECT ERROR:',
          updateError
        );

        setError(
          updateError.message ||
            'Unable to update the project.'
        );

        return;
      }

      console.log(
        'PROJECT UPDATED:',
        data
      );

      setSuccess(true);

      /*
      ========================================================
      REDIRECT
      ========================================================
      */

      setTimeout(() => {
        setLocation(
          `/company-dashboard/projects/${projectId}`
        );
      }, 900);
    } catch (err) {
      console.error(
        'UPDATE PROJECT EXCEPTION:',
        err
      );

      setError(
        'Something went wrong while updating the project.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
  ============================================================
  AUTH / PROFILE INITIALIZATION
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
            Loading project
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing the project editor...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR / PROJECT NOT FOUND
  ============================================================
  */

  if (error && !project) {
    return (
      <AppLayout title="Edit Project">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold">
              Project unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-6"
              variant="outline"
              onClick={() =>
                setLocation(
                  '/company-dashboard'
                )
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  SUCCESS STATE
  ============================================================
  */

  if (success) {
    return (
      <AppLayout title="Project updated">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-500">
              Project updated
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Changes saved
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your project has been updated
              successfully. Redirecting you back to
              the project workspace...
            </p>

            <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  NORMAL PAGE
  ============================================================
  */

  return (
    <AppLayout title="Edit Project">
      <div className="mx-auto max-w-5xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <Link
            href={`/company-dashboard/projects/${projectId}`}
            className="mb-6 inline-flex items-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to project
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary"
                >
                  <Briefcase className="mr-2 h-3 w-3" />
                  EDIT PROJECT
                </Badge>

                {project?.status && (
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-muted/20 text-muted-foreground"
                  >
                    {project.status.replace(
                      /_/g,
                      ' '
                    )}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Edit project
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Update your project's requirements,
                workload, timeline, and compensation.
                Existing project status will be
                preserved.
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />

              <div>
                <p className="text-xs font-medium text-destructive">
                  Unable to save changes
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ================================================= */}
          {/* PROJECT DETAILS */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Step 01
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    Project details
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* TITLE */}

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Project title
                </label>

                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      'title',
                      event.target.value
                    )
                  }
                  placeholder="e.g. Medical AI response evaluation"
                  className="h-12 border-border/60 bg-background/40"
                  maxLength={150}
                />

                <p className="mt-2 text-[11px] text-muted-foreground/50">
                  Give experts a clear understanding of
                  what the project is about.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Project description
                </label>

                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      'description',
                      event.target.value
                    )
                  }
                  placeholder="Describe the AI system, the work required from experts, the type of data they will review, and what a successful submission should look like..."
                  className="min-h-[160px] resize-y border-border/60 bg-background/40"
                  maxLength={5000}
                />

                <div className="mt-2 flex justify-between">
                  <p className="text-[11px] text-muted-foreground/50">
                    Be as specific as possible.
                  </p>

                  <span className="text-[10px] text-muted-foreground/40">
                    {form.description.length}/5000
                  </span>
                </div>
              </div>

              {/* TYPE + FIELD */}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="projectType"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Project type
                  </label>

                  <select
                    id="projectType"
                    value={form.projectType}
                    onChange={(event) =>
                      updateField(
                        'projectType',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">
                      Select project type
                    </option>

                    {PROJECT_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="requiredField"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Required expertise
                  </label>

                  <select
                    id="requiredField"
                    value={form.requiredField}
                    onChange={(event) =>
                      updateField(
                        'requiredField',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-border/60 bg-background/40 px-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="">
                      Select expertise field
                    </option>

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
                </div>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* SKILLS */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Step 02
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    Required skills
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="skills"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Skills and specializations
              </label>

              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(event) =>
                    setSkillInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleSkillKeyDown
                  }
                  placeholder="e.g. Neurosurgery"
                  className="h-12 border-border/60 bg-background/40"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 shrink-0"
                  onClick={addSkill}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground/50">
                Press Enter or click Add after each
                skill.
              </p>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="gap-1.5 border-primary/20 bg-primary/5 px-3 py-1.5 text-primary"
                    >
                      {skill}

                      <button
                        type="button"
                        onClick={() =>
                          removeSkill(skill)
                        }
                        className="ml-1 rounded-full transition-colors hover:text-destructive"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ================================================= */}
          {/* WORKLOAD */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Step 03
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    Workload & timeline
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {/* EXPERTS */}

              <div>
                <label
                  htmlFor="expertsNeeded"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Experts needed
                </label>

                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

                  <Input
                    id="expertsNeeded"
                    type="number"
                    min="1"
                    step="1"
                    value={
                      form.expertsNeeded
                    }
                    onChange={(event) =>
                      updateField(
                        'expertsNeeded',
                        event.target.value
                      )
                    }
                    className="h-12 border-border/60 bg-background/40 pl-10"
                  />
                </div>
              </div>

              {/* HOURS */}

              <div>
                <label
                  htmlFor="estimatedHours"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Estimated hours
                </label>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={
                      form.estimatedHours
                    }
                    onChange={(event) =>
                      updateField(
                        'estimatedHours',
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    className="h-12 border-border/60 bg-background/40 pl-10"
                  />
                </div>
              </div>

              {/* DEADLINE */}

              <div>
                <label
                  htmlFor="deadline"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Deadline
                </label>

                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) =>
                      updateField(
                        'deadline',
                        event.target.value
                      )
                    }
                    className="h-12 border-border/60 bg-background/40 pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* BUDGET */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Step 04
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    Compensation
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="max-w-md">
                <label
                  htmlFor="budget"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Project budget
                </label>

                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={(event) =>
                      updateField(
                        'budget',
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    className="h-12 border-border/60 bg-background/40 pl-10"
                  />
                </div>

                <p className="mt-2 text-[11px] leading-5 text-muted-foreground/50">
                  Enter the total budget allocated to
                  this project.
                </p>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* REVIEW */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Review changes
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Review the updated project
                    information before saving.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
                    Project type
                  </p>

                  <p className="mt-1 truncate text-xs font-medium">
                    {form.projectType ||
                      'Not selected'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
                    Expertise
                  </p>

                  <p className="mt-1 truncate text-xs font-medium">
                    {form.requiredField ||
                      'Not selected'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
                    Experts
                  </p>

                  <p className="mt-1 text-xs font-medium">
                    {form.expertsNeeded ||
                      '0'}
                  </p>
                </div>

                <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
                    Skills
                  </p>

                  <p className="mt-1 text-xs font-medium">
                    {skills.length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-border/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              asChild
              disabled={isSubmitting}
            >
              <Link
                href={`/company-dashboard/projects/${projectId}`}
              >
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[190px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes
                </>
              ) : (
                <>
                  Save Changes
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-border/40 pt-5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/30">
          <Sparkles className="h-3 w-3" />
          IUVAI human intelligence infrastructure
        </div>
      </div>
    </AppLayout>
  );
}

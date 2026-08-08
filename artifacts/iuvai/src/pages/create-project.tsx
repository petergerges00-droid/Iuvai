import { useState } from 'react';
import { Link, useLocation } from 'wouter';
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
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

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

const initialForm: ProjectForm = {
  title: '',
  description: '',
  projectType: '',
  requiredField: '',
  expertsNeeded: '1',
  estimatedHours: '',
  deadline: '',
  budget: '',
};

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

export default function CreateProject() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();

  const [form, setForm] =
    useState<ProjectForm>(initialForm);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [success, setSuccess] = useState(false);

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
    if (event.key === 'Enter' || event.key === ',') {
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
      return 'You must be signed in to create a project.';
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
  CREATE PROJECT
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

    if (!user?.id) {
      setError(
        'You must be signed in to create a project.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      /*
      ========================================================
      PROJECT INSERT
      ========================================================

      company_id is the authenticated user's ID,
      matching the company profile architecture used
      throughout the current company dashboard.
      */

      const { data, error: insertError } =
        await supabase
          .from('projects')
          .insert({
            company_id: user.id,

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

            status: 'open',
          })
          .select('id')
          .single();

      if (insertError) {
        console.error(
          'CREATE PROJECT ERROR:',
          insertError
        );

        setError(
          insertError.message ||
            'Unable to create the project.'
        );

        return;
      }

      console.log(
        'PROJECT CREATED:',
        data
      );

      setSuccess(true);

      /*
      Give the success state a moment to display,
      then return to the company dashboard.
      */
      setTimeout(() => {
        if (data?.id) {
          setLocation(
            `/company-dashboard/projects/${data.id}`
          );
        } else {
          setLocation(
            '/company-dashboard'
          );
        }
      }, 900);
    } catch (error) {
      console.error(
        'CREATE PROJECT EXCEPTION:',
        error
      );

      setError(
        'Something went wrong while creating the project.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
  ============================================================
  LOADING / AUTH STATE
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
  SUCCESS STATE
  ============================================================
  */

  if (success) {
    return (
      <AppLayout title="Project created">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-500">
              Project created
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Your project is live
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your project has been created successfully.
              Redirecting you to the project workspace...
            </p>

            <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppLayout title="Create Project">
      <div className="mx-auto max-w-5xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <Link
            href="/company-dashboard"
            className="mb-6 inline-flex items-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to workspace
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary"
                >
                  <Briefcase className="mr-2 h-3 w-3" />
                  NEW PROJECT
                </Badge>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Create a project
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Define the work you need human experts
                to perform. IUVAI will use these
                requirements to help match your project
                with relevant expertise.
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
                  Unable to create project
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
          {/* BASIC INFORMATION */}
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
                    Be as specific as possible. Better
                    descriptions lead to better expert
                    matching.
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
                Press Enter or click Add after each skill.
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
                  Enter the total budget you are allocating
                  to this project. You can leave this blank
                  while the IUVAI marketplace is being
                  developed.
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
                    Ready to create your project?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your project will be created and made
                    available for the expert matching
                    workflow.
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
              <Link href="/company-dashboard">
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
                  Creating project
                </>
              ) : (
                <>
                  Create Project
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

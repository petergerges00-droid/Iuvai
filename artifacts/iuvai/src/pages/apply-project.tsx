import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  AlertCircle,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  created_at: string;
}

/*
============================================================
APPLICATION FORM TYPE
============================================================
*/

interface ApplicationForm {
  coverLetter: string;
  experience: string;
  availability: string;
  proposedRate: string;
}

const initialForm: ApplicationForm = {
  coverLetter: '',
  experience: '',
  availability: '',
  proposedRate: '',
};

/*
============================================================
PAGE
============================================================
*/

export default function ApplyProject() {
  const { user, profile } = useAuth();

  /*
  Route standardized with ExpertProject:
  
  /expert/projects/:projectId
  /expert/projects/:projectId/apply
  */

  const [, params] = useRoute(
    '/expert/projects/:projectId/apply'
  );

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [form, setForm] =
    useState<ApplicationForm>(initialForm);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [hasApplied, setHasApplied] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

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
        /*
        ========================================================
        LOAD PROJECT
        ========================================================
        */

        const {
          data: projectData,
          error: projectError,
        } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();

        if (projectError) {
          console.error(
            'APPLY PROJECT LOAD ERROR:',
            projectError
          );

          if (mounted) {
            setError(
              'We could not load this project.'
            );
          }

          return;
        }

        if (!projectData) {
          if (mounted) {
            setError(
              'This project could not be found.'
            );
          }

          return;
        }

        /*
        ========================================================
        PROJECT MUST BE OPEN
        ========================================================
        */

        if (projectData.status !== 'open') {
          if (mounted) {
            setError(
              'This project is not currently accepting applications.'
            );
          }

          return;
        }

        /*
        ========================================================
        CHECK EXISTING APPLICATION
        ========================================================
        */

        const {
          data: existingApplication,
          error: applicationCheckError,
        } = await supabase
          .from('project_applications')
          .select('id')
          .eq('project_id', projectId)
          .eq('expert_id', user.id)
          .maybeSingle();

        if (
          applicationCheckError &&
          applicationCheckError.code !== 'PGRST116'
        ) {
          console.error(
            'APPLICATION CHECK ERROR:',
            applicationCheckError
          );
        }

        if (mounted) {
          setProject(
            projectData as Project
          );

          setHasApplied(
            !!existingApplication
          );
        }
      } catch (err) {
        console.error(
          'APPLY PROJECT LOAD EXCEPTION:',
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
    field: keyof ApplicationForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
  }

  /*
  ============================================================
  VALIDATION
  ============================================================
  */

  function validateForm() {
    if (!user?.id) {
      return 'You must be signed in to apply.';
    }

    if (!projectId) {
      return 'Project could not be identified.';
    }

    if (!form.coverLetter.trim()) {
      return 'Please write a short cover letter.';
    }

    if (
      form.coverLetter.trim().length < 50
    ) {
      return 'Your cover letter should contain at least 50 characters.';
    }

    if (!form.experience.trim()) {
      return 'Please describe your relevant experience.';
    }

    if (
      form.experience.trim().length < 30
    ) {
      return 'Please provide more detail about your relevant experience.';
    }

    if (!form.availability.trim()) {
      return 'Please describe your availability.';
    }

    if (form.proposedRate) {
      const rate =
        Number(form.proposedRate);

      if (
        !Number.isFinite(rate) ||
        rate < 0
      ) {
        return 'Proposed rate cannot be negative.';
      }
    }

    return null;
  }

  /*
  ============================================================
  SUBMIT APPLICATION
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
        'You must be signed in to apply.'
      );

      return;
    }

    if (hasApplied) {
      setError(
        'You have already applied to this project.'
      );

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      /*
      ========================================================
      INSERT APPLICATION
      ========================================================
      */

      const {
        data,
        error: insertError,
      } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,

          expert_id: user.id,

          cover_letter:
            form.coverLetter.trim(),

          experience:
            form.experience.trim(),

          availability:
            form.availability.trim(),

          proposed_rate:
            form.proposedRate
              ? Number(form.proposedRate)
              : null,

          status: 'pending',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(
          'APPLICATION INSERT ERROR:',
          insertError
        );

        /*
        ======================================================
        HANDLE DUPLICATE APPLICATION
        ======================================================
        */

        if (
          insertError.code === '23505' ||
          insertError.message
            ?.toLowerCase()
            .includes('duplicate')
        ) {
          setHasApplied(true);

          setError(
            'You have already applied to this project.'
          );

          return;
        }

        setError(
          insertError.message ||
            'Unable to submit your application.'
        );

        return;
      }

      console.log(
        'APPLICATION CREATED:',
        data
      );

      /*
      ========================================================
      SUCCESS
      ========================================================
      */

      setSuccess(true);

      /*
      Give the success state a moment before returning
      to the project.
      */

      setTimeout(() => {
        window.location.href =
          `/expert/projects/${projectId}`;
      }, 1000);
    } catch (err) {
      console.error(
        'APPLICATION SUBMISSION EXCEPTION:',
        err
      );

      setError(
        'Something went wrong while submitting your application.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
  ============================================================
  AUTH INITIALIZATION
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
            Loading application
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your application...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR / PROJECT UNAVAILABLE
  ============================================================
  */

  if (error && !project) {
    return (
      <AppLayout title="Apply">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold">
              Application unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-6"
              variant="outline"
              asChild
            >
              <Link
                href={
                  projectId
                    ? `/expert/projects/${projectId}`
                    : '/expert/projects'
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to project
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  SUCCESS
  ============================================================
  */

  if (success) {
    return (
      <AppLayout title="Application submitted">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-500">
              Application submitted
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              You're in the running
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your application has been submitted
              successfully. The company can now review
              your application.
            </p>

            <Loader2 className="mx-auto mt-6 h-5 w-5 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  ALREADY APPLIED
  ============================================================
  */

  if (hasApplied) {
    return (
      <AppLayout title="Application">
        <div className="mx-auto max-w-3xl">
          <Link
            href={
              projectId
                ? `/expert/projects/${projectId}`
                : '/expert/projects'
            }
            className="mb-6 inline-flex items-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to project
          </Link>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Application already submitted
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              You have already submitted an application
              for this project. You don't need to apply
              again.
            </p>

            <Button
              className="mt-6"
              asChild
            >
              <Link
                href={
                  projectId
                    ? `/expert/projects/${projectId}`
                    : '/expert/projects'
                }
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to project
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  NORMALIZED PROJECT VALUES
  ============================================================
  */

  const skills =
    Array.isArray(project?.required_skills)
      ? project.required_skills
      : [];

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppLayout title="Apply to Project">
      <div className="mx-auto max-w-5xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">
          <Link
            href={
              projectId
                ? `/expert/projects/${projectId}`
                : '/expert/projects'
            }
            className="mb-6 inline-flex items-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to project
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">

                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary"
                >
                  <Send className="mr-2 h-3 w-3" />
                  APPLICATION
                </Badge>

                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                >
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  OPEN
                </Badge>

              </div>

              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Apply to project
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {project?.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Submit your application and explain why
                your expertise is a strong match for this
                project.
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
        {/* PROJECT SUMMARY */}
        {/* ================================================= */}

        {project && (
          <section className="mb-6 rounded-2xl border border-border/60 bg-card/40">

            <div className="border-b border-border/60 p-5 sm:p-6">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Project overview
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    What the company needs
                  </h2>
                </div>

              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">

              <SummaryItem
                icon={
                  <Briefcase className="h-4 w-4" />
                }
                label="Project type"
                value={
                  project.project_type ||
                  'Not specified'
                }
              />

              <SummaryItem
                icon={
                  <Users className="h-4 w-4" />
                }
                label="Experts needed"
                value={
                  project.experts_needed !=
                  null
                    ? String(
                        project.experts_needed
                      )
                    : 'Not specified'
                }
              />

              <SummaryItem
                icon={
                  <Clock3 className="h-4 w-4" />
                }
                label="Estimated hours"
                value={
                  project.estimated_hours !=
                  null
                    ? `${project.estimated_hours} hrs`
                    : 'Not specified'
                }
              />

              <SummaryItem
                icon={
                  <DollarSign className="h-4 w-4" />
                }
                label="Budget"
                value={
                  project.budget != null &&
                  project.budget !== ''
                    ? String(
                        project.budget
                      )
                    : 'Not specified'
                }
              />

            </div>

            <div className="border-t border-border/60 p-5 sm:p-6">

              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                Required expertise
              </p>

              <p className="mt-1 text-sm font-semibold">
                {project.required_field ||
                  'Not specified'}
              </p>

              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map(
                    (skill, index) => (
                      <Badge
                        key={`${skill}-${index}`}
                        variant="outline"
                        className="border-primary/15 bg-primary/[0.04] text-xs font-normal"
                      >
                        {skill}
                      </Badge>
                    )
                  )}
                </div>
              )}

            </div>

            {project.description && (
              <div className="border-t border-border/60 p-5 sm:p-6">

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Description
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>

              </div>
            )}

          </section>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3">

            <div className="flex items-start gap-3">

              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />

              <div>

                <p className="text-xs font-medium text-destructive">
                  Unable to submit application
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* APPLICATION FORM */}
        {/* ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* COVER LETTER */}

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
                    Why are you a good fit?
                  </h2>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6">

              <label
                htmlFor="coverLetter"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Cover letter
              </label>

              <Textarea
                id="coverLetter"
                value={form.coverLetter}
                onChange={(event) =>
                  updateField(
                    'coverLetter',
                    event.target.value
                  )
                }
                placeholder="Explain why you are interested in this project and why your expertise makes you a strong candidate..."
                className="min-h-[180px] resize-y border-border/60 bg-background/40"
                maxLength={5000}
              />

              <div className="mt-2 flex justify-between">

                <p className="text-[11px] text-muted-foreground/50">
                  Keep it relevant to the project
                  requirements.
                </p>

                <span className="text-[10px] text-muted-foreground/40">
                  {form.coverLetter.length}/5000
                </span>

              </div>

            </div>

          </section>

          {/* EXPERIENCE */}

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
                    Relevant experience
                  </h2>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6">

              <label
                htmlFor="experience"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Experience and expertise
              </label>

              <Textarea
                id="experience"
                value={form.experience}
                onChange={(event) =>
                  updateField(
                    'experience',
                    event.target.value
                  )
                }
                placeholder="Describe your relevant professional experience, education, certifications, research, or previous work that relates to this project..."
                className="min-h-[180px] resize-y border-border/60 bg-background/40"
                maxLength={5000}
              />

              <p className="mt-2 text-[11px] leading-5 text-muted-foreground/50">
                Focus on experience that demonstrates your
                ability to perform this specific type of
                work.
              </p>

            </div>

          </section>

          {/* AVAILABILITY */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/40">

            <div className="border-b border-border/60 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Clock3 className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                    Step 03
                  </p>

                  <h2 className="mt-0.5 text-sm font-semibold">
                    Availability
                  </h2>
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6">

              <label
                htmlFor="availability"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                Your availability
              </label>

              <Textarea
                id="availability"
                value={form.availability}
                onChange={(event) =>
                  updateField(
                    'availability',
                    event.target.value
                  )
                }
                placeholder="e.g. I can contribute 8–10 hours per week and can begin immediately."
                className="min-h-[120px] resize-y border-border/60 bg-background/40"
                maxLength={2000}
              />

              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">

                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                <span>
                  Let the company know when you can start
                  and approximately how much time you can
                  dedicate.
                </span>

              </div>

            </div>

          </section>

          {/* RATE */}

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
                  htmlFor="proposedRate"
                  className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Proposed hourly rate
                </label>

                <div className="relative">

                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />

                  <Input
                    id="proposedRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.proposedRate
                    }
                    onChange={(event) =>
                      updateField(
                        'proposedRate',
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                    className="h-12 border-border/60 bg-background/40 pl-10"
                  />

                </div>

                <p className="mt-2 text-[11px] leading-5 text-muted-foreground/50">
                  Optional for now. This can be negotiated
                  with the company before work begins.
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
                    Ready to apply?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your application will be sent to the
                    company for review.
                  </p>

                </div>

              </div>

              <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground">

                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                <span>
                  Your application information will only be
                  shared with the company responsible for
                  this project.
                </span>

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
                href={
                  projectId
                    ? `/expert/projects/${projectId}`
                    : '/expert/projects'
                }
              >
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  Submit Application
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

/*
============================================================
SUMMARY ITEM
============================================================
*/

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/30 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/40">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-medium">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

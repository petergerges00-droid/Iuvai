import { useEffect, useMemo, useState } from 'react';
import { Link, useRoute } from 'wouter';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

/*
============================================================
TYPES
============================================================
*/

interface Project {
  id: string;
  title: string;
  description: string | null;
  project_type: string | null;
  required_field: string | null;
  status: string;
}

interface ProjectTask {
  id: string;
  project_id: string;
  task_number: number;
  input_data: {
    context?: string;
    question?: string;
    ai_response?: string;
    [key: string]: unknown;
  };
  status: string;
  assigned_expert_id: string | null;
  started_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

interface TaskSubmission {
  id: string;
  task_id: string;
  expert_id: string;
  answer_data: {
    answer?: string;
    [key: string]: unknown;
  };
  status: string;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

/*
============================================================
HELPERS
============================================================
*/

function formatDate(date: string | null) {
  if (!date) {
    return 'Not started';
  }

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

/*
============================================================
PAGE
============================================================
*/

export default function ExpertProjectWorkspace() {
  const { user, profile } = useAuth();

  const [, params] = useRoute(
    '/expert/projects/:projectId/workspace'
  );

  const projectId = params?.projectId;

  /*
  ============================================================
  STATE
  ============================================================
  */

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] =
    useState<ProjectTask[]>([]);

  const [submissions, setSubmissions] =
    useState<TaskSubmission[]>([]);

  const [currentTaskIndex, setCurrentTaskIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isStarting, setIsStarting] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /*
  ============================================================
  CURRENT TASK
  ============================================================
  */

  const currentTask =
    tasks[currentTaskIndex] ?? null;

  /*
  ============================================================
  CURRENT SUBMISSION
  ============================================================
  */

  const currentSubmission =
    useMemo(() => {
      if (!currentTask) {
        return null;
      }

      return (
        submissions.find(
          (submission) =>
            submission.task_id === currentTask.id
        ) ?? null
      );
    }, [currentTask, submissions]);

  /*
  ============================================================
  TASK PROGRESS
  ============================================================
  */

  const completedCount =
    tasks.filter((task) =>
      ['submitted', 'reviewed', 'completed'].includes(
        task.status
      )
    ).length;

  /*
  ============================================================
  LOAD WORKSPACE
  ============================================================
  */

  useEffect(() => {
    if (!user?.id || !projectId) {
      return;
    }

    let mounted = true;

    async function loadWorkspace() {
      setIsLoading(true);
      setError(null);

      try {
        /*
        --------------------------------------------------------
        LOAD PROJECT
        --------------------------------------------------------
        */

        const {
          data: projectData,
          error: projectError,
        } = await supabase
          .from('projects')
          .select(
            `
              id,
              title,
              description,
              project_type,
              required_field,
              status
            `
          )
          .eq('id', projectId)
          .maybeSingle();

        if (projectError) {
          console.error(
            'WORKSPACE PROJECT ERROR:',
            projectError
          );

          throw new Error(
            'We could not load the project.'
          );
        }

        if (!projectData) {
          throw new Error(
            'This project could not be found.'
          );
        }

        /*
        --------------------------------------------------------
        LOAD ASSIGNED TASKS
        --------------------------------------------------------

        RLS ensures the expert only receives tasks assigned
        to their own auth.uid().
        --------------------------------------------------------
        */

        const {
          data: taskData,
          error: taskError,
        } = await supabase
          .from('project_tasks')
          .select(
            `
              id,
              project_id,
              task_number,
              input_data,
              status,
              assigned_expert_id,
              started_at,
              submitted_at,
              reviewed_at
            `
          )
          .eq('project_id', projectId)
          .eq('assigned_expert_id', user.id)
          .order('task_number', {
            ascending: true,
          });

        if (taskError) {
          console.error(
            'WORKSPACE TASK ERROR:',
            taskError
          );

          throw new Error(
            'We could not load your assigned tasks.'
          );
        }

        /*
        --------------------------------------------------------
        LOAD OWN SUBMISSIONS
        --------------------------------------------------------
        */

        const taskIds =
          (taskData ?? []).map(
            (task) => task.id
          );

        let submissionData: TaskSubmission[] = [];

        if (taskIds.length > 0) {
          const {
            data,
            error: submissionError,
          } = await supabase
            .from('task_submissions')
            .select(
              `
                id,
                task_id,
                expert_id,
                answer_data,
                status,
                reviewer_id,
                reviewer_notes,
                created_at,
                updated_at,
                reviewed_at
              `
            )
            .eq('expert_id', user.id)
            .in('task_id', taskIds);

          if (submissionError) {
            console.error(
              'WORKSPACE SUBMISSION ERROR:',
              submissionError
            );

            throw new Error(
              'We could not load your previous submissions.'
            );
          }

          submissionData =
            (data ?? []) as TaskSubmission[];
        }

        if (!mounted) {
          return;
        }

        setProject(projectData as Project);
        setTasks(
          (taskData ?? []) as ProjectTask[]
        );
        setSubmissions(submissionData);

        /*
        --------------------------------------------------------
        FIND FIRST UNFINISHED TASK
        --------------------------------------------------------
        */

        const firstUnfinishedIndex =
          (taskData ?? []).findIndex(
            (task) =>
              !['submitted', 'reviewed', 'completed'].includes(
                task.status
              )
          );

        if (firstUnfinishedIndex >= 0) {
          setCurrentTaskIndex(
            firstUnfinishedIndex
          );
        } else if (
          (taskData ?? []).length > 0
        ) {
          setCurrentTaskIndex(0);
        }
      } catch (err) {
        console.error(
          'WORKSPACE LOAD EXCEPTION:',
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Something went wrong while loading the workspace.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, [user?.id, projectId]);

  /*
  ============================================================
  LOAD EXISTING ANSWER WHEN TASK CHANGES
  ============================================================
  */

  useEffect(() => {
    if (!currentTask) {
      setAnswer('');
      return;
    }

    if (currentSubmission?.answer_data?.answer) {
      setAnswer(
        String(
          currentSubmission.answer_data.answer
        )
      );
    } else {
      setAnswer('');
    }

    setSuccessMessage(null);
  }, [
    currentTask?.id,
    currentSubmission?.id,
  ]);

  /*
  ============================================================
  START TASK
  ============================================================
  */

  async function handleStartTask() {
    if (!currentTask || !user?.id) {
      return;
    }

    if (
      currentTask.status !== 'assigned' &&
      currentTask.status !== 'available'
    ) {
      return;
    }

    setIsStarting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const {
        data,
        error: updateError,
      } = await supabase
        .from('project_tasks')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', currentTask.id)
        .eq('assigned_expert_id', user.id)
        .select(
          `
            id,
            project_id,
            task_number,
            input_data,
            status,
            assigned_expert_id,
            started_at,
            submitted_at,
            reviewed_at
          `
        )
        .single();

      if (updateError) {
        console.error(
          'START TASK ERROR:',
          updateError
        );

        throw new Error(
          'We could not start this task.'
        );
      }

      setTasks((previous) =>
        previous.map((task) =>
          task.id === currentTask.id
            ? (data as ProjectTask)
            : task
        )
      );

      setSuccessMessage(
        'Task started. You can now submit your answer.'
      );
    } catch (err) {
      console.error(
        'START TASK EXCEPTION:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while starting the task.'
      );
    } finally {
      setIsStarting(false);
    }
  }

  /*
  ============================================================
  SUBMIT TASK
  ============================================================
  */

  async function handleSubmitTask() {
    if (!currentTask || !user?.id) {
      return;
    }

    const trimmedAnswer =
      answer.trim();

    if (!trimmedAnswer) {
      setError(
        'Please provide an answer before submitting the task.'
      );
      return;
    }

    if (
      currentTask.status !== 'in_progress' &&
      currentTask.status !== 'assigned'
    ) {
      setError(
        'This task is no longer available for submission.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      /*
      --------------------------------------------------------
      CREATE SUBMISSION
      --------------------------------------------------------
      */

      const {
        data: submissionData,
        error: submissionError,
      } = await supabase
        .from('task_submissions')
        .insert({
          task_id: currentTask.id,
          expert_id: user.id,
          answer_data: {
            answer: trimmedAnswer,
          },
          status: 'submitted',
        })
        .select(
          `
            id,
            task_id,
            expert_id,
            answer_data,
            status,
            reviewer_id,
            reviewer_notes,
            created_at,
            updated_at,
            reviewed_at
          `
        )
        .single();

      if (submissionError) {
        console.error(
          'SUBMIT TASK ERROR:',
          submissionError
        );

        throw new Error(
          submissionError.message ||
            'We could not submit your answer.'
        );
      }

      /*
      --------------------------------------------------------
      UPDATE TASK
      --------------------------------------------------------
      */

      const {
        data: updatedTask,
        error: taskUpdateError,
      } = await supabase
        .from('project_tasks')
        .update({
          status: 'submitted',
          submitted_at:
            new Date().toISOString(),
        })
        .eq('id', currentTask.id)
        .eq('assigned_expert_id', user.id)
        .select(
          `
            id,
            project_id,
            task_number,
            input_data,
            status,
            assigned_expert_id,
            started_at,
            submitted_at,
            reviewed_at
          `
        )
        .single();

      if (taskUpdateError) {
        console.error(
          'TASK STATUS UPDATE ERROR:',
          taskUpdateError
        );

        /*
        The submission was created successfully.
        We report the status update issue separately.
        */
        throw new Error(
          'Your answer was saved, but we could not update the task status. Please contact IUVAI support.'
        );
      }

      /*
      --------------------------------------------------------
      UPDATE LOCAL STATE
      --------------------------------------------------------
      */

      setSubmissions((previous) => [
        ...previous.filter(
          (submission) =>
            submission.task_id !== currentTask.id
        ),
        submissionData as TaskSubmission,
      ]);

      setTasks((previous) =>
        previous.map((task) =>
          task.id === currentTask.id
            ? (updatedTask as ProjectTask)
            : task
        )
      );

      setSuccessMessage(
        'Task submitted successfully.'
      );

      /*
      --------------------------------------------------------
      AUTOMATICALLY MOVE TO NEXT TASK
      --------------------------------------------------------
      */

      const nextIndex =
        tasks.findIndex(
          (task, index) =>
            index > currentTaskIndex &&
            !['submitted', 'reviewed', 'completed'].includes(
              task.status
            )
        );

      if (nextIndex >= 0) {
        setTimeout(() => {
          setCurrentTaskIndex(nextIndex);
        }, 700);
      }
    } catch (err) {
      console.error(
        'SUBMIT TASK EXCEPTION:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting your answer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
  ============================================================
  AUTH / PROFILE
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
          <Loader2 className="mx-auto mb-4 h-7 w-7 animate-spin text-primary" />

          <h1 className="text-lg font-semibold">
            Loading workspace
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your assigned tasks...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error && !project) {
    return (
      <AppLayout title="Project Workspace">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold">
              Workspace unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-6"
              variant="outline"
              asChild
            >
              <Link href="/expert/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  NO TASKS
  ============================================================
  */

  if (
    project &&
    tasks.length === 0
  ) {
    return (
      <AppLayout title="Project Workspace">
        <div className="space-y-6">
          <Link
            href="/expert/projects"
            className="inline-flex items-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Projects
          </Link>

          <section className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <h1 className="text-xl font-semibold">
              No tasks assigned yet
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              You have access to this project, but there are
              currently no tasks assigned to you.
            </p>

            <Button
              className="mt-6"
              variant="outline"
              asChild
            >
              <Link href="/expert/projects">
                Back to projects
              </Link>
            </Button>
          </section>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  ALL TASKS COMPLETED
  ============================================================
  */

  if (
    project &&
    tasks.length > 0 &&
    completedCount === tasks.length
  ) {
    return (
      <AppLayout title="Project Workspace">
        <div className="space-y-6">
          <Link
            href="/expert/projects"
            className="inline-flex items-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Projects
          </Link>

          <section className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>

            <p className="text-[9px] uppercase tracking-[0.22em] text-emerald-500/70">
              Project work complete
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              All tasks submitted
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              You have submitted all of the tasks assigned to
              you for this project. Your work can now be
              reviewed by the IUVAI team.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
              >
                {tasks.length} tasks submitted
              </Badge>

              <Badge
                variant="outline"
                className="border-border/60"
              >
                Under review
              </Badge>
            </div>
          </section>
        </div>
      </AppLayout>
    );
  }

  /*
  ============================================================
  CURRENT TASK DATA
  ============================================================
  */

  const context =
    typeof currentTask?.input_data?.context ===
    'string'
      ? currentTask.input_data.context
      : '';

  const question =
    typeof currentTask?.input_data?.question ===
    'string'
      ? currentTask.input_data.question
      : '';

  const aiResponse =
    typeof currentTask?.input_data?.ai_response ===
    'string'
      ? currentTask.input_data.ai_response
      : '';

  const isSubmitted =
    currentTask?.status === 'submitted' ||
    currentTask?.status === 'reviewed' ||
    currentTask?.status === 'completed';

  const isInProgress =
    currentTask?.status === 'in_progress';

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Project Workspace">
      <div className="space-y-6">

        {/* ==================================================
            TOP NAVIGATION
            ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/expert/projects"
            className="inline-flex items-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to projects
          </Link>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              IUVAI WORKSPACE
            </Badge>
          </div>

        </div>

        {/* ==================================================
            PROJECT HEADER
            ================================================== */}

        {project && (
          <section className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.035]">

            <div className="p-6 sm:p-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div className="min-w-0">

                  <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
                    Project workspace
                  </p>

                  <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {project.title}
                  </h1>

                  {project.description && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  )}

                </div>

                <div className="shrink-0">
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    {completedCount} / {tasks.length} submitted
                  </Badge>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ==================================================
            ERROR / SUCCESS
            ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

            <div className="min-w-0">
              <p className="font-medium text-destructive">
                Something went wrong
              </p>

              <p className="mt-1 text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

            <div className="min-w-0">
              <p className="font-medium text-emerald-500">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            TASK NAVIGATION
            ================================================== */}

        {currentTask && (
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">

            {/* ==================================================
                TASK SIDEBAR
                ================================================== */}

            <aside className="space-y-4">

              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                  Tasks
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Project tasks
                </h2>
              </div>

              <div className="space-y-2">

                {tasks.map(
                  (task, index) => {
                    const taskSubmitted =
                      [
                        'submitted',
                        'reviewed',
                        'completed',
                      ].includes(
                        task.status
                      );

                    const taskActive =
                      index ===
                      currentTaskIndex;

                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() =>
                          setCurrentTaskIndex(
                            index
                          )
                        }
                        className={[
                          'w-full rounded-xl border p-3 text-left transition-all',
                          taskActive
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-border/60 bg-card/30 hover:border-primary/20',
                        ].join(' ')}
                      >

                        <div className="flex items-center justify-between gap-3">

                          <span className="text-sm font-medium">
                            Task {task.task_number}
                          </span>

                          {taskSubmitted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : task.status ===
                            'in_progress' ? (
                            <Clock3 className="h-4 w-4 text-primary" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                          )}

                        </div>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50">
                          {taskSubmitted
                            ? 'Submitted'
                            : task.status ===
                              'in_progress'
                            ? 'In progress'
                            : 'Available'}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

              <div className="rounded-xl border border-border/60 bg-card/30 p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <p className="text-xs leading-5 text-muted-foreground">
                    Your answers are private and can only
                    be viewed by you and authorized IUVAI
                    reviewers.
                  </p>

                </div>

              </div>

            </aside>

            {/* ==================================================
                MAIN TASK
                ================================================== */}

            <main className="min-w-0 space-y-5">

              {/* TASK HEADER */}

              <section className="rounded-2xl border border-border/60 bg-card/40">

                <div className="flex flex-col gap-4 border-b border-border/60 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
                      Task {currentTask.task_number}
                    </p>

                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      Expert evaluation task
                    </h2>

                  </div>

                  <Badge
                    variant="outline"
                    className={
                      isSubmitted
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                        : isInProgress
                        ? 'border-primary/20 bg-primary/5 text-primary'
                        : 'border-border/60'
                    }
                  >
                    {isSubmitted
                      ? 'Submitted'
                      : isInProgress
                      ? 'In progress'
                      : 'Ready to start'}
                  </Badge>

                </div>

                {/* CONTEXT */}

                <div className="space-y-5 p-5 sm:p-6">

                  {context && (
                    <div>

                      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                        Context
                      </p>

                      <div className="mt-2 rounded-xl border border-border/60 bg-muted/10 p-4">
                        <p className="text-sm leading-6">
                          {context}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* QUESTION */}

                  {question && (
                    <div>

                      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                        Question
                      </p>

                      <div className="mt-2 rounded-xl border border-primary/15 bg-primary/[0.035] p-4">
                        <p className="text-base font-medium leading-7">
                          {question}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* AI RESPONSE */}

                  {aiResponse && (
                    <div>

                      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                        AI response
                      </p>

                      <div className="mt-2 rounded-xl border border-border/60 bg-muted/10 p-4">
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {aiResponse}
                        </p>
                      </div>

                    </div>
                  )}

                </div>

              </section>

              {/* ==================================================
                  ANSWER
                  ================================================== */}

              <section className="rounded-2xl border border-border/60 bg-card/40">

                <div className="border-b border-border/60 p-5 sm:p-6">

                  <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Expert response
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Your answer
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Provide your professional assessment based
                    on the information above.
                  </p>

                </div>

                <div className="p-5 sm:p-6">

                  <Textarea
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target.value
                      )
                    }
                    disabled={
                      isSubmitted ||
                      isSubmitting
                    }
                    placeholder="Write your expert assessment here..."
                    className="min-h-[220px] resize-y"
                  />

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="text-xs text-muted-foreground">

                      {answer.trim().length > 0
                        ? `${answer.trim().length} characters`
                        : 'No answer entered yet'}

                    </div>

                    {!isSubmitted &&
                      currentTask.status !==
                        'in_progress' && (
                        <Button
                          onClick={
                            handleStartTask
                          }
                          disabled={isStarting}
                          variant="outline"
                        >
                          {isStarting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Clock3 className="mr-2 h-4 w-4" />
                              Start Task
                            </>
                          )}
                        </Button>
                      )}

                    {!isSubmitted &&
                      (currentTask.status ===
                        'in_progress' ||
                        currentTask.status ===
                          'assigned') && (
                        <Button
                          onClick={
                            handleSubmitTask
                          }
                          disabled={
                            isSubmitting ||
                            !answer.trim()
                          }
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Answer
                            </>
                          )}
                        </Button>
                      )}

                    {isSubmitted && (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-emerald-500"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Answer submitted
                      </Badge>
                    )}

                  </div>

                </div>

              </section>

              {/* ==================================================
                  TASK NAVIGATION
                  ================================================== */}

              <div className="flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">

                <Button
                  variant="outline"
                  disabled={
                    currentTaskIndex === 0
                  }
                  onClick={() =>
                    setCurrentTaskIndex(
                      (index) =>
                        Math.max(
                          0,
                          index - 1
                        )
                    )
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous task
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Task {currentTaskIndex + 1} of{' '}
                  {tasks.length}
                </p>

                <Button
                  variant="outline"
                  disabled={
                    currentTaskIndex >=
                    tasks.length - 1
                  }
                  onClick={() =>
                    setCurrentTaskIndex(
                      (index) =>
                        Math.min(
                          tasks.length - 1,
                          index + 1
                        )
                    )
                  }
                >
                  Next task
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </div>

              {/* ==================================================
                  FOOTER
                  ================================================== */}

              <div className="flex items-center justify-between border-t border-border/50 pt-5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/40">

                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  IUVAI Studio
                </div>

                <div>
                  Last started:{' '}
                  {formatDate(
                    currentTask.started_at
                  )}
                </div>

              </div>

            </main>

          </div>
        )}

      </div>
    </AppLayout>
  );
}

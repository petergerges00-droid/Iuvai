import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

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
  answer_data: Record<string, unknown>;
  status: string;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export default function ExpertTaskWorkspace() {
  const { user, profile } = useAuth();

  const [, params] = useRoute('/expert/tasks/:taskId');

  const taskId = params?.taskId;

  const [task, setTask] = useState<ProjectTask | null>(null);

  const [submission, setSubmission] =
    useState<TaskSubmission | null>(null);

  const [answer, setAnswer] = useState('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    if (!user?.id || !taskId) {
      return;
    }

    let mounted = true;

    async function loadTask() {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: taskData,
          error: taskError,
        } = await supabase
          .from('project_tasks')
          .select(`
            id,
            project_id,
            task_number,
            input_data,
            status,
            assigned_expert_id,
            started_at,
            submitted_at,
            reviewed_at
          `)
          .eq('id', taskId)
          .eq('assigned_expert_id', user.id)
          .maybeSingle();

        if (taskError) {
          console.error(
            'TASK LOAD ERROR:',
            taskError
          );

          if (mounted) {
            setError(
              'We could not load this task.'
            );
          }

          return;
        }

        if (!taskData) {
          if (mounted) {
            setError(
              'This task is not assigned to your account.'
            );
          }

          return;
        }

        if (mounted) {
          setTask(taskData as ProjectTask);
        }

        const {
          data: submissionData,
          error: submissionError,
        } = await supabase
          .from('task_submissions')
          .select(`
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
          `)
          .eq('task_id', taskId)
          .eq('expert_id', user.id)
          .maybeSingle();

        if (submissionError) {
          console.error(
            'SUBMISSION LOAD ERROR:',
            submissionError
          );

          if (mounted) {
            setError(
              'We could not load your task submission.'
            );
          }

          return;
        }

        if (submissionData && mounted) {
          const existing =
            submissionData as TaskSubmission;

          setSubmission(existing);

          const existingAnswer =
            existing.answer_data?.expert_answer;

          if (
            typeof existingAnswer ===
            'string'
          ) {
            setAnswer(existingAnswer);
          }
        }

        /*
        --------------------------------------------------------
        START TASK
        --------------------------------------------------------
        */

        if (
          taskData.status === 'assigned'
        ) {
          const {
            error: startError,
          } = await supabase
            .from('project_tasks')
            .update({
              status: 'in_progress',
              started_at:
                new Date().toISOString(),
            })
            .eq('id', taskId)
            .eq(
              'assigned_expert_id',
              user.id
            );

          if (startError) {
            console.error(
              'TASK START ERROR:',
              startError
            );
          } else if (mounted) {
            setTask({
              ...(taskData as ProjectTask),
              status: 'in_progress',
              started_at:
                new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error(
          'TASK WORKSPACE ERROR:',
          err
        );

        if (mounted) {
          setError(
            'Something went wrong while loading the workspace.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadTask();

    return () => {
      mounted = false;
    };
  }, [user?.id, taskId]);

  async function handleSubmit() {
    if (!user?.id || !task || !taskId) {
      return;
    }

    if (!answer.trim()) {
      setError(
        'Please enter your answer before submitting.'
      );
      return;
    }

    if (submission) {
      setError(
        'This task has already been submitted.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data,
        error: submissionError,
      } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          expert_id: user.id,
          answer_data: {
            expert_answer:
              answer.trim(),
          },
          status: 'submitted',
        })
        .select()
        .single();

      if (submissionError) {
        console.error(
          'TASK SUBMISSION ERROR:',
          submissionError
        );

        setError(
          submissionError.message ||
            'We could not submit your task.'
        );

        return;
      }

      const {
        error: taskUpdateError,
      } = await supabase
        .from('project_tasks')
        .update({
          status: 'submitted',
          submitted_at:
            new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq(
          'assigned_expert_id',
          user.id
        );

      if (taskUpdateError) {
        console.error(
          'TASK STATUS UPDATE ERROR:',
          taskUpdateError
        );
      }

      setSubmission(
        data as TaskSubmission
      );

      setTask({
        ...task,
        status: 'submitted',
        submitted_at:
          new Date().toISOString(),
      });

      setSuccess(true);
    } catch (err) {
      console.error(
        'TASK SUBMISSION EXCEPTION:',
        err
      );

      setError(
        'Something went wrong while submitting the task.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />

          <p className="mt-3 text-sm text-muted-foreground">
            Loading task workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <AppLayout title="Task Workspace">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-destructive" />

            <h1 className="mt-4 text-xl font-semibold">
              Task unavailable
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
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

  if (!task) {
    return null;
  }

  const input = task.input_data || {};

  const isSubmitted =
    task.status === 'submitted' ||
    submission !== null;

  return (
    <AppLayout title="Task Workspace">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Link
              href={`/expert/projects/${task.project_id}`}
              className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to project
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <h1 className="text-2xl font-semibold">
                Task {task.task_number}
              </h1>

              <Badge
                variant="outline"
                className={
                  isSubmitted
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                    : 'border-primary/30 bg-primary/10 text-primary'
                }
              >
                {isSubmitted
                  ? 'Submitted'
                  : 'In Progress'}
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Review the AI response and provide your expert
              assessment.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Expert task workspace
          </div>

        </div>

        {/* TASK INPUT */}

        <section className="space-y-5">

          <div className="rounded-2xl border border-border/60 bg-card/50">

            <div className="border-b border-border/60 p-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Clinical context
              </p>

              <p className="mt-3 text-sm leading-7">
                {input.context ||
                  'No context provided.'}
              </p>
            </div>

            <div className="border-b border-border/60 p-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Question
              </p>

              <p className="mt-3 text-base font-medium leading-7">
                {input.question ||
                  'No question provided.'}
              </p>
            </div>

            <div className="p-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                AI response
              </p>

              <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4">
                <p className="text-sm leading-7">
                  {input.ai_response ||
                    'No AI response provided.'}
                </p>
              </div>
            </div>

          </div>

          {/* EXPERT ANSWER */}

          <div className="rounded-2xl border border-border/60 bg-card/50">

            <div className="border-b border-border/60 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Your expert assessment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Explain whether the AI response is
                    correct and provide the medically
                    appropriate answer.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-5">

              <Textarea
                value={answer}
                onChange={(event) =>
                  setAnswer(event.target.value)
                }
                disabled={isSubmitted}
                placeholder="Enter your expert assessment..."
                className="min-h-[220px] resize-y"
              />

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                  <div>
                    <p className="font-medium">
                      Task submitted successfully.
                    </p>

                    <p className="mt-1 text-xs opacity-80">
                      Your submission has been recorded and
                      is ready for review.
                    </p>
                  </div>
                </div>
              )}

              {!isSubmitted && (
                <div className="mt-5 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
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
                        Submit Task
                      </>
                    )}
                  </Button>
                </div>
              )}

            </div>

          </div>

        </section>

      </div>
    </AppLayout>
  );
}

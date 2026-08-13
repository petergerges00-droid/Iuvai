import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

import {
  getOpenEvaluations,
  getEvaluationSubmission,
  type Evaluation,
  type EvaluationSubmission,
} from '../lib/supabase';

import {
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ExpertEvaluations() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const [evaluations, setEvaluations] =
    useState<Evaluation[]>([]);

  const [submissions, setSubmissions] =
    useState<
      Record<string, EvaluationSubmission | null>
    >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.id) {
      return;
    }

    loadEvaluations(user.id);
  }, [authLoading, user?.id]);

  async function loadEvaluations(
    expertId: string
  ) {
    try {
      setLoading(true);
      setError('');

      const data = await getOpenEvaluations();

      setEvaluations(data);

      const submissionEntries =
        await Promise.all(
          data.map(async (evaluation) => {
            const submission =
              await getEvaluationSubmission(
                evaluation.id,
                expertId
              );

            return [
              evaluation.id,
              submission,
            ] as const;
          })
        );

      setSubmissions(
        Object.fromEntries(
          submissionEntries
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluations.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleOpenEvaluation(
    evaluationId: string
  ) {
    setLocation(
      `/evaluations/${evaluationId}`
    );
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />

          <p className="text-sm text-muted-foreground/60">
            Loading evaluations...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <div className="space-y-8">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header>

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Assessments
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground/70">
              Complete domain evaluations to help
              IUVAI assess your expertise for
              future AI projects.
            </p>
          </div>

        </div>

      </header>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">

          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium text-destructive">
              Unable to load assessments
            </p>

            <p className="mt-1 text-xs text-destructive/70">
              {error}
            </p>
          </div>

        </div>
      )}

      {/* ======================================================
          EMPTY STATE
          ====================================================== */}

      {evaluations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-white/[0.015] px-6 py-16 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-white/[0.025]">
            <FileText className="h-5 w-5 text-muted-foreground/40" />
          </div>

          <h3 className="mt-5 text-base font-medium">
            No assessments available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground/60">
            There are currently no assessments
            available for your expertise. Check
            back later for new opportunities.
          </p>

        </div>
      ) : (

        /* ====================================================
           EVALUATION LIST
           ==================================================== */

        <div className="space-y-4">

          {evaluations.map((evaluation) => {

            const submission =
              submissions[evaluation.id];

            const isSubmitted =
              submission?.status ===
              'submitted';

            const isInProgress =
              submission?.status ===
              'in_progress';

            return (
              <section
                key={evaluation.id}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/[0.015] p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.025]"
              >

                {/* Subtle hover glow */}

                <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/[0.04] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-start">

                  {/* ==================================================
                      EVALUATION INFORMATION
                      ================================================== */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-primary/80">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">

                        <h3 className="text-base font-semibold tracking-tight">
                          {evaluation.title}
                        </h3>

                        {evaluation.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/65">
                            {evaluation.description}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ==================================================
                        METADATA
                        ================================================== */}

                    <div className="mt-5 flex flex-wrap gap-2">

                      {evaluation.primary_field && (
                        <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
                          {evaluation.primary_field}
                        </span>
                      )}

                      {evaluation.specialization && (
                        <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
                          {evaluation.specialization}
                        </span>
                      )}

                      {evaluation.time_limit_minutes && (
                        <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">

                          <Clock className="h-3 w-3" />

                          {evaluation.time_limit_minutes}
                          {' '}
                          min

                        </span>
                      )}

                    </div>

                  </div>

                  {/* ==================================================
                      ACTION
                      ================================================== */}

                  <div className="flex shrink-0 sm:pt-1">

                    {isSubmitted ? (

                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2.5">

                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                        <span className="text-xs font-medium text-emerald-500">
                          Submitted
                        </span>

                      </div>

                    ) : (

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEvaluation(
                            evaluation.id
                          )
                        }
                        className="group/button flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_20px_rgba(99,102,241,0.18)]"
                      >

                        <span>
                          {isInProgress
                            ? 'Continue assessment'
                            : 'Start assessment'}
                        </span>

                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/button:translate-x-0.5" />

                      </button>

                    )}

                  </div>

                </div>

              </section>
            );
          })}

        </div>
      )}

    </div>
  );
}

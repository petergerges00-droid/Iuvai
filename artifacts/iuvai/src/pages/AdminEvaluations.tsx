import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

import {
  getAllEvaluations,
  createEvaluation,
  type Evaluation,
} from '@/lib/supabase';

import { AppLayout } from '@/components/layout/app-layout';

import {
  Loader2,
  Plus,
  ChevronRight,
  FileText,
  CalendarDays,
  CircleDot,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AdminEvaluations() {
  const [, setLocation] = useLocation();

  const [evaluations, setEvaluations] =
    useState<Evaluation[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
  ============================================================
  LOAD EVALUATIONS
  ============================================================
  */

  useEffect(() => {
    loadEvaluations();
  }, []);

  async function loadEvaluations() {
    try {
      setLoading(true);
      setError('');

      const data =
        await getAllEvaluations();

      setEvaluations(data);
    } catch (err) {
      console.error(
        'ADMIN EVALUATIONS LOAD ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluations.'
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  ============================================================
  CREATE EVALUATION
  ============================================================
  */

  async function handleCreateEvaluation() {
    try {
      setCreating(true);
      setError('');

      const evaluation =
        await createEvaluation({
          title: 'New evaluation',
          description: null,
          primary_field: null,
          specialization: null,
          instructions: null,
          time_limit_minutes: null,
          status: 'draft',
        });

      setEvaluations((current) => [
        evaluation,
        ...current,
      ]);

      setLocation(
        `/admin/evaluations/${evaluation.id}`
      );
    } catch (err) {
      console.error(
        'ADMIN EVALUATION CREATE ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create evaluation.'
      );
    } finally {
      setCreating(false);
    }
  }

  /*
  ============================================================
  OPEN EVALUATION
  ============================================================
  */

  function handleEditEvaluation(
    evaluationId: string
  ) {
    setLocation(
      `/admin/evaluations/${evaluationId}`
    );
  }

  /*
  ============================================================
  STATUS
  ============================================================
  */

  function getStatusClasses(
    status: Evaluation['status']
  ) {
    switch (status) {
      case 'open':
        return {
          container:
            'border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400',
          dot:
            'bg-green-500',
        };

      case 'closed':
        return {
          container:
            'border-border/70 bg-muted/40 text-muted-foreground',
          dot:
            'bg-muted-foreground/50',
        };

      case 'draft':
      default:
        return {
          container:
            'border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400',
          dot:
            'bg-yellow-500',
        };
    }
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <AppLayout title="Evaluations">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="flex flex-col items-center">

            <Loader2 className="h-7 w-7 animate-spin text-primary" />

            <p className="mt-4 text-sm text-muted-foreground">
              Loading evaluations...
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Evaluations">

      <div className="space-y-8">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <section>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">

                  <Sparkles className="h-4 w-4 text-primary" />

                </div>

                <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                  IUVAI / EVALUATION SYSTEM
                </p>

              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Evaluations
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create and manage expert evaluations used to assess
                domain expertise for IUVAI projects.
              </p>

            </div>

            <button
              type="button"
              onClick={handleCreateEvaluation}
              disabled={creating}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {creating ? (

                <Loader2 className="h-4 w-4 animate-spin" />

              ) : (

                <Plus className="h-4 w-4" />

              )}

              {creating
                ? 'Creating...'
                : 'Create evaluation'}

            </button>

          </div>

        </section>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">

            <div className="flex gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5">

                <AlertCircle className="h-4 w-4 text-destructive" />

              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-medium text-destructive">
                  Unable to load evaluations
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadEvaluations}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-foreground transition-colors hover:text-primary"
                >

                  <RefreshCw className="h-3.5 w-3.5" />

                  Try again

                </button>

              </div>

            </div>

          </div>

        )}


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={
              <FileText className="h-4 w-4" />
            }
            label="Total evaluations"
            value={evaluations.length}
          />

          <SummaryCard
            icon={
              <CircleDot className="h-4 w-4" />
            }
            label="Open"
            value={
              evaluations.filter(
                (evaluation) =>
                  evaluation.status === 'open'
              ).length
            }
          />

          <SummaryCard
            icon={
              <Sparkles className="h-4 w-4" />
            }
            label="Drafts"
            value={
              evaluations.filter(
                (evaluation) =>
                  evaluation.status === 'draft'
              ).length
            }
          />

        </div>


        {/* ====================================================
            EVALUATION LIST
        ==================================================== */}

        {evaluations.length === 0 ? (

          <section className="rounded-2xl border border-dashed border-border/70 bg-card/50">

            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">

                <FileText className="h-6 w-6 text-primary" />

              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No evaluations yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Create your first evaluation to begin assessing
                domain experts through the IUVAI evaluation system.
              </p>

              <button
                type="button"
                onClick={handleCreateEvaluation}
                disabled={creating}
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {creating ? (

                  <Loader2 className="h-4 w-4 animate-spin" />

                ) : (

                  <Plus className="h-4 w-4" />

                )}

                {creating
                  ? 'Creating...'
                  : 'Create evaluation'}

              </button>

            </div>

          </section>

        ) : (

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70">

            {/* ==================================================
                SECTION HEADER
            ================================================== */}

            <div className="border-b border-border/60 p-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <FileText className="h-4 w-4 text-primary" />

                    <h2 className="font-medium">
                      Evaluation library
                    </h2>

                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Select an evaluation to configure its
                    requirements and assessment criteria.
                  </p>

                </div>

                <div className="hidden rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground sm:block">

                  {evaluations.length}{' '}
                  {evaluations.length === 1
                    ? 'evaluation'
                    : 'evaluations'}

                </div>

              </div>

            </div>


            {/* ==================================================
                DESKTOP TABLE HEADER
            ================================================== */}

            <div className="hidden grid-cols-[minmax(0,1fr)_170px_150px_120px_32px] gap-4 border-b border-border/60 bg-muted/20 px-5 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground lg:grid">

              <div>
                Evaluation
              </div>

              <div>
                Field
              </div>

              <div>
                Created
              </div>

              <div>
                Status
              </div>

              <div />

            </div>


            {/* ==================================================
                EVALUATIONS
            ================================================== */}

            <div className="divide-y divide-border/60">

              {evaluations.map(
                (evaluation) => {

                  const status =
                    getStatusClasses(
                      evaluation.status
                    );

                  return (

                    <button
                      key={evaluation.id}
                      type="button"
                      onClick={() =>
                        handleEditEvaluation(
                          evaluation.id
                        )
                      }
                      className="group block w-full text-left transition-colors hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
                    >

                      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_170px_150px_120px_32px] lg:items-center lg:gap-4">


                        {/* ======================================
                            EVALUATION
                        ======================================= */}

                        <div className="min-w-0">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">

                              <FileText className="h-4 w-4" />

                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="truncate font-medium">
                                  {evaluation.title}
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize ${status.container}`}
                                >

                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />

                                  {evaluation.status}

                                </span>

                              </div>

                              {evaluation.description && (

                                <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                                  {evaluation.description}
                                </p>

                              )}

                            </div>

                          </div>

                        </div>


                        {/* ======================================
                            FIELD
                        ======================================= */}

                        <div>

                          <div className="flex items-center gap-2 lg:block">

                            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:hidden">
                              Field
                            </span>

                            <p className="text-sm text-muted-foreground">

                              {evaluation.primary_field ||
                                'Not specified'}

                            </p>

                          </div>

                          {evaluation.specialization && (

                            <p className="mt-1 text-xs text-muted-foreground/70">

                              {evaluation.specialization}

                            </p>

                          )}

                        </div>


                        {/* ======================================
                            CREATED
                        ======================================= */}

                        <div>

                          <div className="flex items-center gap-2">

                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/70" />

                            <p className="text-sm text-muted-foreground">

                              {new Date(
                                evaluation.created_at
                              ).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}

                            </p>

                          </div>

                        </div>


                        {/* ======================================
                            STATUS
                        ======================================= */}

                        <div className="hidden lg:block">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${status.container}`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {evaluation.status}

                          </span>

                        </div>


                        {/* ======================================
                            ARROW
                        ======================================= */}

                        <div className="hidden justify-end lg:flex">

                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />

                        </div>


                        {/* ======================================
                            MOBILE ACTION
                        ======================================= */}

                        <div className="flex items-center justify-between border-t border-border/40 pt-3 lg:hidden">

                          <span className="text-xs text-muted-foreground">
                            Open evaluation
                          </span>

                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

                        </div>

                      </div>

                    </button>

                  );
                }
              )}

            </div>

          </section>

        )}

      </div>

    </AppLayout>
  );
}


/*
============================================================
SUMMARY CARD
============================================================
*/

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 text-primary">

          {icon}

        </div>

        <span className="text-2xl font-semibold tracking-tight">
          {value}
        </span>

      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {label}
      </p>

    </div>
  );
}

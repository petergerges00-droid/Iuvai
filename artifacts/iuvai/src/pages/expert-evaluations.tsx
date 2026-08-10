import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

import {
  getOpenEvaluations,
  getEvaluationSubmission,
  type Evaluation,
  type EvaluationSubmission,
} from '../lib/supabase';

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

      const data =
        await getOpenEvaluations();

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

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        Loading evaluations...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-semibold">
          Evaluations
        </h1>

        <p className="mt-2 text-gray-500">
          Complete domain evaluations to help
          IUVAI assess your expertise for
          future AI projects.
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <h2 className="text-lg font-medium">
            No evaluations available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no evaluations
            available for your expertise.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
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
                className="rounded-2xl border p-6 transition hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold">
                      {evaluation.title}
                    </h2>

                    {evaluation.description && (
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {evaluation.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {evaluation.primary_field && (
                        <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                          {evaluation.primary_field}
                        </span>
                      )}

                      {evaluation.specialization && (
                        <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                          {evaluation.specialization}
                        </span>
                      )}

                      {evaluation.time_limit_minutes && (
                        <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                          {
                            evaluation.time_limit_minutes
                          }{' '}
                          min
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                    {isSubmitted ? (
                      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                        Submitted
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEvaluation(
                            evaluation.id
                          )
                        }
                        className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        {isInProgress
                          ? 'Continue evaluation'
                          : 'Start evaluation'}
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

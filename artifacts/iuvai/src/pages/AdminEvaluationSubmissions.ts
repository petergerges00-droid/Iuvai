import { useEffect, useState } from 'react';
import {
  getSubmittedEvaluations,
  getExpertWithProfile,
  type Evaluation,
  type ExpertWithProfile,
} from '../lib/supabase';

interface EvaluationSubmissionRow {
  id: string;
  evaluation_id: string;
  expert_id: string;
  status: string;
  started_at: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;

  evaluations?: {
    id: string;
    title: string;
    primary_field: string | null;
    specialization: string | null;
  } | null;
}

interface SubmissionWithExpert
  extends EvaluationSubmissionRow {
  expert: ExpertWithProfile | null;
}

interface Props {
  onReview?: (submissionId: string) => void;
}

export default function AdminEvaluationSubmissions({
  onReview,
}: Props) {
  const [submissions, setSubmissions] =
    useState<SubmissionWithExpert[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setLoading(true);
      setError('');

      const data =
        (await getSubmittedEvaluations()) as EvaluationSubmissionRow[];

      const submissionsWithExperts =
        await Promise.all(
          data.map(async (submission) => {
            let expert: ExpertWithProfile | null =
              null;

            try {
              expert =
                await getExpertWithProfile(
                  submission.expert_id
                );
            } catch (expertError) {
              console.error(
                'Failed to load expert:',
                expertError
              );
            }

            return {
              ...submission,
              expert,
            };
          })
        );

      setSubmissions(
        submissionsWithExperts
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluation submissions.'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(
    date: string | null
  ) {
    if (!date) return '—';

    return new Date(
      date
    ).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  }

  function getReviewStatus(
    submission: SubmissionWithExpert
  ) {
    if (
      submission.status ===
      'submitted'
    ) {
      return {
        label: 'Pending review',
        classes:
          'bg-yellow-50 text-yellow-700 border-yellow-200',
      };
    }

    if (
      submission.status ===
      'under_review'
    ) {
      return {
        label: 'Under review',
        classes:
          'bg-blue-50 text-blue-700 border-blue-200',
      };
    }

    if (
      submission.status ===
      'approved'
    ) {
      return {
        label: 'Approved',
        classes:
          'bg-green-50 text-green-700 border-green-200',
      };
    }

    if (
      submission.status ===
      'rejected'
    ) {
      return {
        label: 'Rejected',
        classes:
          'bg-red-50 text-red-700 border-red-200',
      };
    }

    return {
      label: submission.status,
      classes:
        'bg-gray-50 text-gray-600 border-gray-200',
    };
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        Loading evaluation submissions...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">

      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-semibold">
          Evaluation Submissions
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review completed expert evaluations
          and verify domain experts for IUVAI.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">

          <div className="text-4xl">
            ✓
          </div>

          <h2 className="mt-4 font-medium">
            No submissions awaiting review
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Completed expert evaluations will
            appear here.
          </p>

        </div>
      ) : (

        /* SUBMISSION LIST */

        <div className="overflow-hidden rounded-xl border">

          {/* DESKTOP HEADER */}

          <div className="hidden grid-cols-[1fr_180px_180px_140px_100px] gap-4 border-b bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 lg:grid">

            <div>Expert</div>

            <div>Evaluation</div>

            <div>Expertise</div>

            <div>Submitted</div>

            <div>Status</div>

          </div>

          <div className="divide-y">

            {submissions.map(
              (submission) => {

                const status =
                  getReviewStatus(
                    submission
                  );

                const expert =
                  submission.expert;

                const evaluation =
                  submission.evaluations;

                return (
                  <button
                    key={
                      submission.id
                    }
                    type="button"
                    onClick={() =>
                      onReview?.(
                        submission.id
                      )
                    }
                    className="block w-full text-left transition hover:bg-gray-50"
                  >

                    <div className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_180px_180px_140px_100px] lg:items-center">

                      {/* EXPERT */}

                      <div>

                        <div className="font-medium">

                          {expert
                            ?.profile
                            ?.full_name ||
                            'Unknown expert'}

                        </div>

                        <div className="mt-1 text-sm text-gray-500">

                          {expert
                            ?.profile
                            ?.country ||
                            'Country not specified'}

                        </div>

                      </div>

                      {/* EVALUATION */}

                      <div>

                        <div className="font-medium text-sm">

                          {evaluation
                            ?.title ||
                            'Unknown evaluation'}

                        </div>

                        {evaluation
                          ?.specialization && (
                          <div className="mt-1 text-xs text-gray-500">

                            {
                              evaluation.specialization
                            }

                          </div>
                        )}

                      </div>

                      {/* EXPERTISE */}

                      <div className="text-sm text-gray-600">

                        <div>
                          {expert
                            ?.primary_field ||
                            evaluation
                              ?.primary_field ||
                            '—'}
                        </div>

                        {expert
                          ?.specialization && (
                          <div className="mt-1 text-xs text-gray-500">

                            {
                              expert.specialization
                            }

                          </div>
                        )}

                      </div>

                      {/* SUBMITTED */}

                      <div className="text-sm text-gray-500">

                        {formatDate(
                          submission.submitted_at
                        )}

                      </div>

                      {/* STATUS */}

                      <div>

                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.classes}`}
                        >
                          {status.label}
                        </span>

                      </div>

                    </div>

                    {/* MOBILE DETAILS */}

                    <div className="border-t bg-gray-50 px-5 py-3 lg:hidden">

                      <div className="flex items-center justify-between">

                        <span className="text-xs text-gray-500">

                          Tap to review

                        </span>

                        <span className="text-sm font-medium">

                          →

                        </span>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

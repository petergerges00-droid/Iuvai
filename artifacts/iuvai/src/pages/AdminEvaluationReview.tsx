import { useEffect, useState } from 'react';
import {
  getEvaluationSubmission,
  getEvaluation,
  getEvaluationQuestions,
  getEvaluationAnswers,
  getEvaluationReview,
  createEvaluationReview,
  getEvaluationQuestionReviews,
  saveEvaluationQuestionReview,
  updateEvaluationReview,
  getExpertWithProfile,
  type Evaluation,
  type EvaluationQuestion,
  type EvaluationAnswer,
  type EvaluationSubmission,
  type EvaluationReview,
  type EvaluationQuestionReview,
  type ExpertWithProfile,
} from '../lib/supabase';

interface Props {
  submissionId: string;
  reviewerId: string;
  onBack?: () => void;
}

export default function AdminEvaluationReview({
  submissionId,
  reviewerId,
  onBack,
}: Props) {
  const [submission, setSubmission] =
    useState<EvaluationSubmission | null>(null);

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [questions, setQuestions] =
    useState<EvaluationQuestion[]>([]);

  const [answers, setAnswers] =
    useState<EvaluationAnswer[]>([]);

  const [expert, setExpert] =
    useState<ExpertWithProfile | null>(null);

  const [review, setReview] =
    useState<EvaluationReview | null>(null);

  const [questionReviews, setQuestionReviews] =
    useState<
      Record<
        string,
        {
          score: string;
          feedback: string;
        }
      >
    >({});

  const [overallScore, setOverallScore] =
    useState('');

  const [reviewerNotes, setReviewerNotes] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [decision, setDecision] =
    useState<
      'approved' | 'rejected' | null
    >(null);

  useEffect(() => {
    loadReview();
  }, [submissionId, reviewerId]);

  async function loadReview() {
    try {
      setLoading(true);
      setError('');

      const submissionData =
        await getEvaluationSubmission(
          '',
          ''
        );

      /*
       * We already know the submission ID.
       * Load the submission directly through Supabase
       * because getEvaluationSubmission() requires
       * evaluationId + expertId.
       */
      const { data: submissionRow, error: submissionError } =
        await (
          await import('../lib/supabase')
        ).supabase
          .from('evaluation_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();

      if (submissionError || !submissionRow) {
        throw new Error(
          submissionError?.message ||
            'Evaluation submission not found.'
        );
      }

      const actualSubmission =
        submissionRow as EvaluationSubmission;

      setSubmission(actualSubmission);

      const [
        evaluationData,
        questionData,
        answerData,
        expertData,
      ] = await Promise.all([
        getEvaluation(
          actualSubmission.evaluation_id
        ),

        getEvaluationQuestions(
          actualSubmission.evaluation_id
        ),

        getEvaluationAnswers(
          actualSubmission.id
        ),

        getExpertWithProfile(
          actualSubmission.expert_id
        ),
      ]);

      if (!evaluationData) {
        throw new Error(
          'Evaluation not found.'
        );
      }

      setEvaluation(evaluationData);
      setQuestions(questionData);
      setAnswers(answerData);
      setExpert(expertData);

      let reviewData =
        await getEvaluationReview(
          actualSubmission.id
        );

      if (!reviewData) {
        reviewData =
          await createEvaluationReview(
            actualSubmission.id,
            reviewerId
          );
      }

      setReview(reviewData);

      setOverallScore(
        reviewData.overall_score !== null
          ? String(
              reviewData.overall_score
            )
          : ''
      );

      setReviewerNotes(
        reviewData.reviewer_notes || ''
      );

      const existingQuestionReviews =
        await getEvaluationQuestionReviews(
          reviewData.id
        );

      const reviewMap: Record<
        string,
        {
          score: string;
          feedback: string;
        }
      > = {};

      existingQuestionReviews.forEach(
        (
          questionReview: EvaluationQuestionReview
        ) => {
          reviewMap[
            questionReview.question_id
          ] = {
            score:
              questionReview.score !== null
                ? String(
                    questionReview.score
                  )
                : '',

            feedback:
              questionReview.feedback ||
              '',
          };
        }
      );

      setQuestionReviews(
        reviewMap
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluation review.'
      );
    } finally {
      setLoading(false);
    }
  }

  function getAnswer(
    questionId: string
  ) {
    return (
      answers.find(
        (answer) =>
          answer.question_id ===
          questionId
      )?.answer_text || ''
    );
  }

  function updateQuestionReview(
    questionId: string,
    field:
      | 'score'
      | 'feedback',
    value: string
  ) {
    setQuestionReviews(
      (current) => ({
        ...current,

        [questionId]: {
          score:
            current[
              questionId
            ]?.score || '',

          feedback:
            current[
              questionId
            ]?.feedback || '',

          [field]: value,
        },
      })
    );
  }

  async function saveQuestionReview(
    questionId: string
  ) {
    if (!review) return;

    const current =
      questionReviews[
        questionId
      ] || {
        score: '',
        feedback: '',
      };

    const score =
      current.score.trim()
        ? Number(current.score)
        : null;

    if (
      score !== null &&
      (Number.isNaN(score) ||
        score < 0 ||
        score > 10)
    ) {
      setError(
        'Question scores must be between 0 and 10.'
      );
      return;
    }

    try {
      await saveEvaluationQuestionReview(
        review.id,
        questionId,
        score,
        current.feedback || null
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save question review.'
      );
    }
  }

  async function saveAllQuestionReviews() {
    if (!review) return;

    for (const question of questions) {
      await saveQuestionReview(
        question.id
      );
    }
  }

  async function handleDecision(
    nextDecision:
      | 'approved'
      | 'rejected'
  ) {
    if (!review || !submission) {
      return;
    }

    const score =
      overallScore.trim()
        ? Number(overallScore)
        : null;

    if (
      score !== null &&
      (Number.isNaN(score) ||
        score < 0 ||
        score > 10)
    ) {
      setError(
        'Overall score must be between 0 and 10.'
      );
      return;
    }

    const unansweredQuestions =
      questions.filter(
        (question) =>
          !getAnswer(question.id).trim()
      );

    if (
      unansweredQuestions.length > 0
    ) {
      setError(
        'This submission contains unanswered questions.'
      );
      return;
    }

    const confirmed =
      window.confirm(
        nextDecision === 'approved'
          ? 'Approve this expert? This will mark the expert as verified.'
          : 'Reject this expert evaluation?'
      );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');

      await saveAllQuestionReviews();

      const updatedReview =
        await updateEvaluationReview(
          review.id,
          {
            status:
              nextDecision,

            overall_score:
              score,

            reviewer_notes:
              reviewerNotes.trim() ||
              null,
          }
        );

      /*
       * Update the submission status.
       */
      const { error: submissionError } =
        await (
          await import('../lib/supabase')
        ).supabase
          .from(
            'evaluation_submissions'
          )
          .update({
            status:
              nextDecision,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            submission.id
          );

      if (submissionError) {
        throw new Error(
          `Failed to update submission: ${submissionError.message}`
        );
      }

      /*
       * Update the expert's verification status.
       */
      const { error: expertError } =
        await (
          await import('../lib/supabase')
        ).supabase
          .from('expert_profiles')
          .update({
            verification_status:
              nextDecision ===
              'approved'
                ? 'approved'
                : 'declined',
          })
          .eq(
            'id',
            submission.expert_id
          );

      if (expertError) {
        throw new Error(
          `Failed to update expert verification: ${expertError.message}`
        );
      }

      setReview(
        updatedReview
      );

      setSubmission({
        ...submission,
        status:
          nextDecision,
      });

      setDecision(
        nextDecision
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save review.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        Loading evaluation review...
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Back
        </button>
      </div>
    );
  }

  if (
    !submission ||
    !evaluation ||
    !review
  ) {
    return null;
  }

  if (decision) {
    const approved =
      decision === 'approved';

    return (
      <div className="mx-auto max-w-3xl p-6">

        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm text-gray-500 hover:text-black"
        >
          ← Back to submissions
        </button>

        <div className="rounded-2xl border p-10 text-center">

          <div className="text-5xl">
            {approved
              ? '✓'
              : '×'}
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            {approved
              ? 'Expert approved'
              : 'Evaluation rejected'}
          </h1>

          <p className="mt-3 text-gray-500">
            {approved
              ? `${expert?.profile?.full_name || 'The expert'} has been verified and can now enter the IUVAI expert pool.`
              : `The evaluation for ${expert?.profile?.full_name || 'this expert'} has been rejected.`}
          </p>

          <button
            type="button"
            onClick={onBack}
            className="mt-7 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to submissions
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">

      {/* BACK */}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Back to submissions
      </button>

      {/* HEADER */}

      <header>

        <h1 className="text-3xl font-semibold">
          Evaluation Review
        </h1>

        <p className="mt-2 text-gray-500">
          Review the expert's responses and
          determine whether they meet IUVAI's
          verification standard.
        </p>

      </header>

      {/* EXPERT CARD */}

      <section className="rounded-2xl border p-6">

        <div className="flex flex-col justify-between gap-6 sm:flex-row">

          <div>

            <h2 className="text-xl font-semibold">
              {expert?.profile?.full_name ||
                'Unknown expert'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {expert?.profile?.country ||
                'Country not specified'}
            </p>

          </div>

          <div className="text-sm sm:text-right">

            <div className="font-medium">
              {expert?.primary_field ||
                'Field not specified'}
            </div>

            <div className="mt-1 text-gray-500">
              {expert?.specialization ||
                'Specialization not specified'}
            </div>

          </div>

        </div>

        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Experience
            </div>

            <div className="mt-1 text-sm font-medium">
              {expert?.years_experience ??
                '—'}{' '}
              {expert?.years_experience
                ? 'years'
                : ''}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Qualification
            </div>

            <div className="mt-1 text-sm font-medium">
              {expert?.highest_qualification ||
                '—'}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
              AI experience
            </div>

            <div className="mt-1 text-sm font-medium">
              {expert?.previous_ai_experience ||
                '—'}
            </div>
          </div>

        </div>

      </section>

      {/* EVALUATION */}

      <section>

        <div className="mb-6">

          <h2 className="text-xl font-semibold">
            {evaluation.title}
          </h2>

          {evaluation.description && (
            <p className="mt-2 text-sm text-gray-500">
              {evaluation.description}
            </p>
          )}

        </div>

        <div className="space-y-6">

          {questions.map(
            (question, index) => {

              const answer =
                getAnswer(
                  question.id
                );

              const current =
                questionReviews[
                  question.id
                ] || {
                  score: '',
                  feedback: '',
                };

              return (
                <section
                  key={
                    question.id
                  }
                  className="rounded-2xl border p-6"
                >

                  <div className="flex gap-3">

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                      {index + 1}
                    </span>

                    <h3 className="font-medium">
                      {question.prompt}
                    </h3>

                  </div>

                  {question.context && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                      {question.context}
                    </div>
                  )}

                  <div className="mt-5">

                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Expert response
                    </div>

                    <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm leading-7 text-gray-700">
                      {answer ||
                        'No answer provided.'}
                    </div>

                  </div>

                  {/* REVIEW */}

                  <div className="mt-6 grid gap-5 border-t pt-6 md:grid-cols-[120px_1fr]">

                    <div>

                      <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Score
                      </label>

                      <div className="mt-2 flex items-center gap-2">

                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={
                            current.score
                          }
                          onChange={(e) =>
                            updateQuestionReview(
                              question.id,
                              'score',
                              e.target.value
                            )
                          }
                          onBlur={() =>
                            saveQuestionReview(
                              question.id
                            )
                          }
                          className="w-20 rounded-lg border p-2 text-center"
                        />

                        <span className="text-sm text-gray-400">
                          / 10
                        </span>

                      </div>

                    </div>

                    <div>

                      <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Reviewer feedback
                      </label>

                      <textarea
                        value={
                          current.feedback
                        }
                        onChange={(e) =>
                          updateQuestionReview(
                            question.id,
                            'feedback',
                            e.target.value
                          )
                        }
                        onBlur={() =>
                          saveQuestionReview(
                            question.id
                          )
                        }
                        className="mt-2 min-h-24 w-full rounded-lg border p-3 text-sm"
                        placeholder="Explain the reasoning behind your score..."
                      />

                    </div>

                  </div>

                </section>
              );
            }
          )}

        </div>

      </section>

      {/* FINAL DECISION */}

      <section className="rounded-2xl border p-6">

        <h2 className="text-xl font-semibold">
          Final assessment
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Record the overall assessment before
          approving or rejecting the expert.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-[140px_1fr]">

          <div>

            <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Overall score
            </label>

            <div className="mt-2 flex items-center gap-2">

              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={
                  overallScore
                }
                onChange={(e) =>
                  setOverallScore(
                    e.target.value
                  )
                }
                className="w-20 rounded-lg border p-2 text-center"
              />

              <span className="text-sm text-gray-400">
                / 10
              </span>

            </div>

          </div>

          <div>

            <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Reviewer notes
            </label>

            <textarea
              value={
                reviewerNotes
              }
              onChange={(e) =>
                setReviewerNotes(
                  e.target.value
                )
              }
              className="mt-2 min-h-28 w-full rounded-lg border p-3 text-sm"
              placeholder="Overall assessment of the expert..."
            />

          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t pt-6 sm:flex-row">

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleDecision(
                'rejected'
              )
            }
            className="rounded-lg border border-red-200 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject expert
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              handleDecision(
                'approved'
              )
            }
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Approve expert'}
          </button>

        </div>

      </section>

    </div>
  );
}

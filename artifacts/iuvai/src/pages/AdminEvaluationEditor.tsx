import { useEffect, useState } from 'react';

import {
  getEvaluation,
  getEvaluationQuestions,
  updateEvaluation,
  createEvaluationQuestion,
  updateEvaluationQuestion,
  deleteEvaluationQuestion,
  setEvaluationStatus,
  type Evaluation,
  type EvaluationQuestion,
} from '../lib/supabase';

interface Props {
  evaluationId: string;
  onBack?: () => void;
}

export default function AdminEvaluationEditor({
  evaluationId,
  onBack,
}: Props) {
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [questions, setQuestions] =
    useState<EvaluationQuestion[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  useEffect(() => {
    loadEvaluation();
  }, [evaluationId]);

  async function loadEvaluation() {
    try {
      setLoading(true);
      setError('');

      const [
        evaluationData,
        questionData,
      ] = await Promise.all([
        getEvaluation(evaluationId),
        getEvaluationQuestions(evaluationId),
      ]);

      if (!evaluationData) {
        throw new Error(
          'Evaluation not found.'
        );
      }

      setEvaluation(evaluationData);
      setQuestions(questionData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load evaluation.'
      );
    } finally {
      setLoading(false);
    }
  }

  function updateLocalEvaluation(
    field: keyof Evaluation,
    value: string | number | null
  ) {
    if (!evaluation) return;

    setEvaluation({
      ...evaluation,
      [field]: value,
    });
  }

  async function handleSaveEvaluation() {
    if (!evaluation) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const updated =
        await updateEvaluation(
          evaluation.id,
          {
            title: evaluation.title,
            description:
              evaluation.description,
            primary_field:
              evaluation.primary_field,
            specialization:
              evaluation.specialization,
            instructions:
              evaluation.instructions,
            time_limit_minutes:
              evaluation.time_limit_minutes,
          }
        );

      setEvaluation(updated);

      setMessage(
        'Evaluation saved successfully.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save evaluation.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddQuestion() {
    if (!evaluation) return;

    try {
      setError('');
      setMessage('');

      const nextOrder =
        questions.length === 0
          ? 1
          : Math.max(
              ...questions.map(
                (question) =>
                  question.question_order
              )
            ) + 1;

      const question =
        await createEvaluationQuestion({
          evaluation_id:
            evaluation.id,

          question_order:
            nextOrder,

          prompt:
            'New evaluation question',

          context:
            null,

          response_type:
            'long_text',
        });

      setQuestions((current) => [
        ...current,
        question,
      ]);

      setMessage(
        'Question added.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add question.'
      );
    }
  }

  async function handleSaveQuestion(
    question: EvaluationQuestion
  ) {
    try {
      setError('');
      setMessage('');

      const updated =
        await updateEvaluationQuestion(
          question.id,
          {
            question_order:
              question.question_order,

            prompt:
              question.prompt,

            context:
              question.context,

            response_type:
              question.response_type,
          }
        );

      setQuestions((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      setMessage(
        'Question saved.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save question.'
      );
    }
  }

  async function handleDeleteQuestion(
    questionId: string
  ) {
    const confirmed =
      window.confirm(
        'Delete this question? This cannot be undone.'
      );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      await deleteEvaluationQuestion(
        questionId
      );

      setQuestions((current) =>
        current
          .filter(
            (question) =>
              question.id !== questionId
          )
          .map(
            (question, index) => ({
              ...question,
              question_order:
                index + 1,
            })
          )
      );

      setMessage(
        'Question deleted.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete question.'
      );
    }
  }

  function updateQuestion(
    questionId: string,
    field: keyof EvaluationQuestion,
    value: string | number
  ) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  }

  async function handleStatusChange(
    status:
      | 'draft'
      | 'open'
      | 'closed'
  ) {
    if (!evaluation) return;

    const labels = {
      draft: 'save as draft',
      open: 'open this evaluation',
      closed: 'close this evaluation',
    };

    const confirmed =
      window.confirm(
        `Are you sure you want to ${labels[status]}?`
      );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const updated =
        await setEvaluationStatus(
          evaluation.id,
          status
        );

      setEvaluation(updated);

      setMessage(
        `Evaluation is now ${status}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to change evaluation status.'
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        Loading evaluation editor...
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 rounded-lg border px-4 py-2 text-sm"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 text-sm text-gray-500 hover:text-black"
          >
            ← Back to evaluations
          </button>

          <h1 className="text-2xl font-semibold">
            Evaluation editor
          </h1>

          <div className="mt-2">
            <span className="rounded-full border px-3 py-1 text-xs font-medium capitalize">
              {evaluation.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {evaluation.status !==
            'draft' && (
            <button
              type="button"
              onClick={() =>
                handleStatusChange(
                  'draft'
                )
              }
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Set draft
            </button>
          )}

          {evaluation.status !==
            'open' && (
            <button
              type="button"
              onClick={() =>
                handleStatusChange(
                  'open'
                )
              }
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Open evaluation
            </button>
          )}

          {evaluation.status ===
            'open' && (
            <button
              type="button"
              onClick={() =>
                handleStatusChange(
                  'closed'
                )
              }
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Close evaluation
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* BASIC INFORMATION */}

      <section className="rounded-xl border bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Evaluation details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Define what this evaluation measures.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Title
            </label>

            <input
              value={evaluation.title}
              onChange={(e) =>
                updateLocalEvaluation(
                  'title',
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-3"
              placeholder="e.g. AI Expert Evaluation"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={
                evaluation.description ||
                ''
              }
              onChange={(e) =>
                updateLocalEvaluation(
                  'description',
                  e.target.value
                )
              }
              className="min-h-24 w-full rounded-lg border p-3"
              placeholder="Briefly describe what this evaluation measures."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Primary field
              </label>

              <input
                value={
                  evaluation.primary_field ||
                  ''
                }
                onChange={(e) =>
                  updateLocalEvaluation(
                    'primary_field',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
                placeholder="e.g. Medicine"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Specialization
              </label>

              <input
                value={
                  evaluation.specialization ||
                  ''
                }
                onChange={(e) =>
                  updateLocalEvaluation(
                    'specialization',
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
                placeholder="e.g. Neurosurgery"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Time limit
            </label>

            <input
              type="number"
              min="1"
              value={
                evaluation.time_limit_minutes ||
                ''
              }
              onChange={(e) =>
                updateLocalEvaluation(
                  'time_limit_minutes',
                  e.target.value
                    ? Number(
                        e.target.value
                      )
                    : null
                )
              }
              className="w-full rounded-lg border p-3 md:max-w-xs"
              placeholder="Minutes"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Instructions
            </label>

            <textarea
              value={
                evaluation.instructions ||
                ''
              }
              onChange={(e) =>
                updateLocalEvaluation(
                  'instructions',
                  e.target.value
                )
              }
              className="min-h-32 w-full rounded-lg border p-3"
              placeholder="Instructions shown to the expert before starting the evaluation."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t pt-5">
          <button
            type="button"
            onClick={
              handleSaveEvaluation
            }
            disabled={saving}
            className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving
              ? 'Saving...'
              : 'Save evaluation'}
          </button>
        </div>
      </section>

      {/* QUESTIONS */}

      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">
              Questions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Build the questions experts will answer.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleAddQuestion
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            + Add question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <h3 className="font-medium">
              No questions yet
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add questions to build the evaluation.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {questions
              .sort(
                (a, b) =>
                  a.question_order -
                  b.question_order
              )
              .map(
                (
                  question,
                  index
                ) => (
                  <div
                    key={
                      question.id
                    }
                    className="rounded-xl border bg-white p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-medium">
                        Question{' '}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteQuestion(
                            question.id
                          )
                        }
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Question
                        </label>

                        <textarea
                          value={
                            question.prompt
                          }
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              'prompt',
                              e.target.value
                            )
                          }
                          className="min-h-28 w-full rounded-lg border p-3"
                          placeholder="Enter the question..."
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Context
                          <span className="ml-1 font-normal text-gray-400">
                            optional
                          </span>
                        </label>

                        <textarea
                          value={
                            question.context ||
                            ''
                          }
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              'context',
                              e.target.value
                            )
                          }
                          className="min-h-24 w-full rounded-lg border p-3"
                          placeholder="Additional context shown with the question."
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Question order
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              question.question_order
                            }
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                'question_order',
                                Number(
                                  e.target.value
                                )
                              )
                            }
                            className="w-full rounded-lg border p-3"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Response type
                          </label>

                          <select
                            value={
                              question.response_type
                            }
                            onChange={(e) =>
                              updateQuestion(
                                question.id,
                                'response_type',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border p-3"
                          >
                            <option value="long_text">
                              Long text
                            </option>

                            <option value="text">
                              Short text
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end border-t pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          handleSaveQuestion(
                            question
                          )
                        }
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                      >
                        Save question
                      </button>
                    </div>
                  </div>
                )
              )}
          </div>
        )}
      </section>
    </div>
  );
}

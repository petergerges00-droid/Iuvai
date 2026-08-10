import { useEffect, useState } from 'react';
import {
  getEvaluation,
  getEvaluationQuestions,
  upsertEvaluation,
  upsertEvaluationQuestion,
  deleteEvaluationQuestion,
  type Evaluation,
  type EvaluationQuestion,
} from '../lib/supabase';

interface Props {
  evaluationId?: string;
  onSaved?: (evaluationId: string) => void;
}

export default function EvaluationBuilder({
  evaluationId,
  onSaved,
}: Props) {
  const [evaluation, setEvaluation] = useState<Partial<Evaluation>>({
    title: '',
    description: '',
    primary_field: '',
    specialization: '',
    instructions: '',
    status: 'draft',
    time_limit_minutes: 30,
  });

  const [questions, setQuestions] = useState<
    EvaluationQuestion[]
  >([]);

  const [loading, setLoading] = useState(
    Boolean(evaluationId)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!evaluationId) return;

    async function load() {
      try {
        const existing =
          await getEvaluation(evaluationId);

        if (!existing) {
          throw new Error(
            'Evaluation not found.'
          );
        }

        const existingQuestions =
          await getEvaluationQuestions(
            evaluationId
          );

        setEvaluation(existing);
        setQuestions(existingQuestions);
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

    load();
  }, [evaluationId]);

  function updateEvaluation(
    field: keyof Evaluation,
    value: string | number
  ) {
    setEvaluation((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addQuestion() {
    if (!evaluation.id) {
      setQuestions((current) => [
        ...current,
        {
          id: `temp-${Date.now()}`,
          evaluation_id: '',
          question_order:
            current.length + 1,
          prompt: '',
          context: null,
          response_type: 'long_text',
          created_at: '',
        },
      ]);
      return;
    }

    setQuestions((current) => [
      ...current,
      {
        id: `temp-${Date.now()}`,
        evaluation_id: evaluation.id,
        question_order:
          current.length + 1,
        prompt: '',
        context: null,
        response_type: 'long_text',
        created_at: '',
      },
    ]);
  }

  function updateQuestion(
    index: number,
    field: keyof EvaluationQuestion,
    value: string
  ) {
    setQuestions((current) => {
      const updated = [...current];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  }

  async function removeQuestion(
    index: number
  ) {
    const question = questions[index];

    try {
      if (
        question.id &&
        !question.id.startsWith('temp-')
      ) {
        await deleteEvaluationQuestion(
          question.id
        );
      }

      setQuestions((current) =>
        current
          .filter((_, i) => i !== index)
          .map((question, i) => ({
            ...question,
            question_order: i + 1,
          }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete question.'
      );
    }
  }

  async function saveEvaluation(
    status?: 'draft' | 'open' | 'closed'
  ) {
    setSaving(true);
    setError('');

    try {
      if (!evaluation.title?.trim()) {
        throw new Error(
          'Evaluation title is required.'
        );
      }

      const saved =
        await upsertEvaluation({
          ...(evaluation.id
            ? { id: evaluation.id }
            : {}),
          title:
            evaluation.title.trim(),
          description:
            evaluation.description ||
            null,
          primary_field:
            evaluation.primary_field ||
            null,
          specialization:
            evaluation.specialization ||
            null,
          instructions:
            evaluation.instructions ||
            null,
          status:
            status ||
            evaluation.status ||
            'draft',
          time_limit_minutes:
            evaluation.time_limit_minutes ||
            null,
        });

      const savedQuestions = [];

      for (
        let i = 0;
        i < questions.length;
        i++
      ) {
        const question = questions[i];

        if (!question.prompt.trim()) {
          continue;
        }

        const savedQuestion =
          await upsertEvaluationQuestion({
            ...(question.id &&
            !question.id.startsWith('temp-')
              ? { id: question.id }
              : {}),
            evaluation_id: saved.id,
            question_order: i + 1,
            prompt:
              question.prompt.trim(),
            context:
              question.context || null,
            response_type:
              question.response_type,
          });

        savedQuestions.push(savedQuestion);
      }

      setEvaluation(saved);
      setQuestions(savedQuestions);

      onSaved?.(saved.id);
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

  if (loading) {
    return (
      <div className="p-8">
        Loading evaluation...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {evaluationId
            ? 'Edit Evaluation'
            : 'Create Evaluation'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Build a domain-expert assessment for IUVAI.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-5 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">
          Evaluation details
        </h2>

        <input
          className="w-full rounded-lg border p-3"
          placeholder="Evaluation title"
          value={evaluation.title || ''}
          onChange={(e) =>
            updateEvaluation(
              'title',
              e.target.value
            )
          }
        />

        <textarea
          className="min-h-24 w-full rounded-lg border p-3"
          placeholder="Description"
          value={evaluation.description || ''}
          onChange={(e) =>
            updateEvaluation(
              'description',
              e.target.value
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="rounded-lg border p-3"
            placeholder="Primary field"
            value={
              evaluation.primary_field || ''
            }
            onChange={(e) =>
              updateEvaluation(
                'primary_field',
                e.target.value
              )
            }
          />

          <input
            className="rounded-lg border p-3"
            placeholder="Specialization"
            value={
              evaluation.specialization ||
              ''
            }
            onChange={(e) =>
              updateEvaluation(
                'specialization',
                e.target.value
              )
            }
          />
        </div>

        <textarea
          className="min-h-32 w-full rounded-lg border p-3"
          placeholder="Instructions for the expert"
          value={
            evaluation.instructions || ''
          }
          onChange={(e) =>
            updateEvaluation(
              'instructions',
              e.target.value
            )
          }
        />

        <input
          type="number"
          min={1}
          className="rounded-lg border p-3"
          placeholder="Time limit (minutes)"
          value={
            evaluation.time_limit_minutes ||
            ''
          }
          onChange={(e) =>
            updateEvaluation(
              'time_limit_minutes',
              Number(e.target.value)
            )
          }
        />
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Questions
            </h2>

            <p className="text-sm text-gray-500">
              Questions are presented to experts
              in this order.
            </p>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            + Add question
          </button>
        </div>

        {questions.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
            No questions yet.
          </div>
        )}

        {questions.map(
          (question, index) => (
            <div
              key={question.id}
              className="space-y-4 rounded-xl border p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Question {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeQuestion(index)
                  }
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>

              <textarea
                className="min-h-28 w-full rounded-lg border p-3"
                placeholder="Question prompt"
                value={question.prompt}
                onChange={(e) =>
                  updateQuestion(
                    index,
                    'prompt',
                    e.target.value
                  )
                }
              />

              <textarea
                className="min-h-20 w-full rounded-lg border p-3"
                placeholder="Optional context"
                value={
                  question.context || ''
                }
                onChange={(e) =>
                  updateQuestion(
                    index,
                    'context',
                    e.target.value
                  )
                }
              />

              <select
                className="rounded-lg border p-3"
                value={
                  question.response_type
                }
                onChange={(e) =>
                  updateQuestion(
                    index,
                    'response_type',
                    e.target.value
                  )
                }
              >
                <option value="text">
                  Short answer
                </option>
                <option value="long_text">
                  Long answer
                </option>
              </select>
            </div>
          )
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-6">
        <button
          disabled={saving}
          onClick={() =>
            saveEvaluation('draft')
          }
          className="rounded-lg border px-5 py-3 font-medium"
        >
          Save draft
        </button>

        <button
          disabled={saving}
          onClick={() =>
            saveEvaluation('open')
          }
          className="rounded-lg bg-black px-5 py-3 font-medium text-white"
        >
          {saving
            ? 'Saving...'
            : 'Save & open'}
        </button>

        {evaluation.id && (
          <button
            disabled={saving}
            onClick={() =>
              saveEvaluation('closed')
            }
            className="rounded-lg border border-red-200 px-5 py-3 font-medium text-red-600"
          >
            Close evaluation
          </button>
        )}
      </div>
    </div>
  );
}

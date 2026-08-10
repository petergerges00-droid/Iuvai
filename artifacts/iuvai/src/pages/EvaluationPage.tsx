import { useEffect, useState } from 'react';
import {
  getEvaluation,
  getEvaluationQuestions,
  getEvaluationSubmission,
  getEvaluationAnswers,
  startEvaluation,
  saveEvaluationAnswer,
  submitEvaluation,
  type Evaluation,
  type EvaluationQuestion,
  type EvaluationAnswer,
  type EvaluationSubmission,
} from '../lib/supabase';

interface Props {
  evaluationId: string;
  expertId: string;
}

export default function EvaluationPage({
  evaluationId,
  expertId,
}: Props) {
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [questions, setQuestions] =
    useState<EvaluationQuestion[]>([]);

  const [submission, setSubmission] =
    useState<EvaluationSubmission | null>(
      null
    );

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    loadEvaluation();
  }, [evaluationId, expertId]);

  async function loadEvaluation() {
    try {
      setLoading(true);
      setError('');

      const [
        evaluationData,
        questionData,
        submissionData,
      ] = await Promise.all([
        getEvaluation(evaluationId),
        getEvaluationQuestions(evaluationId),
        getEvaluationSubmission(
          evaluationId,
          expertId
        ),
      ]);

      if (!evaluationData) {
        throw new Error(
          'Evaluation not found.'
        );
      }

      if (
        evaluationData.status !== 'open' &&
        !submissionData
      ) {
        throw new Error(
          'This evaluation is not currently available.'
        );
      }

      setEvaluation(evaluationData);
      setQuestions(questionData);

      let activeSubmission =
        submissionData;

      if (!activeSubmission) {
        activeSubmission =
          await startEvaluation(
            evaluationId,
            expertId
          );
      }

      setSubmission(activeSubmission);

      if (
        activeSubmission.status ===
        'submitted'
      ) {
        setSubmitted(true);
      }

      const existingAnswers =
        await getEvaluationAnswers(
          activeSubmission.id
        );

      const answerMap: Record<
        string,
        string
      > = {};

      existingAnswers.forEach(
        (answer: EvaluationAnswer) => {
          answerMap[
            answer.question_id
          ] =
            answer.answer_text || '';
        }
      );

      setAnswers(answerMap);
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

  async function handleAnswerChange(
    questionId: string,
    value: string
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));

    if (!submission) return;

    try {
      setSaving(questionId);

      await saveEvaluationAnswer(
        submission.id,
        questionId,
        value
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save answer.'
      );
    } finally {
      setSaving(null);
    }
  }

  async function handleSubmit() {
    if (!submission) return;

    const unanswered =
      questions.filter(
        (question) =>
          !answers[question.id]?.trim()
      );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} question(s) remain.`
      );
      return;
    }

    const confirmed =
      window.confirm(
        'Submit your evaluation? You will not be able to edit your answers afterward.'
      );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError('');

      const result =
        await submitEvaluation(
          submission.id
        );

      setSubmission(result);
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit evaluation.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        Loading evaluation...
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!evaluation || !submission) {
    return null;
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="rounded-2xl border p-8 text-center">
          <div className="mb-4 text-4xl">
            ✓
          </div>

          <h1 className="text-2xl font-semibold">
            Evaluation submitted
          </h1>

          <p className="mt-3 text-gray-500">
            Thank you. Your responses have been
            submitted for review by IUVAI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-semibold">
          {evaluation.title}
        </h1>

        {evaluation.description && (
          <p className="mt-3 text-gray-600">
            {evaluation.description}
          </p>
        )}

        {evaluation.time_limit_minutes && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
            Time limit:{' '}
            {evaluation.time_limit_minutes}{' '}
            minutes
          </div>
        )}
      </header>

      {evaluation.instructions && (
        <section className="rounded-xl border p-5">
          <h2 className="font-semibold">
            Instructions
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {evaluation.instructions}
          </p>
        </section>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {questions.map(
          (question, index) => (
            <section
              key={question.id}
              className="rounded-xl border p-6"
            >
              <div className="mb-4 font-medium">
                {index + 1}.{' '}
                {question.prompt}
              </div>

              {question.context && (
                <div className="mb-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  {question.context}
                </div>
              )}

              {question.response_type ===
              'text' ? (
                <input
                  className="w-full rounded-lg border p-3"
                  value={
                    answers[question.id] ||
                    ''
                  }
                  onChange={(e) =>
                    handleAnswerChange(
                      question.id,
                      e.target.value
                    )
                  }
                  placeholder="Your answer..."
                />
              ) : (
                <textarea
                  className="min-h-40 w-full rounded-lg border p-3"
                  value={
                    answers[question.id] ||
                    ''
                  }
                  onChange={(e) =>
                    handleAnswerChange(
                      question.id,
                      e.target.value
                    )
                  }
                  placeholder="Write your answer..."
                />
              )}

              {saving === question.id && (
                <div className="mt-2 text-xs text-gray-400">
                  Saving...
                </div>
              )}
            </section>
          )
        )}
      </div>

      <div className="flex justify-end border-t pt-6">
        <button
          disabled={
            submitting ||
            questions.length === 0
          }
          onClick={handleSubmit}
          className="rounded-lg bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {submitting
            ? 'Submitting...'
            : 'Submit evaluation'}
        </button>
      </div>
    </div>
  );
}

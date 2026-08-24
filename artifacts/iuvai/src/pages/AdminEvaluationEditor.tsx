import { useEffect, useState } from 'react';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Loader2,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';

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

  const [savingQuestionId, setSavingQuestionId] =
    useState<string | null>(null);

  const [deletingQuestionId, setDeletingQuestionId] =
    useState<string | null>(null);

  const [changingStatus, setChangingStatus] =
    useState(false);

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
      setSavingQuestionId(
        question.id
      );

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
    } finally {
      setSavingQuestionId(null);
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
      setDeletingQuestionId(
        questionId
      );

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
    } finally {
      setDeletingQuestionId(null);
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
      setChangingStatus(true);

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
    } finally {
      setChangingStatus(false);
    }
  }

  function getStatusLabel(
    status: Evaluation['status']
  ) {
    switch (status) {
      case 'open':
        return 'Open';

      case 'closed':
        return 'Closed';

      case 'draft':
      default:
        return 'Draft';
    }
  }

  function getStatusClasses(
    status: Evaluation['status']
  ) {
    switch (status) {
      case 'open':
        return 'border-primary/30 bg-primary/10 text-primary';

      case 'closed':
        return 'border-border bg-muted text-muted-foreground';

      case 'draft':
      default:
        return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-3xl" />

          <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize:
                '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />

            Loading evaluation editor...
          </div>
        </div>
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize:
                '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl border border-destructive/20 bg-card/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Unable to load evaluation
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-6 inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />

                Back to evaluations
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const sortedQuestions =
    [...questions].sort(
      (a, b) =>
        a.question_order -
        b.question_order
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-3xl" />

        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize:
              '48px 48px',
          }}
        />
      </div>

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="relative z-10 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden sm:inline">
                Evaluations
              </span>
            </button>

            <div className="h-4 w-px bg-border" />

            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              ADMIN / EVALUATION
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Secure workspace
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="mb-10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            IUVAI / EVALUATION BUILDER
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {evaluation.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Configure the evaluation, define
                its instructions, and build the
                questions experts will answer.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                  evaluation.status
                )}`}
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />

                {getStatusLabel(
                  evaluation.status
                )}
              </span>

              {evaluation.status !==
                'draft' && (
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      'draft'
                    )
                  }
                  disabled={
                    changingStatus
                  }
                  className="inline-flex items-center rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
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
                  disabled={
                    changingStatus
                  }
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:shadow-primary/20 disabled:opacity-50"
                >
                  {changingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}

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
                  disabled={
                    changingStatus
                  }
                  className="inline-flex items-center rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:border-destructive/30 hover:text-destructive disabled:opacity-50"
                >
                  Close evaluation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            MESSAGES
        ==================================================== */}

        <div className="mb-8 space-y-3">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0" />

              {message}
            </div>
          )}
        </div>

        {/* ===================================================
            EVALUATION DETAILS
        ==================================================== */}

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-primary/[0.03] backdrop-blur-xl">
          <div className="border-b border-border/60 bg-muted/20 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings2 className="h-4 w-4" />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Evaluation details
                </div>

                <div className="text-xs text-muted-foreground">
                  Define what this evaluation
                  measures.
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-7">
              {/* TITLE */}

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
                  className="h-11 w-full rounded-xl border border-border/70 bg-background/60 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  placeholder="e.g. AI Expert Evaluation"
                />
              </div>

              {/* DESCRIPTION */}

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
                  className="min-h-24 w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  placeholder="Briefly describe what this evaluation measures."
                />
              </div>

              {/* FIELD / SPECIALIZATION */}

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
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/60 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
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
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/60 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                    placeholder="e.g. Neurosurgery"
                  />
                </div>
              </div>

              {/* TIME LIMIT */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Time limit
                </label>

                <div className="relative md:max-w-xs">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                    className="h-11 w-full rounded-xl border border-border/70 bg-background/60 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                    placeholder="Minutes"
                  />
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  Leave empty if the evaluation
                  has no time limit.
                </p>
              </div>

              {/* INSTRUCTIONS */}

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
                  className="min-h-32 w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  placeholder="Instructions shown to the expert before starting the evaluation."
                />
              </div>
            </div>

            {/* SAVE */}

            <div className="mt-8 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />

                Changes are saved to IUVAI
              </div>

              <button
                type="button"
                onClick={
                  handleSaveEvaluation
                }
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {saving
                  ? 'Saving...'
                  : 'Save evaluation'}
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            QUESTIONS HEADER
        ==================================================== */}

        <div className="mb-5 mt-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-primary">
              EVALUATION STRUCTURE
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Questions
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Build the questions experts will
              answer.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleAddQuestion
            }
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />

            Add question
          </button>
        </div>

        {/* ===================================================
            EMPTY QUESTIONS
        ==================================================== */}

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
              <FileText className="h-5 w-5" />
            </div>

            <h3 className="font-semibold">
              No questions yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Add questions to build the
              evaluation that experts will
              complete.
            </p>

            <button
              type="button"
              onClick={
                handleAddQuestion
              }
              className="mt-6 inline-flex items-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />

              Add your first question
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedQuestions.map(
              (
                question,
                index
              ) => (
                <section
                  key={
                    question.id
                  }
                  className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-xl shadow-primary/[0.02] backdrop-blur-xl"
                >
                  {/* QUESTION HEADER */}

                  <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-muted/20 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary">
                        {String(
                          index + 1
                        ).padStart(2, '0')}
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          Question{' '}
                          {index + 1}
                        </div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Evaluation item
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteQuestion(
                          question.id
                        )
                      }
                      disabled={
                        deletingQuestionId ===
                        question.id
                      }
                      className="inline-flex items-center self-start rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 sm:self-auto"
                    >
                      {deletingQuestionId ===
                      question.id ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                      )}

                      Delete
                    </button>
                  </div>

                  {/* QUESTION CONTENT */}

                  <div className="p-6 sm:p-8">
                    <div className="space-y-6">
                      {/* PROMPT */}

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
                          className="min-h-28 w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm leading-6 outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                          placeholder="Enter the question..."
                        />
                      </div>

                      {/* CONTEXT */}

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Context

                          <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                            Optional
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
                          className="min-h-24 w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-3 text-sm leading-6 outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                          placeholder="Additional context shown with the question."
                        />
                      </div>

                      {/* SETTINGS */}

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
                            className="h-11 w-full rounded-xl border border-border/70 bg-background/60 px-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Response type
                          </label>

                          <div className="relative">
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
                              className="h-11 w-full appearance-none rounded-xl border border-border/70 bg-background/60 px-4 pr-10 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                            >
                              <option value="long_text">
                                Long text
                              </option>

                              <option value="text">
                                Short text
                              </option>
                            </select>

                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SAVE QUESTION */}

                    <div className="mt-7 flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Item {index + 1} /{' '}
                        {questions.length}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveQuestion(
                            question
                          )
                        }
                        disabled={
                          savingQuestionId ===
                          question.id
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:border-primary/40 hover:text-primary disabled:opacity-50"
                      >
                        {savingQuestionId ===
                        question.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}

                        {savingQuestionId ===
                        question.id
                          ? 'Saving...'
                          : 'Save question'}
                      </button>
                    </div>
                  </div>
                </section>
              )
            )}
          </div>
        )}

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />

            IUVAI administrative workspace
          </div>

          <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
            Evaluations are used to assess
            domain expertise and strengthen
            IUVAI's human intelligence
            infrastructure for AI.
          </p>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';

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

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Loader2,
  Send,
} from 'lucide-react';

interface Props {
  evaluationId: string;
  expertId: string;
}

export default function EvaluationPage({
  evaluationId,
  expertId,
}: Props) {
  const [, setLocation] = useLocation();

  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [questions, setQuestions] =
    useState<EvaluationQuestion[]>([]);

  const [submission, setSubmission] =
    useState<EvaluationSubmission | null>(null);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [saving, setSaving] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState('');

  /*
  ============================================================
  AUTOSAVE TIMERS
  ============================================================
  */

  const saveTimers = useRef<
    Record<
      string,
      ReturnType<typeof setTimeout>
    >
  >({});

  /*
  ============================================================
  LOAD EVALUATION
  ============================================================
  */

  useEffect(() => {
    loadEvaluation();

    return () => {
      Object.values(
        saveTimers.current
      ).forEach(clearTimeout);
    };
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

        getEvaluationQuestions(
          evaluationId
        ),

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
      setSubmission(submissionData);

      /*
      ----------------------------------------------------------
      LOAD EXISTING ANSWERS
      ----------------------------------------------------------
      */

      if (submissionData) {
        const existingAnswers =
          await getEvaluationAnswers(
            submissionData.id
          );

        const answerMap: Record<
          string,
          string
        > = {};

        existingAnswers.forEach(
          (
            answer: EvaluationAnswer
          ) => {
            answerMap[
              answer.question_id
            ] =
              answer.answer_text || '';
          }
        );

        setAnswers(answerMap);
      }
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

  /*
  ============================================================
  START EVALUATION
  ============================================================
  */

  async function handleStartEvaluation() {
    if (submission) {
      return;
    }

    try {
      setStarting(true);
      setError('');

      const newSubmission =
        await startEvaluation(
          evaluationId,
          expertId
        );

      setSubmission(newSubmission);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to start evaluation.'
      );
    } finally {
      setStarting(false);
    }
  }

  /*
  ============================================================
  ANSWER CHANGE
  ============================================================
  */

  function handleAnswerChange(
    questionId: string,
    value: string
  ) {
    if (!submission) {
      return;
    }

    if (
      submission.status !==
      'in_progress'
    ) {
      return;
    }

    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));

    /*
    ----------------------------------------------------------
    CLEAR PREVIOUS TIMER
    ----------------------------------------------------------
    */

    if (
      saveTimers.current[
        questionId
      ]
    ) {
      clearTimeout(
        saveTimers.current[
          questionId
        ]
      );
    }

    /*
    ----------------------------------------------------------
    AUTOSAVE AFTER 600MS
    ----------------------------------------------------------
    */

    saveTimers.current[
      questionId
    ] = setTimeout(async () => {
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
    }, 600);
  }

  /*
  ============================================================
  SUBMIT EVALUATION
  ============================================================
  */

  async function handleSubmit() {
    if (!submission) {
      return;
    }

    if (
      submission.status !==
      'in_progress'
    ) {
      return;
    }

    const unanswered =
      questions.filter(
        (question) =>
          !answers[
            question.id
          ]?.trim()
      );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unanswered.length} question(s) remain.`
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const confirmed =
      window.confirm(
        'Submit your evaluation? You will not be able to edit your answers afterward.'
      );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      /*
      ----------------------------------------------------------
      FLUSH PENDING AUTOSAVES
      ----------------------------------------------------------
      */

      for (const question of questions) {
        const value =
          answers[question.id] || '';

        await saveEvaluationAnswer(
          submission.id,
          question.id,
          value
        );
      }

      /*
      ----------------------------------------------------------
      SUBMIT
      ----------------------------------------------------------
      */

      const result =
        await submitEvaluation(
          submission.id
        );

      setSubmission(result);
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

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground/60">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  FATAL ERROR
  ============================================================
  */

  if (error && !evaluation) {
    return (
      <div className="mx-auto max-w-3xl">

        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">

          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

          <div>
            <p className="text-sm font-medium text-destructive">
              Unable to load assessment
            </p>

            <p className="mt-1 text-sm text-destructive/70">
              {error}
            </p>
          </div>

        </div>

      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  /*
  ============================================================
  CALCULATED STATE
  ============================================================
  */

  const answeredCount =
    questions.filter(
      (question) =>
        answers[
          question.id
        ]?.trim()
    ).length;

  const progress =
    questions.length > 0
      ? Math.round(
          (answeredCount /
            questions.length) *
            100
        )
      : 0;

  /*
  ============================================================
  ALREADY SUBMITTED
  ============================================================
  */

  if (
    submission?.status ===
    'submitted'
  ) {
    return (
      <div className="mx-auto max-w-2xl">

        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/[0.015] p-8 text-center sm:p-12">

          {/* Glow */}

          <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08]">

              <CheckCircle2 className="h-7 w-7 text-emerald-500" />

            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Assessment submitted
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground/65">
              Thank you. Your responses have
              been submitted for review by
              IUVAI.
            </p>

            <div className="mt-6 rounded-xl border border-border/50 bg-background/40 p-4 text-left">

              <div className="flex items-start gap-3">

                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />

                <p className="text-xs leading-5 text-muted-foreground/60">
                  Your submission is now under
                  review. You will be contacted
                  if your expertise is selected
                  for a relevant project.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setLocation(
                  '/evaluations'
                )
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-muted/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to assessments
            </button>

          </div>

        </div>

      </div>
    );
  }

  /*
  ============================================================
  INTRO / START SCREEN
  ============================================================
  */

  if (!submission) {
    return (
      <div className="mx-auto max-w-4xl space-y-7">

        {/* ==================================================
            HEADER
            ================================================== */}

        <header>

          <button
            type="button"
            onClick={() =>
              setLocation(
                '/evaluations'
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to assessments
          </button>

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">

              <h1 className="text-2xl font-semibold tracking-tight">
                {evaluation.title}
              </h1>

              {evaluation.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/65">
                  {evaluation.description}
                </p>
              )}

            </div>

          </div>

        </header>

        {/* ==================================================
            INSTRUCTIONS
            ================================================== */}

        {evaluation.instructions && (
          <section className="rounded-2xl border border-border/60 bg-white/[0.015] p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50">
                <Info className="h-4 w-4 text-primary/70" />
              </div>

              <h2 className="text-sm font-semibold">
                Instructions
              </h2>

            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground/65">
              {evaluation.instructions}
            </p>

          </section>
        )}

        {/* ==================================================
            BEFORE YOU BEGIN
            ================================================== */}

        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-white/[0.015] p-6">

          <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.04] blur-3xl" />

          <div className="relative">

            <h2 className="text-sm font-semibold">
              Before you begin
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-border/50 bg-background/30 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground/50">
                      Questions
                    </p>

                    <p className="mt-0.5 text-sm font-medium">
                      {questions.length}
                    </p>
                  </div>

                </div>

              </div>

              {evaluation.time_limit_minutes && (
                <div className="rounded-xl border border-border/50 bg-background/30 p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground/50">
                        Time limit
                      </p>

                      <p className="mt-0.5 text-sm font-medium">
                        {
                          evaluation.time_limit_minutes
                        }{' '}
                        minutes
                      </p>
                    </div>

                  </div>

                </div>
              )}

              <div className="rounded-xl border border-border/50 bg-background/30 p-4 sm:col-span-2">

                <div className="flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Info className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground/50">
                      Purpose
                    </p>

                    <p className="mt-0.5 text-sm leading-6 text-muted-foreground/70">
                      Your answers should be based
                      on your professional expertise
                      and will be reviewed by IUVAI.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">

            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

            <p className="text-sm text-destructive/80">
              {error}
            </p>

          </div>
        )}

        {/* ==================================================
            START
            ================================================== */}

        <div className="flex justify-end">

          <button
            type="button"
            onClick={
              handleStartEvaluation
            }
            disabled={starting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(99,102,241,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {starting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Start assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}

          </button>

        </div>

      </div>
    );
  }

  /*
  ============================================================
  ACTIVE EVALUATION
  ============================================================
  */

  return (
    <div className="mx-auto max-w-4xl space-y-7">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header>

        <button
          type="button"
          onClick={() =>
            setLocation(
              '/evaluations'
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to assessments
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>

            <div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {evaluation.title}
              </h1>

              {evaluation.description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/65">
                  {evaluation.description}
                </p>
              )}

            </div>

          </div>

          {evaluation.time_limit_minutes && (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5">

              <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />

              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60">
                {
                  evaluation.time_limit_minutes
                }{' '}
                min
              </span>

            </div>
          )}

        </div>

      </header>

      {/* ======================================================
          PROGRESS
          ====================================================== */}

      <div className="rounded-2xl border border-border/60 bg-white/[0.015] p-4">

        <div className="flex items-center justify-between">

          <span className="text-xs font-medium text-muted-foreground/60">
            Assessment progress
          </span>

          <span className="text-xs font-medium text-primary">
            {answeredCount} / {questions.length}
          </span>

        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/40">

          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-2 text-[10px] text-muted-foreground/40">
          {progress}% complete
        </div>

      </div>

      {/* ======================================================
          INSTRUCTIONS
          ====================================================== */}

      {evaluation.instructions && (
        <section className="rounded-2xl border border-border/60 bg-white/[0.015] p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50">
              <Info className="h-4 w-4 text-primary/70" />
            </div>

            <h2 className="text-sm font-semibold">
              Instructions
            </h2>

          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground/65">
            {evaluation.instructions}
          </p>

        </section>
      )}

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">

          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />

          <p className="text-sm text-destructive/80">
            {error}
          </p>

        </div>
      )}

      {/* ======================================================
          QUESTIONS
          ====================================================== */}

      <div className="space-y-5">

        {questions.map(
          (
            question,
            index
          ) => {

            const answer =
              answers[
                question.id
              ] || '';

            const isAnswered =
              answer.trim().length > 0;

            return (
              <section
                key={question.id}
                className={`group relative overflow-hidden rounded-2xl border bg-white/[0.015] p-6 transition-all duration-300 ${
                  isAnswered
                    ? 'border-border/60'
                    : 'border-border/50'
                }`}
              >

                {/* Question accent */}

                <div
                  className={`absolute left-0 top-0 h-full w-[2px] transition-colors ${
                    isAnswered
                      ? 'bg-primary/50'
                      : 'bg-border/40'
                  }`}
                />

                {/* ==================================================
                    QUESTION HEADER
                    ================================================== */}

                <div className="flex items-start gap-4">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/50 text-xs font-semibold text-muted-foreground/60">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <p className="text-sm font-medium leading-6">
                        {question.prompt}
                      </p>

                      {isAnswered && (
                        <span className="flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-emerald-500/80">

                          <CheckCircle2 className="h-3 w-3" />

                          Answered

                        </span>
                      )}

                    </div>

                    {/* ==================================================
                        CONTEXT
                        ================================================== */}

                    {question.context && (
                      <div className="mt-4 whitespace-pre-wrap rounded-xl border border-border/50 bg-background/40 p-4 text-sm leading-6 text-muted-foreground/60">
                        {question.context}
                      </div>
                    )}

                    {/* ==================================================
                        RESPONSE
                        ================================================== */}

                    <div className="mt-5">

                      {question.response_type ===
                      'text' ? (

                        <input
                          type="text"
                          value={answer}
                          onChange={(e) =>
                            handleAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          placeholder="Your answer..."
                          className="w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                        />

                      ) : (

                        <textarea
                          value={answer}
                          onChange={(e) =>
                            handleAnswerChange(
                              question.id,
                              e.target.value
                            )
                          }
                          placeholder="Write your answer..."
                          className="min-h-[180px] w-full resize-y rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm leading-6 outline-none transition-all placeholder:text-muted-foreground/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                        />

                      )}

                    </div>

                    {/* ==================================================
                        SAVING
                        ================================================== */}

                    {saving ===
                      question.id && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/40">

                        <Loader2 className="h-3 w-3 animate-spin" />

                        Saving...

                      </div>
                    )}

                  </div>

                </div>

              </section>
            );
          }
        )}

      </div>

      {/* ======================================================
          SUBMISSION FOOTER
          ====================================================== */}

      <div className="sticky bottom-4 z-10">

        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-xl shadow-black/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="h-1.5 w-1.5 rounded-full bg-primary" />

              <p className="text-xs font-medium">
                {answeredCount} of{' '}
                {questions.length}{' '}
                answered
              </p>

            </div>

            <p className="mt-1 text-[10px] text-muted-foreground/40">
              All questions must be answered
              before submission.
            </p>

          </div>

          <button
            type="button"
            disabled={
              submitting ||
              questions.length === 0
            }
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(99,102,241,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
          >

            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit assessment
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  Briefcase,
  Check,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  User,
  UserPlus,
  X,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getAdminProject,
  getExpertWithProfile,
  getProjectAssignments,
  assignExpertToProject,
  removeExpertFromProject,
  getResumeUrl,
  Project,
  ExpertWithProfile,
  ProjectExpert,
} from '@/lib/supabase';

export default function AdminExpertReview() {
  const [, setLocation] = useLocation();

  const params = useParams<{
    projectId: string;
    expertId: string;
  }>();

  const projectId = params.projectId;
  const expertId = params.expertId;

  const [project, setProject] = useState<Project | null>(null);
  const [expert, setExpert] =
    useState<ExpertWithProfile | null>(null);

  const [assignments, setAssignments] =
    useState<ProjectExpert[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isOpeningResume, setIsOpeningResume] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [success, setSuccess] = useState<string | null>(
    null
  );

  /*
   * ============================================================
   * LOAD PROJECT + EXPERT
   * ============================================================
   */

  useEffect(() => {
    async function loadReview() {
      try {
        setIsLoading(true);
        setError(null);

        if (!projectId || !expertId) {
          throw new Error(
            'Missing project or expert ID.'
          );
        }

        const [
          projectData,
          expertData,
          assignmentData,
        ] = await Promise.all([
          getAdminProject(projectId),
          getExpertWithProfile(expertId),
          getProjectAssignments(projectId),
        ]);

        if (!projectData) {
          throw new Error(
            'Project could not be found.'
          );
        }

        if (!expertData) {
          throw new Error(
            'Expert could not be found.'
          );
        }

        setProject(projectData);
        setExpert(expertData);
        setAssignments(assignmentData);
      } catch (err) {
        console.error(
          'ADMIN EXPERT REVIEW LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load expert review.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadReview();
  }, [projectId, expertId]);

  /*
   * ============================================================
   * CURRENT ASSIGNMENT
   * ============================================================
   */

  const currentAssignment = useMemo(() => {
    return assignments.find(
      (assignment) =>
        assignment.expert_id === expertId
    );
  }, [assignments, expertId]);

  const isAssigned = Boolean(currentAssignment);

  /*
   * ============================================================
   * MATCH ANALYSIS
   * ============================================================
   */

  const matchAnalysis = useMemo(() => {
    if (!project || !expert) {
      return {
        field: false,
        specialization: false,
        skillsMatched: 0,
        totalSkills: 0,
        aiExperience: false,
        score: 0,
      };
    }

    const projectField =
      project.primary_field
        ?.trim()
        .toLowerCase();

    const expertField =
      expert.primary_field
        ?.trim()
        .toLowerCase();

    const projectSpecialization =
      project.specialization
        ?.trim()
        .toLowerCase();

    const expertSpecialization =
      expert.specialization
        ?.trim()
        .toLowerCase();

    const fieldMatch =
      Boolean(
        projectField &&
          expertField &&
          (
            expertField.includes(projectField) ||
            projectField.includes(expertField)
          )
      );

    const specializationMatch =
      Boolean(
        projectSpecialization &&
          expertSpecialization &&
          (
            expertSpecialization.includes(
              projectSpecialization
            ) ||
            projectSpecialization.includes(
              expertSpecialization
            )
          )
      );

    const requiredSkills =
      project.required_skills || [];

    const expertSkills = (
      expert.skills || []
    ).map((skill) =>
      skill.trim().toLowerCase()
    );

    const matchedSkills =
      requiredSkills.filter((requiredSkill) => {
        const normalizedRequired =
          requiredSkill.trim().toLowerCase();

        return expertSkills.some(
          (expertSkill) =>
            expertSkill.includes(
              normalizedRequired
            ) ||
            normalizedRequired.includes(
              expertSkill
            )
        );
      });

    const aiExperience =
      Boolean(
        expert.previous_ai_experience?.trim()
      );

    /*
     * Simple initial scoring model.
     *
     * Field: 30%
     * Specialization: 30%
     * Skills: 25%
     * AI experience: 15%
     */

    let score = 0;

    if (fieldMatch) {
      score += 30;
    }

    if (specializationMatch) {
      score += 30;
    }

    if (requiredSkills.length > 0) {
      score += Math.round(
        (matchedSkills.length /
          requiredSkills.length) *
          25
      );
    }

    if (aiExperience) {
      score += 15;
    }

    return {
      field: fieldMatch,
      specialization: specializationMatch,
      skillsMatched:
        matchedSkills.length,
      totalSkills:
        requiredSkills.length,
      aiExperience,
      score,
    };
  }, [project, expert]);

  /*
   * ============================================================
   * ASSIGN EXPERT
   * ============================================================
   */

  async function handleAssign() {
    if (!projectId || !expertId) {
      return;
    }

    try {
      setIsAssigning(true);
      setError(null);
      setSuccess(null);

      const assignment =
        await assignExpertToProject(
          projectId,
          expertId
        );

      setAssignments((current) => [
        assignment,
        ...current,
      ]);

      setSuccess(
        'Expert successfully assigned to this project.'
      );
    } catch (err) {
      console.error(
        'ASSIGN EXPERT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to assign expert.'
      );
    } finally {
      setIsAssigning(false);
    }
  }

  /*
   * ============================================================
   * REMOVE EXPERT
   * ============================================================
   */

  async function handleRemove() {
    if (!projectId || !expertId) {
      return;
    }

    const confirmed = window.confirm(
      'Remove this expert from the project?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);
      setSuccess(null);

      await removeExpertFromProject(
        projectId,
        expertId
      );

      setAssignments((current) =>
        current.filter(
          (assignment) =>
            assignment.expert_id !== expertId
        )
      );

      setSuccess(
        'Expert removed from this project.'
      );
    } catch (err) {
      console.error(
        'REMOVE EXPERT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to remove expert.'
      );
    } finally {
      setIsRemoving(false);
    }
  }

  /*
   * ============================================================
   * VIEW RESUME
   * ============================================================
   */

  async function handleViewResume() {
    if (!expert?.resume_path) {
      return;
    }

    try {
      setIsOpeningResume(true);
      setError(null);

      const url = await getResumeUrl(
        expert.resume_path
      );

      window.open(
        url,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (err) {
      console.error(
        'RESUME OPEN ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to open resume.'
      );
    } finally {
      setIsOpeningResume(false);
    }
  }

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  function goBack() {
    setLocation(
      `/admin/projects/${projectId}/experts`
    );
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (isLoading) {
    return (
      <AppLayout title="Expert Review">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  /*
   * ============================================================
   * ERROR / MISSING DATA
   * ============================================================
   */

  if (error && (!project || !expert)) {
    return (
      <AppLayout title="Expert Review">
        <div className="space-y-6">

          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to matching
          </button>

          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>

        </div>
      </AppLayout>
    );
  }

  if (!project || !expert) {
    return null;
  }

  return (
    <AppLayout title="Expert Review">

      <div className="space-y-8">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div>

          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to matching
          </button>

          <div className="mt-6 flex items-start gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                IUVAI / Expert Review
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Review Expert
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review this expert before assigning them to the project.
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================
            NOTIFICATIONS
            ====================================================== */}

        {(error || success) && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              error
                ? 'border-destructive/30 bg-destructive/5 text-destructive'
                : 'border-primary/20 bg-primary/5 text-primary'
            }`}
          >
            {error || success}
          </div>
        )}

        {/* ======================================================
            EXPERT HEADER CARD
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
                <User className="h-7 w-7 text-muted-foreground" />
              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  {expert.profile?.full_name ||
                    'Unnamed expert'}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {expert.primary_field ||
                    'Field not specified'}

                  {expert.specialization
                    ? ` · ${expert.specialization}`
                    : ''}
                </p>

                {expert.profile?.country && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {expert.profile.country}
                  </div>
                )}

              </div>

            </div>

            {/* Match score */}

            <div className="shrink-0 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 text-center">

              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
                Match
              </p>

              <p className="mt-1 text-3xl font-semibold text-primary">
                {matchAnalysis.score}%
              </p>

            </div>

          </div>

        </div>

        {/* ======================================================
            PROJECT CONTEXT
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Project
              </h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Expert is being reviewed for this project.
            </p>

          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">

            <div>
              <p className="text-xs text-muted-foreground">
                Project
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.title}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Project type
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.project_type ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Field
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.primary_field ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Specialization
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.specialization ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Budget
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.budget ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Duration
              </p>

              <p className="mt-1 text-sm font-medium">
                {project.duration ||
                  'Not specified'}
              </p>
            </div>

          </div>

          {project.description && (
            <div className="border-t border-border/60 p-5">

              <p className="text-xs text-muted-foreground">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {project.description}
              </p>

            </div>
          )}

        </div>

        {/* ======================================================
            PROFESSIONAL PROFILE
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Professional profile
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Background and professional information.
            </p>

          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs text-muted-foreground">
                Primary field
              </p>

              <p className="mt-1 text-sm font-medium">
                {expert.primary_field ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Specialization
              </p>

              <p className="mt-1 text-sm font-medium">
                {expert.specialization ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Experience
              </p>

              <p className="mt-1 text-sm font-medium">
                {expert.years_experience != null
                  ? `${expert.years_experience} years`
                  : 'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Highest qualification
              </p>

              <p className="mt-1 text-sm font-medium">
                {expert.highest_qualification ||
                  'Not specified'}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Availability
              </p>

              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />

                {expert.availability_hours != null
                  ? `${expert.availability_hours} hrs/week`
                  : 'Not specified'}
              </p>
            </div>

          </div>

        </div>

        {/* ======================================================
            SKILLS + LANGUAGES
            ====================================================== */}

        <div className="grid gap-6 md:grid-cols-2">

          {/* Skills */}

          <div className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">
              <h3 className="font-medium">
                Skills
              </h3>
            </div>

            <div className="p-5">

              {expert.skills &&
              expert.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">

                  {expert.skills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills listed.
                </p>
              )}

            </div>

          </div>

          {/* Languages */}

          <div className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">
              <h3 className="font-medium">
                Languages
              </h3>
            </div>

            <div className="p-5">

              {expert.languages &&
              expert.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">

                  {expert.languages.map(
                    (language) => (
                      <span
                        key={language}
                        className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {language}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No languages listed.
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ======================================================
            AI EXPERIENCE
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Previous AI experience
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Relevant experience working with AI, evaluation, annotation, or related projects.
            </p>

          </div>

          <div className="p-5">

            {expert.previous_ai_experience ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {expert.previous_ai_experience}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No previous AI experience provided.
              </p>
            )}

          </div>

        </div>

        {/* ======================================================
            RESUME
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Resume
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Review the expert's submitted CV.
            </p>

          </div>

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            {expert.resume_path ? (

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-muted/40">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {expert.resume_file_name ||
                      'Expert resume'}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Private document
                  </p>
                </div>

              </div>

            ) : (

              <p className="text-sm text-muted-foreground">
                No resume uploaded.
              </p>

            )}

            {expert.resume_path && (
              <button
                type="button"
                onClick={handleViewResume}
                disabled={isOpeningResume}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >

                {isOpeningResume ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}

                {isOpeningResume
                  ? 'Opening...'
                  : 'View resume'}

              </button>
            )}

          </div>

        </div>

        {/* ======================================================
            MATCH ANALYSIS
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Project match
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Initial matching analysis based on the project's requirements.
            </p>

          </div>

          <div className="space-y-4 p-5">

            {/* Field */}

            <MatchRow
              label="Primary field"
              matched={matchAnalysis.field}
              detail={
                matchAnalysis.field
                  ? 'Strong field match'
                  : 'Field does not clearly match'
              }
            />

            {/* Specialization */}

            <MatchRow
              label="Specialization"
              matched={
                matchAnalysis.specialization
              }
              detail={
                matchAnalysis.specialization
                  ? 'Strong specialization match'
                  : 'Specialization does not clearly match'
              }
            />

            {/* Skills */}

            <MatchRow
              label="Required skills"
              matched={
                matchAnalysis.totalSkills === 0 ||
                matchAnalysis.skillsMatched > 0
              }
              detail={
                matchAnalysis.totalSkills === 0
                  ? 'No specific skills required'
                  : `${matchAnalysis.skillsMatched} of ${matchAnalysis.totalSkills} required skills matched`
              }
            />

            {/* AI experience */}

            <MatchRow
              label="AI experience"
              matched={
                matchAnalysis.aiExperience
              }
              detail={
                matchAnalysis.aiExperience
                  ? 'AI experience provided'
                  : 'No previous AI experience provided'
              }
            />

          </div>

        </div>

        {/* ======================================================
            ASSIGNMENT
            ====================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Project assignment
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Control this expert's assignment to the project.
            </p>

          </div>

          <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">

            <div>

              {isAssigned ? (

                <>
                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>

                    <p className="text-sm font-medium">
                      Assigned to this project
                    </p>

                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Status:{' '}
                    {currentAssignment?.status.replace(
                      '_',
                      ' '
                    )}
                  </p>
                </>

              ) : (

                <>
                  <p className="text-sm font-medium">
                    Expert is not assigned
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Assign this expert if they are suitable for the project.
                  </p>
                </>

              )}

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              {isAssigned ? (

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
                >

                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}

                  {isRemoving
                    ? 'Removing...'
                    : 'Remove expert'}

                </button>

              ) : (

                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={isAssigning}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >

                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}

                  {isAssigning
                    ? 'Assigning...'
                    : 'Assign expert'}

                </button>

              )}

            </div>

          </div>

        </div>

      </div>

    </AppLayout>
  );
}

/*
 * ============================================================
 * MATCH ROW
 * ============================================================
 */

function MatchRow({
  label,
  matched,
  detail,
}: {
  label: string;
  matched: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-background/40 p-4">

      <div className="min-w-0">

        <p className="text-sm font-medium">
          {label}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {detail}
        </p>

      </div>

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          matched
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {matched ? (
          <Check className="h-4 w-4" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </div>

    </div>
  );
}

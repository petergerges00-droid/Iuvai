import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import {
  ArrowLeft,
  Briefcase,
  Check,
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

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /*
   * ============================================================
   * LOAD REVIEW
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

    const normalize = (value: string | null) =>
      value?.trim().toLowerCase() || '';

    const projectField =
      normalize(project.primary_field);

    const expertField =
      normalize(expert.primary_field);

    const projectSpecialization =
      normalize(project.specialization);

    const expertSpecialization =
      normalize(expert.specialization);

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
     * Preliminary matching score.
     *
     * This is NOT the final hiring decision.
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
        'Expert approved and assigned to this project.'
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
   * REMOVE / REJECT
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
   * ERROR
   * ============================================================
   */

  if (error && (!project || !expert)) {
    return (
      <AppLayout title="Expert Review">
        <div className="space-y-6">

          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
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
                Review this expert before approving them for the project.
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
            EXPERT HEADER
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
                Preliminary match
              </p>

              <p className="mt-1 text-3xl font-semibold text-primary">
                {matchAnalysis.score}%
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground">
                Automated assessment
              </p>

            </div>

          </div>

        </div>

        {/* ======================================================
            PROJECT CONTEXT
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Project context
              </h3>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              The project this expert is being evaluated for.
            </p>

          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">

            <InfoItem
              label="Project"
              value={project.title}
            />

            <InfoItem
              label="Project type"
              value={
                project.project_type ||
                'Not specified'
              }
            />

            <InfoItem
              label="Field"
              value={
                project.primary_field ||
                'Not specified'
              }
            />

            <InfoItem
              label="Specialization"
              value={
                project.specialization ||
                'Not specified'
              }
            />

            <InfoItem
              label="Budget"
              value={
                project.budget ||
                'Not specified'
              }
            />

            <InfoItem
              label="Duration"
              value={
                project.duration ||
                'Not specified'
              }
            />

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

        </section>

        {/* ======================================================
            PROFESSIONAL PROFILE
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Professional profile
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Professional background submitted by the expert.
            </p>

          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

            <InfoItem
              label="Primary field"
              value={
                expert.primary_field ||
                'Not specified'
              }
            />

            <InfoItem
              label="Specialization"
              value={
                expert.specialization ||
                'Not specified'
              }
            />

            <InfoItem
              label="Experience"
              value={
                expert.years_experience != null
                  ? `${expert.years_experience} years`
                  : 'Not specified'
              }
            />

            <InfoItem
              label="Highest qualification"
              value={
                expert.highest_qualification ||
                'Not specified'
              }
            />

            <InfoItem
              label="Availability"
              value={
                expert.availability_hours != null
                  ? `${expert.availability_hours} hrs/week`
                  : 'Not specified'
              }
            />

          </div>

        </section>

        {/* ======================================================
            SKILLS + LANGUAGES
            ====================================================== */}

        <div className="grid gap-6 md:grid-cols-2">

          <section className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">
              <h3 className="font-medium">
                Skills
              </h3>
            </div>

            <div className="p-5">

              {expert.skills &&
              expert.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">

                  {expert.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}

                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills listed.
                </p>
              )}

            </div>

          </section>

          <section className="rounded-2xl border border-border/60 bg-card/70">

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

          </section>

        </div>

        {/* ======================================================
            AI EXPERIENCE
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Previous AI experience
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Experience with AI evaluation, annotation, training,
              data work, or related projects.
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

        </section>

        {/* ======================================================
            RESUME
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Resume
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Review the expert's submitted CV before approval.
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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
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

        </section>

        {/* ======================================================
            MATCH ANALYSIS
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Project match
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Automated preliminary assessment. Final approval remains
              an IUVAI administrative decision.
            </p>

          </div>

          <div className="space-y-3 p-5">

            <MatchRow
              label="Primary field"
              matched={matchAnalysis.field}
              detail={
                matchAnalysis.field
                  ? "The expert's field appears compatible with the project."
                  : 'No clear primary-field match was detected.'
              }
            />

            <MatchRow
              label="Specialization"
              matched={
                matchAnalysis.specialization
              }
              detail={
                matchAnalysis.specialization
                  ? 'Specialization appears compatible.'
                  : 'No clear specialization match.'
              }
            />

            <MatchRow
              label="Required skills"
              matched={
                matchAnalysis.totalSkills === 0 ||
                matchAnalysis.skillsMatched > 0
              }
              detail={
                matchAnalysis.totalSkills === 0
                  ? 'No specific skills required.'
                  : `${matchAnalysis.skillsMatched} of ${matchAnalysis.totalSkills} required skills matched.`
              }
            />

            <MatchRow
              label="AI experience"
              matched={
                matchAnalysis.aiExperience
              }
              detail={
                matchAnalysis.aiExperience
                  ? 'AI experience provided.'
                  : 'No previous AI experience provided.'
              }
            />

          </div>

        </section>

        {/* ======================================================
            DECISION / ASSIGNMENT
            ====================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Review decision
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Approve the expert for this project or remove them
              from consideration.
            </p>

          </div>

          <div className="p-5">

            {isAssigned ? (

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-4 w-4 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Expert approved
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      This expert is currently assigned to this project.
                    </p>

                    <p className="mt-2 text-xs text-muted-foreground">
                      Assignment status:{' '}
                      <span className="font-medium text-foreground">
                        {currentAssignment?.status.replace(
                          '_',
                          ' '
                        )}
                      </span>
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-destructive/30 px-4 text-sm font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}

                  {isRemoving
                    ? 'Removing...'
                    : 'Remove from project'}
                </button>

              </div>

            ) : (

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-medium">
                    Awaiting review decision
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Review the profile, resume, experience,
                    and match analysis before assigning.
                  </p>

                </div>

                <div className="flex flex-col gap-2 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 px-4 text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}

                    Decline
                  </button>

                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={isAssigning}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {isAssigning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}

                    {isAssigning
                      ? 'Approving...'
                      : 'Approve & assign'}
                  </button>

                </div>

              </div>

            )}

          </div>

        </section>

      </div>

    </AppLayout>
  );
}

/*
 * ============================================================
 * INFO ITEM
 * ============================================================
 */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
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

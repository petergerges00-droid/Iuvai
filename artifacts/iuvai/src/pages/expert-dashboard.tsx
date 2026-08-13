import {
  useEffect,
  useMemo,
  useState,
  ChangeEvent,
} from 'react';

import { useAuth } from '@/hooks/use-auth';

import {
  getExpertProfile,
  ExpertProfile,
  uploadResume,
  getAllProjects,
  getExpertProjectRequests,
  getExpertAssignments,
  getExpertProjects,
  getExpertProjectRequestForProject,
  createProjectRequest,
  Project,
  ProjectRequest,
  ProjectExpert,
} from '@/lib/supabase';

import { AppLayout } from '@/components/layout/app-layout';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  Upload,
  ShieldCheck,
  Activity,
  Sparkles,
  UserRound,
  Clock3,
  XCircle,
  Send,
  Layers3,
  Target,
} from 'lucide-react';

export default function ExpertDashboard() {
  const { user, profile } = useAuth();

  const [expertProfile, setExpertProfile] =
    useState<ExpertProfile | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [requests, setRequests] =
    useState<ProjectRequest[]>([]);

  const [assignments, setAssignments] =
    useState<ProjectExpert[]>([]);

  const [assignedProjects, setAssignedProjects] =
    useState<Project[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const [actionProjectId, setActionProjectId] =
    useState<string | null>(null);

  const [projectError, setProjectError] =
    useState<string | null>(null);

  /*
  ============================================================
  LOAD DASHBOARD
  ============================================================
  */

  const loadDashboard = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setProjectError(null);

      const [
        profileData,
        allProjects,
        expertRequests,
        expertAssignments,
        expertAssignedProjects,
      ] = await Promise.all([
        getExpertProfile(user.id),
        getAllProjects(),
        getExpertProjectRequests(user.id),
        getExpertAssignments(user.id),
        getExpertProjects(user.id),
      ]);

      setExpertProfile(profileData);
      setProjects(allProjects);
      setRequests(expertRequests);
      setAssignments(expertAssignments);
      setAssignedProjects(
        expertAssignedProjects
      );
    } catch (error) {
      console.error(
        'EXPERT DASHBOARD LOAD ERROR:',
        error
      );

      setProjectError(
        error instanceof Error
          ? error.message
          : 'Failed to load dashboard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.id]);

  /*
  ============================================================
  RESUME UPLOAD
  ============================================================
  */

  const handleResumeUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !user?.id) return;

    setUploadError(null);

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = [
      '.pdf',
      '.doc',
      '.docx',
    ];

    const fileName =
      file.name.toLowerCase();

    const validType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(extension)
      );

    if (!validType) {
      setUploadError(
        'Please upload a PDF, DOC, or DOCX file.'
      );

      event.target.value = '';

      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setUploadError(
        'Resume must be smaller than 10 MB.'
      );

      event.target.value = '';

      return;
    }

    setIsUploading(true);

    try {
      await uploadResume(
        user.id,
        file
      );

      const updatedProfile =
        await getExpertProfile(
          user.id
        );

      setExpertProfile(
        updatedProfile
      );
    } catch (error: any) {
      console.error(
        'RESUME UPLOAD ERROR:',
        error
      );

      setUploadError(
        error?.message ||
          'Failed to upload resume.'
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  /*
  ============================================================
  APPLY TO PROJECT
  ============================================================
  */

  const handleApply = async (
    project: Project
  ) => {
    if (!user?.id) return;

    /*
    ------------------------------------------------------------
    VERIFICATION GATE
    ------------------------------------------------------------

    Experts must be officially approved before they can
    apply to projects.
    ------------------------------------------------------------
    */

    if (
      expertProfile?.verification_status !==
      'approved'
    ) {
      setProjectError(
        'Your expert account must be verified before you can apply to projects.'
      );

      return;
    }

    try {
      setActionProjectId(
        project.id
      );

      setProjectError(null);

      const existing =
        await getExpertProjectRequestForProject(
          user.id,
          project.id
        );

      if (existing) {
        setRequests((current) => {
          const exists =
            current.some(
              (item) =>
                item.id ===
                existing.id
            );

          return exists
            ? current
            : [
                existing,
                ...current,
              ];
        });

        return;
      }

      const request =
        await createProjectRequest({
          project_id:
            project.id,

          expert_id:
            user.id,

          company_id:
            project.company_id,

          message:
            'Expert application submitted through the IUVAI expert dashboard.',

          status: 'pending',
        });

      setRequests((current) => [
        request,
        ...current,
      ]);
    } catch (error) {
      console.error(
        'APPLY TO PROJECT ERROR:',
        error
      );

      setProjectError(
        error instanceof Error
          ? error.message
          : 'Failed to apply to project.'
      );
    } finally {
      setActionProjectId(null);
    }
  };

  /*
  ============================================================
  PROFILE COMPLETION
  ============================================================
  */

  const profileCompletion =
    useMemo(() => {
      if (!expertProfile) {
        return 0;
      }

      const checks = [
        Boolean(
          expertProfile.primary_field
        ),
        Boolean(
          expertProfile.specialization
        ),
        Boolean(
          expertProfile.years_experience
        ),
        Boolean(
          expertProfile.highest_qualification
        ),
        Boolean(
          expertProfile.skills?.length
        ),
        Boolean(
          expertProfile.languages?.length
        ),
        Boolean(
          expertProfile.previous_ai_experience
        ),
        Boolean(
          expertProfile.availability_hours
        ),
        Boolean(
          expertProfile.resume_file_name
        ),
      ];

      const completed =
        checks.filter(Boolean)
          .length;

      return Math.round(
        (completed /
          checks.length) *
          100
      );
    }, [expertProfile]);

  /*
  ============================================================
  PROJECT MATCHING
  ============================================================
  */

  const availableProjects =
    useMemo(() => {
      if (!expertProfile) {
        return [];
      }

      /*
      ----------------------------------------------------------
      VERIFICATION GATE
      ----------------------------------------------------------

      Only officially approved experts can see available
      projects.
      ----------------------------------------------------------
      */

      if (
        expertProfile.verification_status !==
        'approved'
      ) {
        return [];
      }

      const appliedProjectIds =
        new Set(
          requests.map(
            (request) =>
              request.project_id
          )
        );

      const assignedProjectIds =
        new Set(
          assignments.map(
            (assignment) =>
              assignment.project_id
          )
        );

      const field =
        expertProfile.primary_field
          ?.toLowerCase()
          .trim();

      const specialization =
        expertProfile.specialization
          ?.toLowerCase()
          .trim();

      return projects
        .filter(
          (project) =>
            project.status ===
            'open'
        )
        .filter(
          (project) =>
            !appliedProjectIds.has(
              project.id
            )
        )
        .filter(
          (project) =>
            !assignedProjectIds.has(
              project.id
            )
        )
        .filter(
          (project) => {
            /*
            ----------------------------------------------------
            If no field is specified, show all open projects.
            ----------------------------------------------------
            */

            if (!field) {
              return true;
            }

            const projectField =
              project.primary_field
                ?.toLowerCase()
                .trim();

            const projectSpecialization =
              project.specialization
                ?.toLowerCase()
                .trim();

            const fieldMatches =
              Boolean(
                projectField &&
                  (
                    projectField.includes(
                      field
                    ) ||
                    field.includes(
                      projectField
                    )
                  )
              );

            const specializationMatches =
              Boolean(
                specialization &&
                  projectSpecialization &&
                  (
                    projectSpecialization.includes(
                      specialization
                    ) ||
                    specialization.includes(
                      projectSpecialization
                    )
                  )
              );

            return (
              fieldMatches ||
              specializationMatches
            );
          }
        );
    }, [
      projects,
      requests,
      assignments,
      expertProfile,
    ]);

  /*
  ============================================================
  APPLICATION STATUS
  ============================================================
  */

  const requestForProject =
    (
      projectId: string
    ) =>
      requests.find(
        (request) =>
          request.project_id ===
          projectId
      );

  /*
  ============================================================
  INITIALIZATION
  ============================================================
  */

  if (!profile || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">

          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">

            <Activity className="h-5 w-5 animate-pulse text-primary" />

          </div>

          <p className="text-sm text-muted-foreground">
            Loading your workspace...
          </p>

        </div>
      </div>
    );
  }

  if (!expertProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">

        <div className="text-center">

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">

            <UserRound className="h-5 w-5 text-muted-foreground" />

          </div>

          <h1 className="text-xl font-semibold">
            Expert profile not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your expert profile could not be loaded.
          </p>

        </div>

      </div>
    );
  }

  /*
  ============================================================
  STATUS HELPERS
  ============================================================
  */

  const verificationStatus =
    expertProfile.verification_status ||
    'pending';

  const isApproved =
    verificationStatus ===
    'approved';

  const isDeclined =
    verificationStatus ===
    'declined';

  const isPending =
    verificationStatus ===
    'pending';

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Overview">

      <div className="space-y-6">

        {/* ==================================================
            HERO
            ================================================== */}

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06]">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize:
                '32px 32px',
            }}
          />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">

              <div className="max-w-2xl">

                <div className="mb-5 flex flex-wrap items-center gap-2">

                  {/* VERIFICATION STATUS */}

                  {isPending && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-500"
                    >
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Verification pending
                    </Badge>
                  )}

                  {isApproved && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Verified expert
                    </Badge>
                  )}

                  {isDeclined && (
                    <Badge
                      variant="outline"
                      className="border-destructive/30 bg-destructive/10 text-destructive"
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      Verification declined
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    EXPERT
                  </Badge>

                </div>

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Expert workspace
                </p>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">

                  Welcome,{' '}

                  <span className="text-primary">
                    {profile.full_name}
                  </span>

                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">

                  {isApproved
                    ? 'Your expert account is verified. Browse projects matched to your expertise and apply to opportunities that interest you.'
                    : isDeclined
                    ? 'Your expert application was not approved at this time. Please review your profile information before contacting IUVAI.'
                    : 'Your expert profile is currently being reviewed. Complete your evaluation and keep your professional information up to date while verification is pending.'}

                </p>

              </div>

              <div className="hidden sm:block">

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">

                  <ShieldCheck className="h-7 w-7 text-primary" />

                  <div className="absolute inset-0 rounded-2xl border border-primary/10" />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ==================================================
            STATUS STRIP
            ================================================== */}

        <div className="grid gap-3 sm:grid-cols-3">

          {/* VERIFICATION */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">

                <Activity className="h-4 w-4 text-amber-500" />

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Verification
                </p>

                <p className="mt-0.5 text-sm font-medium capitalize">
                  {verificationStatus}
                </p>

              </div>

            </div>

          </div>

          {/* PROJECTS */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">

                <Briefcase className="h-4 w-4 text-primary" />

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Projects
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {isApproved
                    ? availableProjects.length
                    : 'Locked'}
                </p>

              </div>

            </div>

          </div>

          {/* PROFILE */}

          <div className="rounded-xl border border-border/60 bg-card/50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">

                <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              </div>

              <div>

                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Profile
                </p>

                <p className="mt-0.5 text-sm font-medium">
                  {profileCompletion}%
                  {' '}complete
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================
            VERIFICATION MESSAGE
            ================================================== */}

        {isPending && (
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">

                <Clock3 className="h-5 w-5 text-amber-500" />

              </div>

              <div>

                <h3 className="font-semibold">
                  Verification in progress
                </h3>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Our team is reviewing your credentials.
                  Complete your evaluation if you have not
                  already done so. Project applications will
                  become available once your expert account
                  has been approved.
                </p>

              </div>

            </div>

          </section>
        )}

        {isDeclined && (
          <section className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">

                <XCircle className="h-5 w-5 text-destructive" />

              </div>

              <div>

                <h3 className="font-semibold">
                  Verification was declined
                </h3>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Your account is currently not eligible
                  for project applications.
                </p>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            PROJECT BOARD
            ================================================== */}

        {isApproved && (
          <section className="rounded-2xl border border-border/60 bg-card/40">

            <div className="border-b border-border/60 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <Layers3 className="h-5 w-5 text-primary" />

                    <h3 className="font-semibold">
                      Project board
                    </h3>

                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Opportunities matched to your expertise.
                  </p>

                </div>

                <Badge
                  variant="outline"
                  className="w-fit border-primary/20 bg-primary/5 text-primary"
                >
                  {availableProjects.length}
                  {' '}available
                </Badge>

              </div>

            </div>

            <div className="p-6">

              {projectError && (
                <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">

                  <p className="text-sm text-destructive">
                    {projectError}
                  </p>

                </div>
              )}

              {availableProjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">

                  <Target className="mx-auto h-8 w-8 text-muted-foreground/40" />

                  <p className="mt-3 text-sm font-medium">
                    No matching projects yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    New opportunities matching your expertise will appear here.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {availableProjects.map(
                    (project) => {

                      const existingRequest =
                        requestForProject(
                          project.id
                        );

                      return (
                        <div
                          key={project.id}
                          className="rounded-xl border border-border/60 bg-card/30 p-5 transition-colors hover:border-primary/30"
                        >

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <h4 className="text-base font-semibold">
                                  {project.title}
                                </h4>

                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                                >
                                  OPEN
                                </Badge>

                              </div>

                              <p className="mt-2 text-sm text-muted-foreground">

                                {project.primary_field ||
                                  'Field not specified'}

                                {project.specialization
                                  ? ` · ${project.specialization}`
                                  : ''}

                              </p>

                              {project.description && (
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                  {project.description}
                                </p>
                              )}

                              <div className="mt-4 flex flex-wrap gap-2">

                                {project.required_skills?.map(
                                  (skill) => (
                                    <Badge
                                      key={skill}
                                      variant="outline"
                                      className="font-normal text-[10px]"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}

                              </div>

                              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">

                                {project.project_type && (
                                  <span>
                                    Type:{' '}
                                    <span className="font-medium text-foreground">
                                      {project.project_type}
                                    </span>
                                  </span>
                                )}

                                {project.budget && (
                                  <span>
                                    Budget:{' '}
                                    <span className="font-medium text-foreground">
                                      {project.budget}
                                    </span>
                                  </span>
                                )}

                                {project.duration && (
                                  <span>
                                    Duration:{' '}
                                    <span className="font-medium text-foreground">
                                      {project.duration}
                                    </span>
                                  </span>
                                )}

                              </div>

                            </div>

                            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">

                              {existingRequest ? (
                                <Button
                                  disabled
                                  variant="outline"
                                  className="sm:min-w-[150px]"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Applied
                                </Button>
                              ) : (
                                <Button
                                  onClick={() =>
                                    handleApply(
                                      project
                                    )
                                  }
                                  disabled={
                                    actionProjectId ===
                                    project.id
                                  }
                                  className="sm:min-w-[150px]"
                                >

                                  <Send className="mr-2 h-4 w-4" />

                                  {actionProjectId ===
                                  project.id
                                    ? 'Applying...'
                                    : 'Apply to project'}

                                </Button>
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            MY APPLICATIONS
            ================================================== */}

        {isApproved && (
          <section className="rounded-2xl border border-border/60 bg-card/40">

            <div className="border-b border-border/60 p-6">

              <div className="flex items-center gap-2">

                <Send className="h-5 w-5 text-primary" />

                <h3 className="font-semibold">
                  My applications
                </h3>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Track projects you've applied to.
              </p>

            </div>

            <div className="p-6">

              {requests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">

                  <Send className="mx-auto h-7 w-7 text-muted-foreground/40" />

                  <p className="mt-3 text-sm font-medium">
                    No applications yet
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Apply to a project above to see it here.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {requests.map(
                    (request) => {

                      const project =
                        projects.find(
                          (item) =>
                            item.id ===
                            request.project_id
                        );

                      return (
                        <div
                          key={request.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div className="min-w-0">

                            <p className="font-medium">
                              {project?.title ||
                                'Project'}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Applied{' '}
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>

                          </div>

                          <Badge
                            variant="outline"
                            className={
                              request.status ===
                              'accepted'
                                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500'
                                : request.status ===
                                  'rejected'
                                ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                : 'border-amber-500/30 bg-amber-500/5 text-amber-500'
                            }
                          >
                            {request.status}
                          </Badge>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </section>
        )}

        {/* ==================================================
            ASSIGNED PROJECTS
            ================================================== */}

        {isApproved &&
          assignedProjects.length >
            0 && (
            <section className="rounded-2xl border border-border/60 bg-card/40">

              <div className="border-b border-border/60 p-6">

                <div className="flex items-center gap-2">

                  <Briefcase className="h-5 w-5 text-primary" />

                  <h3 className="font-semibold">
                    My active projects
                  </h3>

                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Projects you've been selected to work on.
                </p>

              </div>

              <div className="divide-y divide-border/60">

                {assignedProjects.map(
                  (project) => {

                    const assignment =
                      assignments.find(
                        (item) =>
                          item.project_id ===
                          project.id
                      );

                    return (
                      <div
                        key={project.id}
                        className="p-5"
                      >

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <h4 className="font-medium">
                              {project.title}
                            </h4>

                            <p className="mt-1 text-xs text-muted-foreground">

                              {project.primary_field}

                              {project.specialization
                                ? ` · ${project.specialization}`
                                : ''}

                            </p>

                          </div>

                          {assignment && (
                            <Badge
                              variant="outline"
                              className="w-fit border-primary/20 bg-primary/5 text-primary"
                            >
                              {assignment.status}
                            </Badge>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

        {/* ==================================================
            RESUME
            ================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/40">

          <div className="flex flex-col gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">

                <FileText className="h-5 w-5 text-primary" />

              </div>

              <div>

                <h3 className="font-semibold">
                  Professional resume
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Used for expert verification and project matching.
                </p>

              </div>

            </div>

            <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/40">
              Required
            </div>

          </div>

          <div className="p-6">

            {expertProfile.resume_file_name ? (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-5">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                      <FileText className="h-5 w-5 text-primary" />

                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-medium">
                        Current resume
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {expertProfile.resume_file_name}
                      </p>

                    </div>

                  </div>

                  <label className="shrink-0">

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={
                        handleResumeUpload
                      }
                      disabled={
                        isUploading
                      }
                    />

                    <Button
                      type="button"
                      asChild
                      disabled={
                        isUploading
                      }
                      className="w-full sm:w-auto"
                    >

                      <span className="cursor-pointer">

                        <Upload className="mr-2 h-4 w-4" />

                        {isUploading
                          ? 'Uploading...'
                          : 'Replace resume'}

                      </span>

                    </Button>

                  </label>

                </div>

              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.025] p-8 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">

                  <Upload className="h-6 w-6 text-primary" />

                </div>

                <h3 className="mt-5 text-base font-semibold">
                  Upload your resume
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Upload your current professional resume.
                  Accepted formats: PDF, DOC, or DOCX.
                  Maximum size: 10 MB.
                </p>

                <label className="mt-5 inline-block">

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={
                      handleResumeUpload
                    }
                    disabled={
                      isUploading
                    }
                  />

                  <Button
                    type="button"
                    asChild
                    disabled={
                      isUploading
                    }
                  >

                    <span className="cursor-pointer">

                      <Upload className="mr-2 h-4 w-4" />

                      {isUploading
                        ? 'Uploading...'
                        : 'Choose resume'}

                    </span>

                  </Button>

                </label>

              </div>
            )}

            {uploadError && (
              <p className="mt-4 text-sm text-destructive">
                {uploadError}
              </p>
            )}

          </div>

        </section>

        {/* ==================================================
            LOWER CONTENT
            ================================================== */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* PROFILE STRENGTH */}

          <section className="rounded-2xl border border-border/60 bg-card/40">

            <div className="border-b border-border/60 p-5">

              <div className="flex items-center gap-2">

                <Sparkles className="h-4 w-4 text-primary" />

                <h3 className="text-sm font-semibold">
                  Profile strength
                </h3>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Complete your profile to improve matching.
              </p>

            </div>

            <div className="p-5">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-xs font-medium">
                  Profile completion
                </span>

                <span className="font-mono text-xs text-primary">
                  {profileCompletion}%
                </span>

              </div>

              <Progress
                value={
                  profileCompletion
                }
                className="h-1.5"
              />

              <div className="mt-3 flex items-start gap-2 text-[10px] text-muted-foreground">

                {profileCompletion >=
                80 ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                )}

                <span>
                  {profileCompletion >=
                  80
                    ? 'Your profile is well prepared for project matching.'
                    : 'Complete more profile information to improve your project matches.'}
                </span>

              </div>

            </div>

          </section>

          {/* EXPERTISE */}

          <section className="rounded-2xl border border-border/60 bg-card/40 lg:col-span-2">

            <div className="border-b border-border/60 p-5">

              <h3 className="text-sm font-semibold">
                Your expertise
              </h3>

            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-3">

              <div>

                <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Domain
                </p>

                <p className="text-sm font-medium">
                  {expertProfile.primary_field ||
                    'Not specified'}
                </p>

              </div>

              <div>

                <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Specialization
                </p>

                <p className="text-sm font-medium">
                  {expertProfile.specialization ||
                    'Not specified'}
                </p>

              </div>

              <div>

                <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Experience
                </p>

                <p className="text-sm font-medium">
                  {expertProfile.years_experience
                    ? `${expertProfile.years_experience} years`
                    : 'Not specified'}
                </p>

              </div>

            </div>

            <div className="border-t border-border/60 p-5">

              <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                Skills
              </p>

              <div className="flex flex-wrap gap-1.5">

                {expertProfile.skills?.length ? (
                  expertProfile.skills.map(
                    (skill, index) => (
                      <Badge
                        key={`${skill}-${index}`}
                        variant="outline"
                        className="border-border/70 bg-muted/20 font-mono text-[10px] font-normal"
                      >
                        {skill}
                      </Badge>
                    )
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No skills added yet.
                  </span>
                )}

              </div>

            </div>

          </section>

        </div>

      </div>

    </AppLayout>
  );
}

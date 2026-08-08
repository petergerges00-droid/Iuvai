import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';

import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ============================================================
   TYPES
   ============================================================ */

interface Application {
  id: string;
  project_id: string;
  expert_id: string;
  cover_message: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

interface ExpertProfile {
  id: string;
  primary_field: string | null;
  specialization: string | null;
  years_experience: number | null;
  highest_qualification: string | null;
  skills: string[] | null;
  languages: string[] | null;
  previous_ai_experience: string | null;
  availability_hours: number | null;
  Resume_path: string | null;
  Resume_file_name: string | null;
  verification_status: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  account_type: string | null;
  country: string | null;
}

interface ApplicationWithExpert extends Application {
  expert?: ExpertProfile | null;
  profile?: Profile | null;
}

interface Project {
  id: string;
  company_id: string;
  title: string;
  status: string;
}

/* ============================================================
   STATUS HELPERS
   ============================================================ */

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending';

    case 'accepted':
      return 'Accepted';

    case 'rejected':
      return 'Rejected';

    case 'withdrawn':
      return 'Withdrawn';

    default:
      return status.replace(/_/g, ' ');
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-500';

    case 'accepted':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500';

    case 'rejected':
      return 'border-destructive/30 bg-destructive/10 text-destructive';

    case 'withdrawn':
      return 'border-border/60 bg-muted/20 text-muted-foreground';

    default:
      return 'border-border/60 bg-muted/20 text-muted-foreground';
  }
}

/* ============================================================
   DATE FORMATTER
   ============================================================ */

function formatDate(date: string | null) {
  if (!date) {
    return 'Not specified';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function CompanyProjectApplications() {
  const { user, profile } = useAuth();

  const [, params] = useRoute(
    '/company-dashboard/projects/:projectId/applications'
  );

  const [, setLocation] = useLocation();

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [applications, setApplications] =
    useState<ApplicationWithExpert[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [updatingApplicationId, setUpdatingApplicationId] =
    useState<string | null>(null);

  /* ============================================================
     LOAD PROJECT + APPLICATIONS
     ============================================================ */

  useEffect(() => {
    if (!user?.id || !projectId) {
      return;
    }

    let mounted = true;

    async function loadApplications() {
      setIsLoading(true);
      setError(null);

      try {
        /* ======================================================
           LOAD PROJECT
           ====================================================== */

        const {
          data: projectData,
          error: projectError,
        } = await supabase
          .from('projects')
          .select(
            'id, company_id, title, status'
          )
          .eq('id', projectId)
          .eq('company_id', user.id)
          .maybeSingle();

        if (projectError) {
          console.error(
            'PROJECT LOAD ERROR:',
            projectError
          );

          if (mounted) {
            setError(
              'We could not load this project.'
            );
          }

          return;
        }

        if (!projectData) {
          if (mounted) {
            setError(
              'This project could not be found or you do not have access to it.'
            );
          }

          return;
        }

        /* ======================================================
           LOAD APPLICATIONS
           ====================================================== */

        const {
          data: applicationData,
          error: applicationError,
        } = await supabase
          .from('project_applications')
          .select(
            'id, project_id, expert_id, cover_message, status, created_at, updated_at'
          )
          .eq('project_id', projectId)
          .order('created_at', {
            ascending: false,
          });

        if (applicationError) {
          console.error(
            'APPLICATION LOAD ERROR:',
            applicationError
          );

          if (mounted) {
            setError(
              applicationError.message ||
                'We could not load the applications.'
            );
          }

          return;
        }

        const rawApplications =
          (applicationData || []) as Application[];

        /* ======================================================
           LOAD EXPERT PROFILES
           ====================================================== */

        const expertIds = Array.from(
          new Set(
            rawApplications
              .map(
                (application) =>
                  application.expert_id
              )
              .filter(Boolean)
          )
        );

        let expertProfiles: ExpertProfile[] =
          [];

        let expertProfilesMap =
          new Map<string, ExpertProfile>();

        if (expertIds.length > 0) {
          const {
            data: expertData,
            error: expertError,
          } = await supabase
            .from('expert_profiles')
            .select(
              `
                id,
                primary_field,
                specialization,
                years_experience,
                highest_qualification,
                skills,
                languages,
                previous_ai_experience,
                availability_hours,
                Resume_path,
                Resume_file_name,
                verification_status
              `
            )
            .in('id', expertIds);

          if (expertError) {
            console.warn(
              'EXPERT PROFILE LOAD WARNING:',
              expertError
            );
          } else {
            expertProfiles =
              (expertData || []) as ExpertProfile[];

            expertProfilesMap = new Map(
              expertProfiles.map((expert) => [
                expert.id,
                expert,
              ])
            );
          }
        }

        /* ======================================================
           LOAD BASIC USER PROFILES
           ====================================================== */

        let profilesMap =
          new Map<string, Profile>();

        if (expertIds.length > 0) {
          const {
            data: profileData,
            error: profileError,
          } = await supabase
            .from('profiles')
            .select(
              'id, full_name, account_type, country'
            )
            .in('id', expertIds);

          if (profileError) {
            console.warn(
              'PROFILE LOAD WARNING:',
              profileError
            );
          } else {
            const profiles =
              (profileData || []) as Profile[];

            profilesMap = new Map(
              profiles.map((item) => [
                item.id,
                item,
              ])
            );
          }
        }

        /* ======================================================
           COMBINE APPLICATIONS + EXPERT DATA
           ====================================================== */

        const combinedApplications =
          rawApplications.map(
            (application) => ({
              ...application,

              expert:
                expertProfilesMap.get(
                  application.expert_id
                ) || null,

              profile:
                profilesMap.get(
                  application.expert_id
                ) || null,
            })
          );

        if (mounted) {
          setProject(
            projectData as Project
          );

          setApplications(
            combinedApplications
          );
        }
      } catch (err) {
        console.error(
          'APPLICATION LOAD EXCEPTION:',
          err
        );

        if (mounted) {
          setError(
            'Something went wrong while loading applications.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      mounted = false;
    };
  }, [user?.id, projectId]);

  /* ============================================================
     UPDATE APPLICATION STATUS
     ============================================================ */

  async function updateApplicationStatus(
    applicationId: string,
    status: 'accepted' | 'rejected'
  ) {
    if (!user?.id || !projectId) {
      return;
    }

    setUpdatingApplicationId(
      applicationId
    );

    setError(null);

    try {
      /* ======================================================
         VERIFY APPLICATION BELONGS TO COMPANY PROJECT
         ====================================================== */

      const {
        data: application,
        error: applicationLookupError,
      } = await supabase
        .from('project_applications')
        .select(
          'id, project_id'
        )
        .eq('id', applicationId)
        .eq('project_id', projectId)
        .maybeSingle();

      if (
        applicationLookupError ||
        !application
      ) {
        console.error(
          'APPLICATION LOOKUP ERROR:',
          applicationLookupError
        );

        setError(
          'You do not have permission to update this application.'
        );

        return;
      }

      /* ======================================================
         VERIFY THE PROJECT BELONGS TO THIS COMPANY
         ====================================================== */

      const {
        data: companyProject,
        error: companyProjectError,
      } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('company_id', user.id)
        .maybeSingle();

      if (
        companyProjectError ||
        !companyProject
      ) {
        console.error(
          'COMPANY PROJECT VERIFICATION ERROR:',
          companyProjectError
        );

        setError(
          'You do not have permission to update this application.'
        );

        return;
      }

      /* ======================================================
         UPDATE STATUS
         ====================================================== */

      const {
        data,
        error: updateError,
      } = await supabase
        .from('project_applications')
        .update({
          status,
        })
        .eq('id', applicationId)
        .eq('project_id', projectId)
        .select(
          'id, project_id, expert_id, cover_message, status, created_at, updated_at'
        )
        .single();

      if (updateError) {
        console.error(
          'APPLICATION STATUS UPDATE ERROR:',
          updateError
        );

        setError(
          updateError.message ||
            'Unable to update the application.'
        );

        return;
      }

      /* ======================================================
         UPDATE LOCAL STATE
         ====================================================== */

      setApplications(
        (previous) =>
          previous.map(
            (application) =>
              application.id ===
              applicationId
                ? {
                    ...application,
                    status:
                      data?.status ||
                      status,
                  }
                : application
          )
      );
    } catch (err) {
      console.error(
        'APPLICATION STATUS EXCEPTION:',
        err
      );

      setError(
        'Something went wrong while updating the application.'
      );
    } finally {
      setUpdatingApplicationId(
        null
      );
    }
  }

  /* ============================================================
     AUTH
     ============================================================ */

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Initializing workspace...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     LOADING
     ============================================================ */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <h1 className="text-xl font-semibold">
            Loading applications
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Preparing the expert applications...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
     ============================================================ */

  if (error && !project) {
    return (
      <AppLayout title="Applications">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>

            <h1 className="text-xl font-semibold">
              Applications unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {error}
            </p>

            <Button
              className="mt-6"
              variant="outline"
              onClick={() =>
                setLocation(
                  projectId
                    ? `/company-dashboard/projects/${projectId}`
                    : '/company-dashboard'
                )
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to project
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  /* ============================================================
     COUNTS
     ============================================================ */

  const pendingCount =
    applications.filter(
      (application) =>
        application.status === 'pending'
    ).length;

  const acceptedCount =
    applications.filter(
      (application) =>
        application.status === 'accepted'
    ).length;

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <AppLayout title="Expert Applications">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ===================================================
            HEADER
            =================================================== */}

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.045]">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />

          <div className="relative p-6 sm:p-8">

            <Link
              href={
                projectId
                  ? `/company-dashboard/projects/${projectId}`
                  : '/company-dashboard'
              }
              className="mb-6 inline-flex items-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Project workspace
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div className="min-w-0">

                <div className="mb-4 flex flex-wrap items-center gap-2">

                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary"
                  >
                    <Users className="mr-2 h-3 w-3" />
                    EXPERT MATCHING
                  </Badge>

                  <Badge
                    variant="outline"
                    className="border-border/60 bg-muted/20"
                  >
                    {applications.length}{' '}
                    {applications.length === 1
                      ? 'application'
                      : 'applications'}
                  </Badge>

                </div>

                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Expert applications
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {project?.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Review experts who have applied to
                  your project and select the candidates
                  you want to work with.
                </p>

              </div>

              <div className="flex shrink-0 gap-2">

                <Button
                  variant="outline"
                  asChild
                >
                  <Link
                    href={
                      projectId
                        ? `/company-dashboard/projects/${projectId}`
                        : '/company-dashboard'
                    }
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    View Project
                  </Link>
                </Button>

              </div>

            </div>
          </div>
        </section>

        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3">
            <div className="flex items-start gap-3">

              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />

              <div>
                <p className="text-xs font-medium text-destructive">
                  Unable to complete action
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {error}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ===================================================
            STATS
            =================================================== */}

        <div className="grid gap-3 sm:grid-cols-3">

          <ApplicationStat
            icon={
              <Users className="h-4 w-4 text-primary" />
            }
            label="Total applications"
            value={String(
              applications.length
            )}
          />

          <ApplicationStat
            icon={
              <Clock3 className="h-4 w-4 text-amber-500" />
            }
            label="Pending review"
            value={String(
              pendingCount
            )}
          />

          <ApplicationStat
            icon={
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            }
            label="Accepted"
            value={String(
              acceptedCount
            )}
          />

        </div>

        {/* ===================================================
            APPLICATIONS
            =================================================== */}

        {applications.length === 0 ? (

          <section className="rounded-2xl border border-border/60 bg-card/40">

            <div className="p-10 text-center sm:p-14">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-muted/20">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No applications yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Once experts apply to this project, their
                applications will appear here for your
                review.
              </p>

              <Button
                className="mt-6"
                variant="outline"
                asChild
              >
                <Link
                  href={
                    projectId
                      ? `/company-dashboard/projects/${projectId}`
                      : '/company-dashboard'
                  }
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to project
                </Link>
              </Button>

            </div>

          </section>

        ) : (

          <div className="space-y-5">

            {applications.map(
              (application) => {

                const expert =
                  application.expert;

                const basicProfile =
                  application.profile;

                const expertName =
                  basicProfile?.full_name ||
                  'Expert';

                const isUpdating =
                  updatingApplicationId ===
                  application.id;

                return (
                  <section
                    key={
                      application.id
                    }
                    className="overflow-hidden rounded-2xl border border-border/60 bg-card/40"
                  >

                    {/* APPLICATION HEADER */}

                    <div className="border-b border-border/60 p-5 sm:p-6">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <User className="h-5 w-5 text-primary" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="text-lg font-semibold">
                                {expertName}
                              </h2>

                              <Badge
                                variant="outline"
                                className={
                                  getStatusClasses(
                                    application.status
                                  )
                                }
                              >
                                {getStatusLabel(
                                  application.status
                                )}
                              </Badge>

                            </div>

                            {expert?.primary_field && (
                              <p className="mt-1 text-sm text-muted-foreground">
                                {expert.primary_field}
                              </p>
                            )}

                            {expert?.specialization && (
                              <p className="mt-2 text-xs text-primary">
                                {expert.specialization}
                              </p>
                            )}

                            {expert?.years_experience !=
                              null && (
                              <p className="mt-2 text-xs text-muted-foreground">
                                {expert.years_experience}{' '}
                                {expert.years_experience === 1
                                  ? 'year'
                                  : 'years'}{' '}
                                of experience
                              </p>
                            )}

                            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/40">
                              Applied{' '}
                              {formatDate(
                                application.created_at
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          {application.status ===
                            'pending' && (
                            <>
                              <Button
                                size="sm"
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    'accepted'
                                  )
                                }
                              >
                                {isUpdating ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}

                                Accept
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  isUpdating
                                }
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    'rejected'
                                  )
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* APPLICATION BODY */}

                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-3">

                      {/* APPLICATION MESSAGE */}

                      <div className="space-y-6 lg:col-span-2">

                        <ApplicationTextBlock
                          icon={
                            <FileText className="h-4 w-4" />
                          }
                          label="Application message"
                          value={
                            application.cover_message
                          }
                        />

                        {expert?.previous_ai_experience && (
                          <ApplicationTextBlock
                            icon={
                              <Sparkles className="h-4 w-4" />
                            }
                            label="Previous AI experience"
                            value={
                              expert.previous_ai_experience
                            }
                          />
                        )}

                        {expert?.skills &&
                          expert.skills.length > 0 && (
                            <div>
                              <div className="mb-2 flex items-center gap-2">

                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <Sparkles className="h-4 w-4" />
                                </div>

                                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                                  Skills
                                </p>

                              </div>

                              <div className="flex flex-wrap gap-2 rounded-xl border border-border/50 bg-background/20 p-4">

                                {expert.skills.map(
                                  (skill, index) => (
                                    <Badge
                                      key={`${skill}-${index}`}
                                      variant="outline"
                                      className="border-border/60 bg-muted/20"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}

                              </div>
                            </div>
                          )}

                      </div>

                      {/* SIDEBAR */}

                      <div className="space-y-4">

                        <div className="rounded-xl border border-border/60 bg-background/30 p-4">

                          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                            Application date
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-sm font-medium">

                            <CalendarDays className="h-4 w-4 text-muted-foreground" />

                            {formatDate(
                              application.created_at
                            )}

                          </p>

                        </div>

                        {expert?.availability_hours !=
                          null && (
                          <div className="rounded-xl border border-border/60 bg-background/30 p-4">

                            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                              Availability
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm font-medium">

                              <Clock3 className="h-4 w-4 text-muted-foreground" />

                              {expert.availability_hours}{' '}
                              hours/week

                            </p>

                          </div>
                        )}

                        {expert?.highest_qualification && (
                          <div className="rounded-xl border border-border/60 bg-background/30 p-4">

                            <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                              Qualification
                            </p>

                            <p className="mt-2 text-sm font-medium">
                              {
                                expert.highest_qualification
                              }
                            </p>

                          </div>
                        )}

                        {expert?.languages &&
                          expert.languages.length > 0 && (
                            <div className="rounded-xl border border-border/60 bg-background/30 p-4">

                              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                                Languages
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1.5">

                                {expert.languages.map(
                                  (
                                    language,
                                    index
                                  ) => (
                                    <Badge
                                      key={`${language}-${index}`}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {language}
                                    </Badge>
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        <div className="rounded-xl border border-border/60 bg-background/30 p-4">

                          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                            Verification
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-sm font-medium">

                            <ShieldCheck className="h-4 w-4 text-primary" />

                            {expert?.verification_status
                              ? expert.verification_status
                              : 'Pending'}

                          </p>

                        </div>

                        <div className="flex items-start gap-2 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">

                          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                          <span>
                            Applicant information is
                            visible only to authorized
                            members of your organization.
                          </span>

                        </div>

                      </div>

                    </div>

                  </section>
                );
              }
            )}

          </div>
        )}

        {/* ===================================================
            FOOTER
            =================================================== */}

        <div className="flex flex-col gap-2 border-t border-border/50 pt-5 text-[10px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 uppercase tracking-[0.16em]">

            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

            Application review workspace active

          </div>

          <Link
            href={
              projectId
                ? `/company-dashboard/projects/${projectId}`
                : '/company-dashboard'
            }
            className="flex items-center gap-2 uppercase tracking-[0.16em] text-muted-foreground/40 transition-colors hover:text-primary"
          >
            <ArrowUpRight className="h-3 w-3" />
            Project workspace
          </Link>

        </div>

      </div>
    </AppLayout>
  );
}

/* ============================================================
   APPLICATION STAT
   ============================================================ */

function ApplicationStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>

        <div>

          <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
            {label}
          </p>

          <p className="mt-0.5 text-sm font-medium">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   APPLICATION TEXT BLOCK
   ============================================================ */

function ApplicationTextBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center gap-2">

        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>

        <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
          {label}
        </p>

      </div>

      <div className="rounded-xl border border-border/50 bg-background/20 p-4">

        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {value || 'Not provided'}
        </p>

      </div>

    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import {
  Loader2,
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Clock3,
  GraduationCap,
  Languages,
  Brain,
  FileText,
  ExternalLink,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getExperts,
  getCompanyProjects,
  getResumeUrl,
  ExpertWithProfile,
  Project,
} from '@/lib/supabase';

const ADMIN_COMPANY_ID =
  '0f29b27d-45b6-4377-9242-e983f95039af';

export default function AdminExpertProfile() {
  const params = useParams<{
    expertId: string;
  }>();

  const expertId = params.expertId;

  const [expert, setExpert] =
    useState<ExpertWithProfile | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isOpeningResume, setIsOpeningResume] =
    useState(false);

  const [isOpeningCertificate, setIsOpeningCertificate] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
  ============================================================
  LOAD EXPERT
  ============================================================
  */

  useEffect(() => {
    async function loadExpert() {
      try {
        setIsLoading(true);
        setError(null);

        if (!expertId) {
          throw new Error(
            'Expert ID is missing.'
          );
        }

        const experts = await getExperts();

        const foundExpert = experts.find(
          (item) =>
            item.id === expertId
        );

        if (!foundExpert) {
          throw new Error(
            'Expert not found.'
          );
        }

        setExpert(foundExpert);

        const companyProjects =
          await getCompanyProjects(
            ADMIN_COMPANY_ID
          );

        setProjects(companyProjects);
      } catch (err) {
        console.error(
          'ADMIN EXPERT PROFILE LOAD ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load expert.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadExpert();
  }, [expertId]);

  /*
  ============================================================
  VIEW RESUME
  ============================================================
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
        'ADMIN RESUME OPEN ERROR:',
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
  ============================================================
  VIEW MEDICAL CERTIFICATE
  ============================================================
  */

  async function handleViewMedicalCertificate() {
    if (!expert?.medical_certificate_path) {
      return;
    }

    try {
      setIsOpeningCertificate(true);
      setError(null);

      const { data, error: storageError } =
        await import('@/lib/supabase').then(
          async ({
            supabase,
          }) => {
            return supabase.storage
              .from('medical-certificates')
              .createSignedUrl(
                expert.medical_certificate_path,
                60 * 60
              );
          }
        );

      if (storageError) {
        throw storageError;
      }

      if (!data?.signedUrl) {
        throw new Error(
          'Unable to generate certificate URL.'
        );
      }

      window.open(
        data.signedUrl,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (err) {
      console.error(
        'ADMIN MEDICAL CERTIFICATE OPEN ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to open medical certificate.'
      );
    } finally {
      setIsOpeningCertificate(false);
    }
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (isLoading) {
    return (
      <AppLayout title="Expert">

        <div className="flex min-h-[500px] items-center justify-center">

          <Loader2 className="h-7 w-7 animate-spin text-primary" />

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error || !expert) {
    return (
      <AppLayout title="Expert">

        <div className="space-y-6">

          <Link
            href="/admin/experts"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to experts
          </Link>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">

            <p className="text-sm font-medium text-destructive">
              Unable to load expert
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {error ||
                'The requested expert could not be found.'}
            </p>

          </div>

        </div>

      </AppLayout>
    );
  }

  /*
  ============================================================
  NORMALIZED DATA
  ============================================================
  */

  const name =
    expert.profile?.full_name ||
    'Unnamed expert';

  const country =
    expert.profile?.country ||
    'Country not specified';

  const primaryField =
    expert.primary_field ||
    'Field not specified';

  const specialization =
    expert.specialization ||
    'Specialization not specified';

  const yearsExperience =
    expert.years_experience != null
      ? `${expert.years_experience} years`
      : 'Not specified';

  const qualification =
    expert.highest_qualification ||
    'Not specified';

  const availability =
    expert.availability_hours != null
      ? `${expert.availability_hours} hrs/week`
      : 'Not specified';

  const skills =
    expert.skills || [];

  const languages =
    expert.languages || [];

  const aiExperience =
    expert.previous_ai_experience?.trim() || '';

  const certificateStatus =
    expert.medical_certificate_status ||
    'pending';

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Expert Profile">

      <div className="space-y-8">

        {/* ====================================================
            BACK
            ==================================================== */}

        <Link
          href="/admin/experts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to experts
        </Link>

        {/* ====================================================
            HEADER
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="p-6">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary">

                  <span className="text-xl font-semibold">

                    {name
                      .charAt(0)
                      .toUpperCase()}

                  </span>

                </div>

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <ShieldCheck className="h-4 w-4 text-primary" />

                    <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
                      IUVAI Expert
                    </p>

                  </div>

                  <h2 className="mt-2 truncate text-2xl font-semibold tracking-tight">
                    {name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {primaryField}
                    {specialization
                      ? ` · ${specialization}`
                      : ''}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">

                    <MapPin className="h-3.5 w-3.5" />

                    {country}

                  </div>

                </div>

              </div>

              <div className="shrink-0">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs text-yellow-600 dark:text-yellow-400">

                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />

                  {expert.verification_status === 'approved'
                    ? 'Approved'
                    : 'Pending review'}

                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            PROFESSIONAL OVERVIEW
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Professional overview
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Core professional information submitted by the expert.
            </p>

          </div>

          <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">

            <ProfileStat
              icon={
                <User className="h-4 w-4" />
              }
              label="Primary field"
              value={primaryField}
            />

            <ProfileStat
              icon={
                <Briefcase className="h-4 w-4" />
              }
              label="Specialization"
              value={specialization}
            />

            <ProfileStat
              icon={
                <Clock3 className="h-4 w-4" />
              }
              label="Experience"
              value={yearsExperience}
            />

            <ProfileStat
              icon={
                <GraduationCap className="h-4 w-4" />
              }
              label="Highest qualification"
              value={qualification}
            />

          </div>

          <div className="border-t border-border/60">

            <ProfileStat
              icon={
                <Clock3 className="h-4 w-4" />
              }
              label="Availability"
              value={availability}
              fullWidth
            />

          </div>

        </section>

        {/* ====================================================
            SKILLS + LANGUAGES
            ==================================================== */}

        <div className="grid gap-6 md:grid-cols-2">

          {/* Skills */}

          <section className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">

              <div className="flex items-center gap-2">

                <CheckCircle2 className="h-4 w-4 text-primary" />

                <h3 className="font-medium">
                  Skills
                </h3>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Skills and areas of expertise submitted by the expert.
              </p>

            </div>

            <div className="p-5">

              {skills.length > 0 ? (

                <div className="flex flex-wrap gap-2">

                  {skills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <EmptyState text="No skills listed." />

              )}

            </div>

          </section>

          {/* Languages */}

          <section className="rounded-2xl border border-border/60 bg-card/70">

            <div className="border-b border-border/60 p-5">

              <div className="flex items-center gap-2">

                <Languages className="h-4 w-4 text-primary" />

                <h3 className="font-medium">
                  Languages
                </h3>

              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Languages the expert reported being able to work in.
              </p>

            </div>

            <div className="p-5">

              {languages.length > 0 ? (

                <div className="flex flex-wrap gap-2">

                  {languages.map(
                    (language, index) => (

                      <span
                        key={`${language}-${index}`}
                        className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {language}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <EmptyState text="No languages listed." />

              )}

            </div>

          </section>

        </div>

        {/* ====================================================
            AI EXPERIENCE
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">

              <Brain className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Previous AI experience
              </h3>

            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              AI evaluation, annotation, training, data work,
              or other relevant AI experience.
            </p>

          </div>

          <div className="p-5">

            {aiExperience ? (

              <div className="rounded-xl border border-border/60 bg-background/40 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {aiExperience}
                </p>

              </div>

            ) : (

              <EmptyState text="No previous AI experience provided." />

            )}

          </div>

        </section>

        {/* ====================================================
            RESUME
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">

              <FileText className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Resume / CV
              </h3>

            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Review the expert's submitted professional resume.
            </p>

          </div>

          <div className="p-5">

            {expert.resume_path ? (

              <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">

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

                <button
                  type="button"
                  onClick={handleViewResume}
                  disabled={isOpeningResume}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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

              </div>

            ) : (

              <EmptyState text="No resume uploaded." />

            )}

          </div>

        </section>

        {/* ====================================================
            MEDICAL CERTIFICATE
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">

              <BadgeCheck className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Medical Certificate
              </h3>

            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Review the medical certificate submitted by the expert
              for professional verification.
            </p>

          </div>

          <div className="p-5">

            {expert.medical_certificate_path ? (

              <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-muted/40">

                    <BadgeCheck className="h-5 w-5 text-muted-foreground" />

                  </div>

                  <div>

                    <p className="text-sm font-medium">

                      {expert.medical_certificate_file_name ||
                        'Medical certificate'}

                    </p>

                    <div className="mt-1 flex items-center gap-2">

                      <span className="text-xs text-muted-foreground">
                        Verification status:
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
                          certificateStatus === 'approved'
                            ? 'border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400'
                            : certificateStatus === 'rejected'
                              ? 'border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400'
                              : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {certificateStatus}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleViewMedicalCertificate
                  }
                  disabled={
                    isOpeningCertificate
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/70 px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isOpeningCertificate ? (

                    <Loader2 className="h-4 w-4 animate-spin" />

                  ) : (

                    <ExternalLink className="h-4 w-4" />

                  )}

                  {isOpeningCertificate
                    ? 'Opening...'
                    : 'View certificate'}

                </button>

              </div>

            ) : (

              <EmptyState text="No medical certificate uploaded." />

            )}

          </div>

        </section>

        {/* ====================================================
            PROJECT REVIEW
            ==================================================== */}

        <section className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex items-center gap-2">

              <Briefcase className="h-4 w-4 text-primary" />

              <h3 className="font-medium">
                Project review
              </h3>

            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Select a project to evaluate this expert against its
              requirements.
            </p>

          </div>

          {projects.length === 0 ? (

            <div className="p-10 text-center">

              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/40" />

              <p className="mt-3 text-sm font-medium">
                No projects available
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Create a project before reviewing experts.
              </p>

              <Link
                href="/admin/projects"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View projects
                <ChevronRight className="h-4 w-4" />
              </Link>

            </div>

          ) : (

            <div className="divide-y divide-border/60">

              {projects.map(
                (project) => (

                  <Link
                    key={project.id}
                    href={`/admin/projects/${project.id}/experts/${expert.id}`}
                    className="group block transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
                  >

                    <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-medium">
                            {project.title}
                          </p>

                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
                            {project.status}
                          </span>

                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">

                          {project.primary_field ||
                            'Field not specified'}

                          {project.specialization
                            ? ` · ${project.specialization}`
                            : ''}

                        </p>

                        {project.description && (

                          <p className="mt-2 max-w-3xl text-xs leading-5 text-muted-foreground">
                            {project.description}
                          </p>

                        )}

                        {project.required_skills &&
                          project.required_skills.length > 0 && (

                            <div className="mt-3 flex flex-wrap gap-2">

                              {project.required_skills.map(
                                (skill, index) => (

                                  <span
                                    key={`${skill}-${index}`}
                                    className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
                                  >
                                    {skill}
                                  </span>

                                )
                              )}

                            </div>

                          )}

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <span className="text-xs text-muted-foreground">
                          Review expert
                        </span>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </AppLayout>
  );
}

/*
============================================================
PROFILE STAT
============================================================
*/

function ProfileStat({
  icon,
  label,
  value,
  fullWidth = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`bg-card/70 p-5 ${
        fullWidth ? 'w-full' : ''
      }`}
    >

      <div className="flex items-center gap-2">

        <span className="text-muted-foreground">
          {icon}
        </span>

        <p className="text-xs text-muted-foreground">
          {label}
        </p>

      </div>

      <p className="mt-2 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}

/*
============================================================
EMPTY STATE
============================================================
*/

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-background/30 p-5 text-center">

      <p className="text-sm text-muted-foreground">
        {text}
      </p>

    </div>
  );
}

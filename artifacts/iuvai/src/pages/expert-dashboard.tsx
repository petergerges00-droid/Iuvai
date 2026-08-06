import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getExpertProfile,
  ExpertProfile,
  uploadResume,
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  Upload,
  ShieldCheck,
  Activity,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
export default function ExpertDashboard() {
  const { user, profile } = useAuth();
  const [expertProfile, setExpertProfile] =
    useState<ExpertProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    getExpertProfile(user.id)
      .then((data) => {
        console.log('EXPERT PROFILE:', data);
        setExpertProfile(data);
      })
      .catch((error) => {
        console.error('EXPERT PROFILE ERROR:', error);
      });
  }, [user?.id]);
  const handleResumeUpload = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadError(null);
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const validType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );
    if (!validType) {
      setUploadError(
        'Please upload a PDF, DOC, or DOCX file.'
      );
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        'Resume must be smaller than 10 MB.'
      );
      event.target.value = '';
      return;
    }
    setIsUploading(true);
    try {
      await uploadResume(user.id, file);
      const updatedProfile =
        await getExpertProfile(user.id);
      setExpertProfile(updatedProfile);
    } catch (error: any) {
      console.error('RESUME UPLOAD ERROR:', error);
      setUploadError(
        error?.message ||
          'Failed to upload resume.'
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Initializing workspace...
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
  return (
    <AppLayout title="Overview">
      <div className="space-y-6">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06]">
          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-500"
                  >
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Verification pending
                  </Badge>
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
                  Your expertise helps shape tomorrow's AI.
                  Complete your profile and verification to
                  unlock projects matched to your expertise in{' '}
                  <span className="font-medium text-foreground">
                    {expertProfile.primary_field}
                  </span>
                  .
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
        {/* ================================================= */}
        {/* STATUS STRIP */}
        {/* ================================================= */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                <Activity className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                  Status
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  Under review
                </p>
              </div>
            </div>
          </div>
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
                  Unlocking soon
                </p>
              </div>
            </div>
          </div>
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
                  30% complete
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* ================================================= */}
        {/* RESUME */}
        {/* ================================================= */}
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
                      onChange={handleResumeUpload}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      asChild
                      disabled={isUploading}
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
                    onChange={handleResumeUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    asChild
                    disabled={isUploading}
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
        {/* ================================================= */}
        {/* LOWER CONTENT */}
        {/* ================================================= */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ================================================= */}
          {/* COMING SOON */}
          {/* ================================================= */}
          <section className="space-y-4 lg:col-span-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
                Workspace modules
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                Your IUVAI workspace
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Assessments */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      Coming soon
                    </span>
                  </div>
                  <h4 className="font-semibold">
                    Assessments
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Complete domain-specific assessments to
                    demonstrate expertise and unlock higher-tier
                    projects.
                  </p>
                  <div className="mt-5 flex items-center text-xs font-medium text-primary">
                    Available soon
                    <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
              {/* Project Board */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 transition-all hover:border-primary/30 hover:bg-primary/[0.025]">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      Coming soon
                    </span>
                  </div>
                  <h4 className="font-semibold">
                    Project board
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Browse AI training and evaluation projects
                    matched to your unique expertise.
                  </p>
                  <div className="mt-5 flex items-center text-xs font-medium text-primary">
                    Available soon
                    <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* ================================================= */}
          {/* PROFILE / EXPERTISE */}
          {/* ================================================= */}
          <section className="space-y-6">
            {/* Profile strength */}
            <div className="rounded-2xl border border-border/60 bg-card/40">
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
                    Basic information
                  </span>
                  <span className="font-mono text-xs text-primary">
                    30%
                  </span>
                </div>
                <Progress
                  value={30}
                  className="h-1.5"
                />
                <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  More profile data will unlock additional opportunities.
                </div>
              </div>
            </div>
            {/* Expertise */}
            <div className="rounded-2xl border border-border/60 bg-card/40">
              <div className="border-b border-border/60 p-5">
                <h3 className="text-sm font-semibold">
                  Your expertise
                </h3>
              </div>
              <div className="space-y-5 p-5">
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Domain
                  </p>
                  <p className="text-sm font-medium">
                    {expertProfile.primary_field}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Specialization
                  </p>
                  <p className="text-sm font-medium">
                    {expertProfile.specialization}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50">
                    Verified skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {expertProfile.skills?.map(
                      (skill, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-border/70 bg-muted/20 font-mono text-[10px] font-normal"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2 border-t border-border/60 pt-4 text-xs text-amber-500">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Credentials are awaiting verification.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

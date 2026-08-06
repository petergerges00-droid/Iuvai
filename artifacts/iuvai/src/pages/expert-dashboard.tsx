import { useEffect, useState, ChangeEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getExpertProfile,
  ExpertProfile,
  uploadResume,
} from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  Upload,
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
      const updatedProfile = await getExpertProfile(user.id);
      setExpertProfile(updatedProfile);
    } catch (error: any) {
      console.error('RESUME UPLOAD ERROR:', error);
      setUploadError(
        error?.message || 'Failed to upload resume.'
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  if (!profile) {
    return (
      <div className="p-8">
        Loading profile...
      </div>
    );
  }
  if (!expertProfile) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">
          Expert profile not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          User ID: {user?.id}
        </p>
      </div>
    );
  }
  return (
    <AppLayout title="Overview">
      <div className="space-y-6">
        {/* ========================= */}
        {/* WELCOME / STATUS */}
        {/* ========================= */}
        <Card className="bg-primary text-primary-foreground overflow-hidden border-none shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-none mb-4"
                >
                  Verification Pending
                </Badge>
                <h2 className="text-3xl font-semibold tracking-tight mb-2">
                  Welcome, {profile.full_name}
                </h2>
                <p className="text-primary-foreground/80 max-w-md">
                  Your profile is currently under review by our
                  team. Once verified, you'll gain access to
                  available projects matching your expertise in{' '}
                  {expertProfile.primary_field}.
                </p>
              </div>
              <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20">
                <CheckCircle2 className="w-8 h-8 text-white/50" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ========================= */}
        {/* RESUME */}
        {/* ========================= */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
            <CardDescription>
              Upload your current resume for verification and
              project matching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expertProfile.resume_file_name ? (
              <div className="rounded-lg border bg-muted/30 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">
                        Current resume
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
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
                    >
                      <span className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading
                          ? 'Uploading...'
                          : 'Replace Resume'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Upload your resume
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a PDF, DOC, or DOCX file.
                  Maximum file size is 10 MB.
                </p>
                <label className="inline-block mt-5">
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
                        : 'Choose Resume'}
                    </span>
                  </Button>
                </label>
                {uploadError && (
                  <p className="mt-4 text-sm text-destructive">
                    {uploadError}
                  </p>
                )}
              </div>
            )}
            {expertProfile.resume_file_name && uploadError && (
              <p className="mt-4 text-sm text-destructive">
                {uploadError}
              </p>
            )}
          </CardContent>
        </Card>
        {/* ========================= */}
        {/* MAIN CONTENT */}
        {/* ========================= */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold tracking-tight">
              Coming Soon
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-dashed bg-muted/30">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                  <h4 className="font-medium text-foreground mb-1">
                    Assessments
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take domain-specific assessments to unlock
                    higher-tier projects and increase your ranking.
                  </p>
                  <div className="text-sm font-medium text-primary flex items-center">
                    Available soon
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-dashed bg-muted/30">
                <CardContent className="p-6">
                  <Briefcase className="w-8 h-8 text-muted-foreground mb-4" />
                  <h4 className="font-medium text-foreground mb-1">
                    Project Board
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse and apply to AI training and evaluation
                    projects that match your unique skillset.
                  </p>
                  <div className="text-sm font-medium text-primary flex items-center">
                    Available soon
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  Profile Strength
                </CardTitle>
                <CardDescription>
                  Complete assessments to increase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Basic info complete
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    30%
                  </span>
                </div>
                <Progress
                  value={30}
                  className="h-2"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Your Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Domain
                  </div>
                  <div className="font-medium">
                    {expertProfile.primary_field}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Specialization
                  </div>
                  <div className="font-medium">
                    {expertProfile.specialization}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Verified Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expertProfile.skills?.map(
                      (skill, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="font-mono font-normal"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t mt-4 flex items-center text-sm text-amber-600 dark:text-amber-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Awaiting credential verification
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

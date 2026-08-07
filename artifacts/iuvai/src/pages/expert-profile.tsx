import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getExpertProfile,
  upsertExpertProfile,
  uploadResume,
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  UserRound,
  Briefcase,
  GraduationCap,
  Languages,
  BrainCircuit,
  Clock3,
  FileText,
  Upload,
  Save,
  Plus,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
export default function ExpertProfile() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [primaryField, setPrimaryField] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [highestQualification, setHighestQualification] =
    useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [previousAiExperience, setPreviousAiExperience] =
    useState('');
  const [availabilityHours, setAvailabilityHours] =
    useState('');
  const [resumeFileName, setResumeFileName] =
    useState<string | null>(null);
  const [uploadError, setUploadError] =
    useState<string | null>(null);
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const expert = await getExpertProfile(user.id);
        if (expert) {
          setPrimaryField(expert.primary_field || '');
          setSpecialization(expert.specialization || '');
          setYearsExperience(
            expert.years_experience !== null &&
              expert.years_experience !== undefined
              ? String(expert.years_experience)
              : ''
          );
          setHighestQualification(
            expert.highest_qualification || ''
          );
          setSkills(expert.skills || []);
          setLanguages(expert.languages || []);
          setPreviousAiExperience(
            expert.previous_ai_experience || ''
          );
          setAvailabilityHours(
            expert.availability_hours !== null &&
              expert.availability_hours !== undefined
              ? String(expert.availability_hours)
              : ''
          );
          setResumeFileName(
            expert.resume_file_name || null
          );
        }
      } catch (error) {
        console.error(
          'EXPERT PROFILE LOAD ERROR:',
          error
        );
        toast({
          variant: 'destructive',
          title: 'Unable to load profile',
          description:
            'Please refresh the page and try again.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user?.id, toast]);
  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (
      skills.some(
        (skill) =>
          skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSkillInput('');
      return;
    }
    setSkills((current) => [...current, value]);
    setSkillInput('');
  };
  const removeSkill = (index: number) => {
    setSkills((current) =>
      current.filter((_, i) => i !== index)
    );
  };
  const addLanguage = () => {
    const value = languageInput.trim();
    if (!value) return;
    if (
      languages.some(
        (language) =>
          language.toLowerCase() === value.toLowerCase()
      )
    ) {
      setLanguageInput('');
      return;
    }
    setLanguages((current) => [...current, value]);
    setLanguageInput('');
  };
  const removeLanguage = (index: number) => {
    setLanguages((current) =>
      current.filter((_, i) => i !== index)
    );
  };
  const handleSave = async () => {
    if (!user?.id) return;
    if (!primaryField.trim()) {
      toast({
        variant: 'destructive',
        title: 'Primary field required',
        description:
          'Please enter your primary professional field.',
      });
      return;
    }
    setIsSaving(true);
    try {
      await upsertExpertProfile({
        id: user.id,
        primary_field:
          primaryField.trim() || null,
        specialization:
          specialization.trim() || null,
        years_experience:
          yearsExperience.trim()
            ? Number(yearsExperience)
            : null,
        highest_qualification:
          highestQualification.trim() || null,
        skills:
          skills.length > 0
            ? skills
            : null,
        languages:
          languages.length > 0
            ? languages
            : null,
        previous_ai_experience:
          previousAiExperience.trim() || null,
        availability_hours:
          availabilityHours.trim()
            ? Number(availabilityHours)
            : null,
      });
      toast({
        title: 'Profile saved',
        description:
          'Your professional profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error(
        'EXPERT PROFILE SAVE ERROR:',
        error
      );
      toast({
        variant: 'destructive',
        title: 'Unable to save profile',
        description:
          error?.message ||
          'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
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
      setResumeFileName(file.name);
      toast({
        title: 'Resume uploaded',
        description:
          'Your resume has been uploaded successfully.',
      });
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
  const profileCompletion = useMemo(() => {
    const checks = [
      primaryField.trim().length > 0,
      specialization.trim().length > 0,
      yearsExperience.trim().length > 0,
      highestQualification.trim().length > 0,
      skills.length > 0,
      languages.length > 0,
      previousAiExperience.trim().length > 0,
      availabilityHours.trim().length > 0,
      !!resumeFileName,
    ];
    const completed = checks.filter(Boolean).length;
    return Math.round(
      (completed / checks.length) * 100
    );
  }, [
    primaryField,
    specialization,
    yearsExperience,
    highestQualification,
    skills,
    languages,
    previousAiExperience,
    availabilityHours,
    resumeFileName,
  ]);
  if (!profile || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading IUVAI...
        </div>
      </div>
    );
  }
  if (profile.account_type !== 'expert') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            This page is available to experts only.
          </p>
        </div>
      </div>
    );
  }
  return (
    <AppLayout title="Expert Profile">
      <div className="max-w-4xl space-y-8">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_45%)]" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <UserRound className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
                    IUVAI
                  </span>
                  <span className="h-px w-8 bg-primary/40" />
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Expert Profile
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Professional Profile
                </h2>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Tell us about your professional expertise.
                  This information is used for verification,
                  expert matching, and project opportunities.
                </p>
              </div>
            </div>
            <div className="shrink-0 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">
                  Profile strength
                </span>
              </div>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {profileCompletion}%
              </p>
            </div>
          </div>
        </section>
        {/* PROFESSIONAL INFORMATION */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Your primary professional identity and experience.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Primary Field
              </Label>
              <Input
                value={primaryField}
                onChange={(e) =>
                  setPrimaryField(e.target.value)
                }
                placeholder="e.g. Medicine"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Specialization
              </Label>
              <Input
                value={specialization}
                onChange={(e) =>
                  setSpecialization(e.target.value)
                }
                placeholder="e.g. Neurosurgery"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Years of Experience
              </Label>
              <Input
                type="number"
                min="0"
                max="70"
                value={yearsExperience}
                onChange={(e) =>
                  setYearsExperience(e.target.value)
                }
                placeholder="e.g. 5"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Highest Qualification
              </Label>
              <Input
                value={highestQualification}
                onChange={(e) =>
                  setHighestQualification(
                    e.target.value
                  )
                }
                placeholder="e.g. MD, PhD, MSc"
                className="h-11"
              />
            </div>
          </CardContent>
        </Card>
        {/* SKILLS */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Skills & Expertise
                </CardTitle>
                <CardDescription>
                  Add the skills that best represent your professional expertise.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) =>
                  setSkillInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addSkill}
                className="h-11 shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={`${skill}-${index}`}
                    variant="outline"
                    className="gap-1.5 border-primary/20 bg-primary/[0.04] py-1.5"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        removeSkill(index)
                      }
                      className="rounded-full text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* LANGUAGES */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Languages className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Languages
                </CardTitle>
                <CardDescription>
                  Languages you can confidently use for professional work.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-2">
              <Input
                value={languageInput}
                onChange={(e) =>
                  setLanguageInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
                placeholder="e.g. English"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addLanguage}
                className="h-11 shrink-0"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {languages.map(
                  (language, index) => (
                    <Badge
                      key={`${language}-${index}`}
                      variant="outline"
                      className="gap-1.5 border-primary/20 bg-primary/[0.04] py-1.5"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() =>
                          removeLanguage(index)
                        }
                        className="rounded-full text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* AI EXPERIENCE */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  AI Experience
                </CardTitle>
                <CardDescription>
                  Describe any previous experience working with AI systems,
                  evaluation, annotation, or AI training.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              value={previousAiExperience}
              onChange={(e) =>
                setPreviousAiExperience(
                  e.target.value
                )
              }
              placeholder="Describe your previous AI-related experience..."
              className="min-h-[150px] resize-y"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Include relevant AI evaluation, data annotation,
              model testing, research, or other related experience.
            </p>
          </CardContent>
        </Card>
        {/* AVAILABILITY */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Clock3 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Availability
                </CardTitle>
                <CardDescription>
                  Help us match you with projects that fit your schedule.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="max-w-sm space-y-2">
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Hours Available Per Week
              </Label>
              <Input
                type="number"
                min="1"
                max="168"
                value={availabilityHours}
                onChange={(e) =>
                  setAvailabilityHours(
                    e.target.value
                  )
                }
                placeholder="e.g. 10"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                This helps us identify projects compatible with your availability.
              </p>
            </div>
          </CardContent>
        </Card>
        {/* RESUME */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Professional Resume
                </CardTitle>
                <CardDescription>
                  Your resume is used for expert verification and project matching.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {resumeFileName ? (
              <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Current resume
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {resumeFileName}
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
            ) : (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.025] p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">
                  Upload your resume
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  PDF, DOC, or DOCX. Maximum file size 10 MB.
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
                        : 'Choose Resume'}
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
          </CardContent>
        </Card>
        {/* SAVE */}
        <div className="sticky bottom-4 z-10 flex justify-end">
          <div className="rounded-xl border border-border/60 bg-background/90 p-2 shadow-xl backdrop-blur">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 px-6"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving
                ? 'Saving Profile...'
                : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

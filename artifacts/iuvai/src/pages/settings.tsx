import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';

import {
  getCompanyProfile,
  getExpertProfile,
  upsertProfile,
  upsertCompanyProfile,
  upsertExpertProfile,
  uploadCertificate,
  deleteCertificate,
  updatePassword,
} from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Textarea } from '@/components/ui/textarea';

import { useToast } from '@/hooks/use-toast';

import {
  Loader2,
  Shield,
  User,
  Building2,
  Lock,
  Save,
  Upload,
  FileText,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function Settings() {
  const {
    user,
    profile,
    refreshProfile,
  } = useAuth();

  const { toast } = useToast();

  // ─────────────────────────────────────────────────────────────
  // GENERAL STATE
  // ─────────────────────────────────────────────────────────────

  const [isLoading, setIsLoading] =
    useState(false);

  const [isPasswordLoading, setIsPasswordLoading] =
    useState(false);

  const [isExpertLoading, setIsExpertLoading] =
    useState(false);

  const [isCertificateLoading, setIsCertificateLoading] =
    useState(false);

  // ─────────────────────────────────────────────────────────────
  // GENERAL PROFILE
  // ─────────────────────────────────────────────────────────────

  const [fullName, setFullName] =
    useState('');

  const [country, setCountry] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // COMPANY
  // ─────────────────────────────────────────────────────────────

  const [companyName, setCompanyName] =
    useState('');

  const [website, setWebsite] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // EXPERT PROFILE
  // ─────────────────────────────────────────────────────────────

  const [primaryField, setPrimaryField] =
    useState('');

  const [specialization, setSpecialization] =
    useState('');

  const [yearsExperience, setYearsExperience] =
    useState('');

  const [highestQualification, setHighestQualification] =
    useState('');

  const [previousAIExperience, setPreviousAIExperience] =
    useState('');

  const [availabilityHours, setAvailabilityHours] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // SKILLS
  // ─────────────────────────────────────────────────────────────

  const [skills, setSkills] =
    useState<string[]>([]);

  const [skillInput, setSkillInput] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // LANGUAGES
  // ─────────────────────────────────────────────────────────────

  const [languages, setLanguages] =
    useState<string[]>([]);

  const [languageInput, setLanguageInput] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // CERTIFICATE
  // ─────────────────────────────────────────────────────────────

  const [
    certificatePath,
    setCertificatePath,
  ] = useState<string | null>(null);

  const [
    certificateFileName,
    setCertificateFileName,
  ] = useState<string | null>(null);

  const [
    certificateStatus,
    setCertificateStatus,
  ] = useState<
    'pending' | 'approved' | 'declined'
  >('pending');

  // ─────────────────────────────────────────────────────────────
  // PASSWORD
  // ─────────────────────────────────────────────────────────────

  const [newPassword, setNewPassword] =
    useState('');

  // ─────────────────────────────────────────────────────────────
  // LOAD PROFILE
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!profile) return;

    setFullName(
      profile.full_name || ''
    );

    setCountry(
      profile.country || ''
    );

    // ─────────────────────────────────────────────────────────
    // COMPANY PROFILE
    // ─────────────────────────────────────────────────────────

    if (
      profile.account_type === 'company' &&
      user?.id
    ) {
      getCompanyProfile(user.id)
        .then((company) => {
          if (!company) return;

          setCompanyName(
            company.company_name || ''
          );

          setWebsite(
            company.website || ''
          );
        })
        .catch((error) => {
          console.error(
            'Failed to load company profile:',
            error
          );
        });
    }

    // ─────────────────────────────────────────────────────────
    // EXPERT PROFILE
    // ─────────────────────────────────────────────────────────

    if (
      profile.account_type === 'expert' &&
      user?.id
    ) {
      getExpertProfile(user.id)
        .then((expert) => {
          if (!expert) return;

          setPrimaryField(
            expert.primary_field || ''
          );

          setSpecialization(
            expert.specialization || ''
          );

          setYearsExperience(
            expert.years_experience !== null &&
            expert.years_experience !== undefined
              ? String(
                  expert.years_experience
                )
              : ''
          );

          setHighestQualification(
            expert.highest_qualification || ''
          );

          setSkills(
            expert.skills || []
          );

          setLanguages(
            expert.languages || []
          );

          setPreviousAIExperience(
            expert.previous_ai_experience || ''
          );

          setAvailabilityHours(
            expert.availability_hours !== null &&
            expert.availability_hours !== undefined
              ? String(
                  expert.availability_hours
                )
              : ''
          );

          setCertificatePath(
            expert.medical_certificate_path || null
          );

          setCertificateFileName(
            expert.medical_certificate_file_name || null
          );

          setCertificateStatus(
            expert.medical_certificate_status || 'pending'
          );
        })
        .catch((error) => {
          console.error(
            'Failed to load expert profile:',
            error
          );
        });
    }
  }, [profile, user]);

  // ─────────────────────────────────────────────────────────────
  // ADD SKILL
  // ─────────────────────────────────────────────────────────────

  const addSkill = () => {
    const value =
      skillInput.trim();

    if (!value) return;

    const exists =
      skills.some(
        (skill) =>
          skill.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setSkillInput('');
      return;
    }

    setSkills([
      ...skills,
      value,
    ]);

    setSkillInput('');
  };

  // ─────────────────────────────────────────────────────────────
  // REMOVE SKILL
  // ─────────────────────────────────────────────────────────────

  const removeSkill = (
    skillToRemove: string
  ) => {
    setSkills(
      skills.filter(
        (skill) =>
          skill !== skillToRemove
      )
    );
  };

  // ─────────────────────────────────────────────────────────────
  // ADD LANGUAGE
  // ─────────────────────────────────────────────────────────────

  const addLanguage = () => {
    const value =
      languageInput.trim();

    if (!value) return;

    const exists =
      languages.some(
        (language) =>
          language.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setLanguageInput('');
      return;
    }

    setLanguages([
      ...languages,
      value,
    ]);

    setLanguageInput('');
  };

  // ─────────────────────────────────────────────────────────────
  // REMOVE LANGUAGE
  // ─────────────────────────────────────────────────────────────

  const removeLanguage = (
    languageToRemove: string
  ) => {
    setLanguages(
      languages.filter(
        (language) =>
          language !== languageToRemove
      )
    );
  };

  // ─────────────────────────────────────────────────────────────
  // SAVE GENERAL PROFILE
  // ─────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsLoading(true);

    try {
      await upsertProfile({
        id: user.id,

        full_name:
          fullName.trim(),

        ...(profile.account_type === 'expert'
          ? {
              country:
                country.trim(),
            }
          : {}),
      });

      if (
        profile.account_type ===
        'company'
      ) {
        await upsertCompanyProfile({
          id: user.id,

          company_name:
            companyName.trim(),

          website:
            website.trim(),
        });
      }

      await refreshProfile();

      toast({
        title: 'Profile updated',
        description:
          'Your IUVAI profile has been updated successfully.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',

        title:
          'Update failed',

        description:
          e?.message ||
          'Unable to update your profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SAVE EXPERT PROFILE
  // ─────────────────────────────────────────────────────────────

  const handleSaveExpertProfile =
    async () => {
      if (!user || !isExpert) return;

      setIsExpertLoading(true);

      try {
        const parsedYears =
          yearsExperience.trim()
            ? Number(
                yearsExperience
              )
            : null;

        const parsedAvailability =
          availabilityHours.trim()
            ? Number(
                availabilityHours
              )
            : null;

        if (
          parsedYears !== null &&
          (
            Number.isNaN(
              parsedYears
            ) ||
            parsedYears < 0
          )
        ) {
          throw new Error(
            'Years of experience must be a valid non-negative number.'
          );
        }

        if (
          parsedAvailability !== null &&
          (
            Number.isNaN(
              parsedAvailability
            ) ||
            parsedAvailability < 0
          )
        ) {
          throw new Error(
            'Availability must be a valid non-negative number.'
          );
        }

        await upsertExpertProfile({
          id: user.id,

          primary_field:
            primaryField.trim() ||
            null,

          specialization:
            specialization.trim() ||
            null,

          years_experience:
            parsedYears,

          highest_qualification:
            highestQualification.trim() ||
            null,

          skills:
            skills.length > 0
              ? skills
              : [],

          languages:
            languages.length > 0
              ? languages
              : [],

          previous_ai_experience:
            previousAIExperience.trim() ||
            null,

          availability_hours:
            parsedAvailability,
        });

        toast({
          title:
            'Expert profile updated',

          description:
            'Your expertise information has been saved successfully.',
        });
      } catch (e: any) {
        toast({
          variant: 'destructive',

          title:
            'Update failed',

          description:
            e?.message ||
            'Unable to update your expert profile.',
        });
      } finally {
        setIsExpertLoading(false);
      }
    };

  // ─────────────────────────────────────────────────────────────
  // UPLOAD CERTIFICATE
  // ─────────────────────────────────────────────────────────────

  const handleCertificateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    // Reset input so selecting the same
    // file again triggers change.
    event.target.value = '';

    if (!file || !user) return;

    setIsCertificateLoading(true);

    try {
      const path =
        await uploadCertificate(
          user.id,
          file
        );

      setCertificatePath(path);

      setCertificateFileName(
        file.name
      );

      setCertificateStatus(
        'pending'
      );

      toast({
        title:
          'Certificate uploaded',

        description:
          'Your certificate has been uploaded and is awaiting verification.',
      });
    } catch (e: any) {
      console.error(
        'CERTIFICATE UPLOAD ERROR:',
        e
      );

      toast({
        variant: 'destructive',

        title:
          'Certificate upload failed',

        description:
          e?.message ||
          'Unable to upload your certificate.',
      });
    } finally {
      setIsCertificateLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DELETE CERTIFICATE
  // ─────────────────────────────────────────────────────────────

  const handleDeleteCertificate =
    async () => {
      if (!user) return;

      setIsCertificateLoading(true);

      try {
        await deleteCertificate(
          user.id
        );

        setCertificatePath(
          null
        );

        setCertificateFileName(
          null
        );

        setCertificateStatus(
          'pending'
        );

        toast({
          title:
            'Certificate removed',

          description:
            'Your medical certificate has been removed.',
        });
      } catch (e: any) {
        toast({
          variant: 'destructive',

          title:
            'Unable to remove certificate',

          description:
            e?.message ||
            'Something went wrong while removing the certificate.',
        });
      } finally {
        setIsCertificateLoading(false);
      }
    };

  // ─────────────────────────────────────────────────────────────
  // PASSWORD
  // ─────────────────────────────────────────────────────────────

  const handleChangePassword =
    async () => {
      if (
        !newPassword ||
        newPassword.length < 8
      ) {
        toast({
          variant: 'destructive',

          title:
            'Invalid password',

          description:
            'Your password must contain at least 8 characters.',
        });

        return;
      }

      setIsPasswordLoading(
        true
      );

      try {
        const {
          error,
        } =
          await updatePassword(
            newPassword
          );

        if (error)
          throw error;

        toast({
          title:
            'Password updated',

          description:
            'Your password has been changed successfully.',
        });

        setNewPassword('');
      } catch (e: any) {
        toast({
          variant: 'destructive',

          title:
            'Password update failed',

          description:
            e?.message ||
            'Unable to update your password.',
        });
      } finally {
        setIsPasswordLoading(
          false
        );
      }
    };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />

          Loading IUVAI...
        </div>
      </div>
    );
  }

  const isExpert =
    profile.account_type ===
    'expert';

  // ─────────────────────────────────────────────────────────────
  // CERTIFICATE STATUS UI
  // ─────────────────────────────────────────────────────────────

  const certificateStatusLabel =
    certificateStatus ===
    'approved'
      ? 'Verified'
      : certificateStatus ===
        'declined'
      ? 'Declined'
      : 'Pending Review';

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl space-y-8">

        {/* ─────────────────────────────────────────────────────
            HEADER
        ───────────────────────────────────────────────────── */}

        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_45%)] pointer-events-none" />

          <div className="relative flex items-start gap-5">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>

            <div>

              <div className="flex items-center gap-2 mb-2">

                <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
                  IUVAI
                </span>

                <span className="h-px w-8 bg-primary/40" />

                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Account Control
                </span>

              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Account Settings
              </h2>

              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                Manage your identity, expertise,
                credentials, and security
                across the IUVAI network.
              </p>

            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
            PROFILE INFORMATION
        ───────────────────────────────────────────────────── */}

        <Card className="border-primary/10 bg-card/80">

          <CardHeader className="border-b border-border/60">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">

                {isExpert ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}

              </div>

              <div>

                <CardTitle className="text-lg">
                  Profile Information
                </CardTitle>

                <CardDescription>
                  Manage the information associated
                  with your IUVAI account.
                </CardDescription>

              </div>

            </div>

          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            {/* Email */}

            <div className="space-y-2">

              <Label
                htmlFor="email"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>

              <Input
                id="email"
                value={
                  user?.email || ''
                }
                disabled
                className="h-11 bg-muted/30 border-border/60"
              />

              <p className="text-xs text-muted-foreground">
                Your email address is managed
                by the authentication system
                and cannot be changed here.
              </p>

            </div>

            {/* Full Name */}

            <div className="space-y-2">

              <Label
                htmlFor="fullName"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Full Name
              </Label>

              <Input
                id="fullName"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="h-11"
                placeholder="Your full name"
              />

            </div>

            {/* Country */}

            <div className="space-y-2">

              <Label
                htmlFor="country"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Country
              </Label>

              <Input
                id="country"
                value={country}
                onChange={(e) =>
                  setCountry(
                    e.target.value
                  )
                }
                className="h-11"
                placeholder="Your country"
              />

            </div>

            {/* Company */}

            {!isExpert && (
              <div className="space-y-6">

                <div className="h-px bg-border/60" />

                <div>

                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-1">
                    Organization
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Information about your organization.
                  </p>

                </div>

                <div className="space-y-2">

                  <Label
                    htmlFor="companyName"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Company Name
                  </Label>

                  <Input
                    id="companyName"
                    value={
                      companyName
                    }
                    onChange={(e) =>
                      setCompanyName(
                        e.target.value
                      )
                    }
                    className="h-11"
                    placeholder="Company name"
                  />

                </div>

                <div className="space-y-2">

                  <Label
                    htmlFor="website"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Website
                  </Label>

                  <Input
                    id="website"
                    value={
                      website
                    }
                    onChange={(e) =>
                      setWebsite(
                        e.target.value
                      )
                    }
                    className="h-11"
                    placeholder="https://example.com"
                  />

                </div>

              </div>
            )}

            <div className="pt-2">

              <Button
                onClick={
                  handleSaveProfile
                }
                disabled={
                  isLoading
                }
                className="h-11 px-6"
              >

                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {isLoading
                  ? 'Saving...'
                  : 'Save Changes'}

              </Button>

            </div>

          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────
            EXPERT PROFILE
        ───────────────────────────────────────────────────── */}

        {isExpert && (
          <Card className="border-primary/10 bg-card/80">

            <CardHeader className="border-b border-border/60">

              <div>

                <CardTitle className="text-lg">
                  Expert Profile
                </CardTitle>

                <CardDescription>
                  Keep your expertise profile
                  current so IUVAI can match
                  you with relevant projects.
                </CardDescription>

              </div>

            </CardHeader>

            <CardContent className="space-y-6 pt-6">

              {/* Primary Field */}

              <div className="space-y-2">

                <Label
                  htmlFor="primaryField"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Primary Field
                </Label>

                <Input
                  id="primaryField"
                  value={
                    primaryField
                  }
                  onChange={(e) =>
                    setPrimaryField(
                      e.target.value
                    )
                  }
                  className="h-11"
                  placeholder="e.g. Medicine, Law, Finance, Engineering"
                />

              </div>

              {/* Specialization */}

              <div className="space-y-2">

                <Label
                  htmlFor="specialization"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Specialization
                </Label>

                <Input
                  id="specialization"
                  value={
                    specialization
                  }
                  onChange={(e) =>
                    setSpecialization(
                      e.target.value
                    )
                  }
                  className="h-11"
                  placeholder="e.g. Neurosurgery"
                />

              </div>

              {/* Years + Availability */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div className="space-y-2">

                  <Label
                    htmlFor="yearsExperience"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Years of Experience
                  </Label>

                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    value={
                      yearsExperience
                    }
                    onChange={(e) =>
                      setYearsExperience(
                        e.target.value
                      )
                    }
                    className="h-11"
                    placeholder="e.g. 5"
                  />

                </div>

                <div className="space-y-2">

                  <Label
                    htmlFor="availabilityHours"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Weekly Availability
                  </Label>

                  <Input
                    id="availabilityHours"
                    type="number"
                    min="0"
                    value={
                      availabilityHours
                    }
                    onChange={(e) =>
                      setAvailabilityHours(
                        e.target.value
                      )
                    }
                    className="h-11"
                    placeholder="Hours per week"
                  />

                </div>

              </div>

              {/* Highest Qualification */}

              <div className="space-y-2">

                <Label
                  htmlFor="highestQualification"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Highest Qualification
                </Label>

                <Input
                  id="highestQualification"
                  value={
                    highestQualification
                  }
                  onChange={(e) =>
                    setHighestQualification(
                      e.target.value
                    )
                  }
                  className="h-11"
                  placeholder="e.g. Master's Degree"
                />

              </div>

              {/* Skills */}

              <div className="space-y-3">

                <div>

                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Skills
                  </Label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add the skills you can contribute
                    to AI training and evaluation projects.
                  </p>

                </div>

                <div className="flex gap-2">

                  <Input
                    value={
                      skillInput
                    }
                    onChange={(e) =>
                      setSkillInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        'Enter'
                      ) {
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
                    onClick={
                      addSkill
                    }
                    className="h-11 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>

                </div>

                {skills.length >
                  0 && (
                  <div className="flex flex-wrap gap-2">

                    {skills.map(
                      (skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5"
                        >

                          <span className="text-sm">
                            {skill}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                skill
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Languages */}

              <div className="space-y-3">

                <div>

                  <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Languages
                  </Label>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Add the languages in which
                    you can work professionally.
                  </p>

                </div>

                <div className="flex gap-2">

                  <Input
                    value={
                      languageInput
                    }
                    onChange={(e) =>
                      setLanguageInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        'Enter'
                      ) {
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
                    onClick={
                      addLanguage
                    }
                    className="h-11 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>

                </div>

                {languages.length >
                  0 && (
                  <div className="flex flex-wrap gap-2">

                    {languages.map(
                      (language) => (
                        <div
                          key={language}
                          className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5"
                        >

                          <span className="text-sm">
                            {language}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeLanguage(
                                language
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Previous AI Experience */}

              <div className="space-y-2">

                <Label
                  htmlFor="previousAIExperience"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Previous AI Experience
                </Label>

                <Textarea
                  id="previousAIExperience"
                  value={
                    previousAIExperience
                  }
                  onChange={(e) =>
                    setPreviousAIExperience(
                      e.target.value
                    )
                  }
                  placeholder="Describe any previous experience with AI training, evaluation, data annotation, model testing, or related work."
                  className="min-h-[120px]"
                />

              </div>

              {/* Save */}

              <div className="pt-2">

                <Button
                  onClick={
                    handleSaveExpertProfile
                  }
                  disabled={
                    isExpertLoading
                  }
                  className="h-11 px-6"
                >

                  {isExpertLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  {isExpertLoading
                    ? 'Saving...'
                    : 'Save Expert Profile'}

                </Button>

              </div>

            </CardContent>
          </Card>
        )}

        {/* ─────────────────────────────────────────────────────
            MEDICAL CERTIFICATE
        ───────────────────────────────────────────────────── */}

        {isExpert && (
          <Card className="border-primary/10 bg-card/80">

            <CardHeader className="border-b border-border/60">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>

                <div>

                  <CardTitle className="text-lg">
                    Professional Credential
                  </CardTitle>

                  <CardDescription>
                    Upload your medical certificate
                    so IUVAI can verify your professional
                    credentials.
                  </CardDescription>

                </div>

              </div>

            </CardHeader>

            <CardContent className="space-y-5 pt-6">

              {/* Existing certificate */}

              {certificatePath ? (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4">

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">

                        <FileText className="h-5 w-5 text-primary" />

                      </div>

                      <div>

                        <p className="text-sm font-medium break-all">
                          {certificateFileName ||
                            'Medical certificate'}
                        </p>

                        <div className="mt-2 flex items-center gap-2">

                          {certificateStatus ===
                          'approved' ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />

                              <span className="text-xs text-green-500">
                                {certificateStatusLabel}
                              </span>
                            </>
                          ) : certificateStatus ===
                            'declined' ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />

                              <span className="text-xs text-destructive">
                                {certificateStatusLabel}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-muted-foreground" />

                              <span className="text-xs text-muted-foreground">
                                {certificateStatusLabel}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={
                        handleDeleteCertificate
                      }
                      disabled={
                        isCertificateLoading
                      }
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >

                      {isCertificateLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                    </Button>

                  </div>

                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">

                    <FileText className="h-6 w-6 text-primary" />

                  </div>

                  <p className="mt-4 text-sm font-medium">
                    No medical certificate uploaded
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload a PDF, JPG, PNG, or WebP
                    certificate.
                  </p>

                </div>
              )}

              {/* Upload */}

              <div className="space-y-3">

                <Label
                  htmlFor="medicalCertificate"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  {certificatePath
                    ? 'Replace Certificate'
                    : 'Upload Certificate'}
                </Label>

                <Input
                  id="medicalCertificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={
                    handleCertificateUpload
                  }
                  disabled={
                    isCertificateLoading
                  }
                  className="cursor-pointer"
                />

                <p className="text-xs text-muted-foreground">
                  Maximum file size: 10 MB.
                  Your certificate is stored
                  privately.
                </p>

              </div>

              {certificateStatus ===
                'declined' && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">

                  <div className="flex gap-3">

                    <AlertCircle className="h-5 w-5 text-destructive shrink-0" />

                    <div>

                      <p className="text-sm font-medium">
                        Certificate verification
                        declined
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Please upload a new valid
                        professional certificate.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </CardContent>
          </Card>
        )}

        {/* ─────────────────────────────────────────────────────
            SECURITY
        ───────────────────────────────────────────────────── */}

        <Card className="border-primary/10 bg-card/80">

          <CardHeader className="border-b border-border/60">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">

                <Lock className="h-4 w-4 text-primary" />

              </div>

              <div>

                <CardTitle className="text-lg">
                  Security
                </CardTitle>

                <CardDescription>
                  Update your account password
                  and maintain secure access.
                </CardDescription>

              </div>

            </div>

          </CardHeader>

          <CardContent className="space-y-6 pt-6">

            <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4">

              <div className="flex gap-3">

                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />

                <div>

                  <p className="text-sm font-medium">
                    Keep your account secure
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Use a strong password that
                    you do not reuse on other
                    services.
                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-2">

              <Label
                htmlFor="newPassword"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                New Password
              </Label>

              <Input
                id="newPassword"
                type="password"
                value={
                  newPassword
                }
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="At least 8 characters"
                className="h-11"
              />

              <p className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </p>

            </div>

            <Button
              onClick={
                handleChangePassword
              }
              disabled={
                isPasswordLoading ||
                !newPassword
              }
              variant="outline"
              className="h-11"
            >

              {isPasswordLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {!isPasswordLoading && (
                <Lock className="mr-2 h-4 w-4" />
              )}

              {isPasswordLoading
                ? 'Updating...'
                : 'Update Password'}

            </Button>

          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────
            ACCOUNT STATUS
        ───────────────────────────────────────────────────── */}

        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Account Type
              </p>

              <p className="mt-1 text-sm font-medium capitalize">
                {profile.account_type}
              </p>

            </div>

            <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1">

              <span className="text-xs font-mono uppercase tracking-wider text-primary">
                Active
              </span>

            </div>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

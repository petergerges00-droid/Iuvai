import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import {
  upsertProfile,
  upsertExpertProfile,
  upsertCompanyProfile,
  AccountType,
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserCircle2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
const expertSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  country: z.string().min(2, 'Country is required'),
  primary_field: z.string().min(2, 'Primary field is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  years_experience: z.coerce.number().min(0).max(100),
  highest_qualification: z.string().min(1, 'Required'),
  skills: z.string().min(1, 'Enter at least one skill'),
  languages: z.string().min(1, 'Enter at least one language'),
  previous_ai_experience: z.string(),
  availability_hours: z.coerce.number().min(0).max(168),
});
const companySchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  company_name: z.string().min(2, 'Company name is required'),
  website: z.string().url('Must be a valid URL'),
  industry: z.string().min(2, 'Industry is required'),
  company_description: z
    .string()
    .min(10, 'Provide a short description'),
  company_size: z.string().min(1, 'Required'),
});
export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] =
    useState<AccountType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /*
   * If onboarding is already complete,
   * redirect to the correct workspace.
   */
  useEffect(() => {
    if (profile?.account_type === 'expert') {
      setLocation('/dashboard');
    } else if (profile?.account_type === 'company') {
      setLocation('/company-dashboard');
    }
  }, [profile, setLocation]);
  const expertForm = useForm<z.infer<typeof expertSchema>>({
    resolver: zodResolver(expertSchema),
    defaultValues: {
      full_name: '',
      country: '',
      primary_field: '',
      specialization: '',
      years_experience: 0,
      highest_qualification: '',
      skills: '',
      languages: '',
      previous_ai_experience: '',
      availability_hours: 10,
    },
  });
  const companyForm = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      full_name: '',
      company_name: '',
      website: '',
      industry: '',
      company_description: '',
      company_size: '',
    },
  });
  if (!user) return null;
  const handleTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };
  const onExpertSubmit = async (
    values: z.infer<typeof expertSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await upsertProfile({
        id: user.id,
        full_name: values.full_name,
        account_type: 'expert',
        country: values.country,
      });
      await upsertExpertProfile({
        id: user.id,
        primary_field: values.primary_field,
        specialization: values.specialization,
        years_experience: values.years_experience,
        highest_qualification:
          values.highest_qualification,
        skills: values.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        languages: values.languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        previous_ai_experience:
          values.previous_ai_experience,
        availability_hours:
          values.availability_hours,
      });
      await refreshProfile();
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unable to complete profile',
        description:
          error?.message ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const onCompanySubmit = async (
    values: z.infer<typeof companySchema>
  ) => {
    setIsSubmitting(true);
    try {
      await upsertProfile({
        id: user.id,
        full_name: values.full_name,
        account_type: 'company',
      });
      await upsertCompanyProfile({
        id: user.id,
        company_name: values.company_name,
        website: values.website,
        industry: values.industry,
        company_description:
          values.company_description,
        company_size: values.company_size,
      });
      await refreshProfile();
      setLocation('/company-dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unable to complete profile',
        description:
          error?.message ||
          'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* =====================================================
          FUTURISTIC BACKGROUND
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>
      {/* =====================================================
          TOP BAR
      ====================================================== */}
      <header className="relative z-10 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => setLocation('/')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-[0.22em]">
              IUVAI
            </span>
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Secure onboarding
            </span>
          </div>
        </div>
      </header>
      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
            IUVAI NETWORK / INITIALIZATION
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {step === 1
              ? 'Enter the network.'
              : 'Build your profile.'}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
            {step === 1
              ? 'Tell us how you plan to participate in the human intelligence infrastructure powering tomorrow’s AI.'
              : accountType === 'expert'
                ? 'Tell us about your expertise so we can connect you with the right opportunities.'
                : 'Tell us about your organization so we can connect you with the right experts.'}
          </p>
          {/* Progress */}
          <div className="mx-auto mt-8 flex max-w-xs items-center gap-3">
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= 1
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
            <div
              className={`h-1 flex-1 rounded-full transition-colors ${
                step >= 2
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          </div>
          <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>01 / Account</span>
            <span>02 / Profile</span>
          </div>
        </div>
        {/* =====================================================
            STEP 1
        ====================================================== */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="account-type"
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{ duration: 0.25 }}
              className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2"
            >
              {/* EXPERT */}
              <button
                type="button"
                onClick={() =>
                  handleTypeSelect('expert')
                }
                className="group text-left"
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-transform duration-300 group-hover:scale-105">
                        <UserCircle2 className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-primary">
                      HUMAN EXPERT
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      I am an Expert
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Contribute your professional knowledge to
                      evaluate, train, and improve AI systems.
                    </p>
                    <div className="mt-7 space-y-3 border-t border-border/50 pt-5">
                      {[
                        'Apply your domain expertise',
                        'Access relevant AI projects',
                        'Build your expert profile',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-7 text-sm font-medium text-primary">
                      Continue as Expert
                      <ArrowRight className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
              {/* COMPANY */}
              <button
                type="button"
                onClick={() =>
                  handleTypeSelect('company')
                }
                className="group text-left"
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                  <div className="relative">
                    <div className="mb-7 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-transform duration-300 group-hover:scale-105">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-primary">
                      ORGANIZATION
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      I am a Company
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Connect with verified human experts to
                      build, evaluate, and improve your AI systems.
                    </p>
                    <div className="mt-7 space-y-3 border-t border-border/50 pt-5">
                      {[
                        'Find specialized experts',
                        'Build expert-powered projects',
                        'Scale AI development',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-7 text-sm font-medium text-primary">
                      Continue as Company
                      <ArrowRight className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          )}
          {/* =====================================================
              EXPERT FORM
          ====================================================== */}
          {step === 2 && accountType === 'expert' && (
            <motion.div
              key="expert-form"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-3xl"
            >
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-primary/[0.03] backdrop-blur-xl">
                <div className="border-b border-border/60 bg-muted/20 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <UserCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Expert profile
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Professional information
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <Form {...expertForm}>
                    <form
                      onSubmit={expertForm.handleSubmit(
                        onExpertSubmit
                      )}
                      className="space-y-8"
                    >
                      {/* PERSONAL */}
                      <section>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold">
                            Personal information
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Basic information used to create your expert profile.
                          </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField
                            control={expertForm.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Full Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expertForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Country
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </section>
                      <div className="h-px bg-border/60" />
                      {/* EXPERTISE */}
                      <section>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold">
                            Professional expertise
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Help us understand where your expertise is strongest.
                          </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField
                            control={expertForm.control}
                            name="primary_field"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Primary Field
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Medicine, Law, Linguistics..."
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expertForm.control}
                            name="specialization"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Specialization
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Neurosurgery, IP Law..."
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expertForm.control}
                            name="highest_qualification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Highest Qualification
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select qualification" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="phd">
                                      PhD
                                    </SelectItem>
                                    <SelectItem value="md">
                                      MD
                                    </SelectItem>
                                    <SelectItem value="jd">
                                      JD
                                    </SelectItem>
                                    <SelectItem value="masters">
                                      Master's Degree
                                    </SelectItem>
                                    <SelectItem value="bachelors">
                                      Bachelor's Degree
                                    </SelectItem>
                                    <SelectItem value="other">
                                      Other
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={expertForm.control}
                            name="years_experience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Years of Experience
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </section>
                      <div className="h-px bg-border/60" />
                      {/* SKILLS */}
                      <section className="space-y-5">
                        <div>
                          <h3 className="text-sm font-semibold">
                            Capabilities
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            These help us match you with relevant projects.
                          </p>
                        </div>
                        <FormField
                          control={expertForm.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Skills
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Clinical diagnosis, Research, Python..."
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <p className="text-[11px] text-muted-foreground">
                                Separate multiple skills with commas.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expertForm.control}
                          name="languages"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Languages
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="English, Arabic, Spanish..."
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <p className="text-[11px] text-muted-foreground">
                                Separate multiple languages with commas.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expertForm.control}
                          name="previous_ai_experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Previous AI Experience
                                <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                                  Optional
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe any previous experience with AI evaluation, data annotation, RLHF, model testing, or related work."
                                  {...field}
                                  className="min-h-[110px] resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expertForm.control}
                          name="availability_hours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Weekly Availability
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="168"
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <p className="text-[11px] text-muted-foreground">
                                Approximate hours available per week.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      {/* ACTIONS */}
                      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStep(1)}
                          disabled={isSubmitting}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="min-w-[180px]"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating profile...
                            </>
                          ) : (
                            <>
                              Complete Profile
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </motion.div>
          )}
          {/* =====================================================
              COMPANY FORM
          ====================================================== */}
          {step === 2 && accountType === 'company' && (
            <motion.div
              key="company-form"
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-3xl"
            >
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-primary/[0.03] backdrop-blur-xl">
                <div className="border-b border-border/60 bg-muted/20 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        Organization profile
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Company information
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <Form {...companyForm}>
                    <form
                      onSubmit={companyForm.handleSubmit(
                        onCompanySubmit
                      )}
                      className="space-y-8"
                    >
                      {/* ACCOUNT OWNER */}
                      <section>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold">
                            Account owner
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Information about the person managing this account.
                          </p>
                        </div>
                        <FormField
                          control={companyForm.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      <div className="h-px bg-border/60" />
                      {/* COMPANY DETAILS */}
                      <section>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold">
                            Company details
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tell us about the organization you represent.
                          </p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField
                            control={companyForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Company Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={companyForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Website
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://example.com"
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={companyForm.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Industry
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Healthcare AI, Robotics..."
                                    {...field}
                                    className="h-11"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={companyForm.control}
                            name="company_size"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Company Size
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11">
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1-10">
                                      1–10 employees
                                    </SelectItem>
                                    <SelectItem value="11-50">
                                      11–50 employees
                                    </SelectItem>
                                    <SelectItem value="51-200">
                                      51–200 employees
                                    </SelectItem>
                                    <SelectItem value="200+">
                                      200+ employees
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </section>
                      <div className="h-px bg-border/60" />
                      {/* DESCRIPTION */}
                      <section>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold">
                            About your organization
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            A short description helps us understand your needs.
                          </p>
                        </div>
                        <FormField
                          control={companyForm.control}
                          name="company_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Company Description
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="What does your company build, and how do you use AI?"
                                  {...field}
                                  className="min-h-[130px] resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </section>
                      {/* ACTIONS */}
                      <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setStep(1)}
                          disabled={isSubmitting}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="min-w-[180px]"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating profile...
                            </>
                          ) : (
                            <>
                              Complete Profile
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* =====================================================
            FOOTER
        ====================================================== */}
        <div className="mx-auto mt-12 max-w-xl text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your information is securely stored
          </div>
          <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
            IUVAI connects human expertise with the development
            of next-generation artificial intelligence.
          </p>
        </div>
      </main>
    </div>
  );
}

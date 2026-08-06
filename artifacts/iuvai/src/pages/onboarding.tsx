import { useState } from 'react';
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
  AccountType 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Briefcase, Building2, UserCircle2 } from 'lucide-react';

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
  company_description: z.string().min(10, 'Provide a short description'),
  company_size: z.string().min(1, 'Required'),
});

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!user) return null; // Should be protected by router

  const handleTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };

  const onExpertSubmit = async (values: z.infer<typeof expertSchema>) => {
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
        highest_qualification: values.highest_qualification,
        skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean),
        languages: values.languages.split(',').map((s) => s.trim()).filter(Boolean),
        previous_ai_experience: values.previous_ai_experience,
        availability_hours: values.availability_hours,
      });

      await refreshProfile();
      setLocation('/dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCompanySubmit = async (values: z.infer<typeof companySchema>) => {
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
        company_description: values.company_description,
        company_size: values.company_size,
      });

      await refreshProfile();
      setLocation('/company-dashboard');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-primary-foreground rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {step === 1 ? 'Welcome to IUVAI' : 'Complete your profile'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === 1 ? 'How do you plan to use the platform?' : 'Tell us a bit about yourself.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto"
            >
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                onClick={() => handleTypeSelect('expert')}
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <UserCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">I am an Expert</h3>
                    <p className="text-sm text-muted-foreground">
                      I want to provide my domain expertise to evaluate and train AI systems.
                    </p>
                  </div>
                  <Button variant="ghost" className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Continue as Expert <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group"
                onClick={() => handleTypeSelect('company')}
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">I am an AI Company</h3>
                    <p className="text-sm text-muted-foreground">
                      I want to find verified human experts to help build our AI models.
                    </p>
                  </div>
                  <Button variant="ghost" className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    Continue as Company <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && accountType === 'expert' && (
            <motion.div
              key="step2-expert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border rounded-xl p-8 shadow-sm"
            >
              <Form {...expertForm}>
                <form onSubmit={expertForm.handleSubmit(onExpertSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={expertForm.control} name="full_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="h-px bg-border my-8" />
                  <h3 className="text-lg font-medium text-foreground mb-4">Professional Expertise</h3>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={expertForm.control} name="primary_field" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Field</FormLabel>
                        <FormControl><Input placeholder="e.g. Medicine, Law, Linguistics" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="specialization" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl><Input placeholder="e.g. Oncology, IP Law" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="highest_qualification" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Qualification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="md">MD</SelectItem>
                            <SelectItem value="jd">JD</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="years_experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="space-y-6 mt-6">
                    <FormField control={expertForm.control} name="skills" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl><Input placeholder="Comma separated (e.g. Clinical diagnosis, Research, Python)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="languages" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages</FormLabel>
                        <FormControl><Input placeholder="Comma separated (e.g. English, Spanish)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="previous_ai_experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous AI Experience (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Have you worked on AI data labeling, evaluation, or RLHF before?" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={expertForm.control} name="availability_hours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly Availability (Hours)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Complete Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 2 && accountType === 'company' && (
            <motion.div
              key="step2-company"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border rounded-xl p-8 shadow-sm"
            >
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-8">
                  
                  <FormField control={companyForm.control} name="full_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="h-px bg-border my-8" />
                  <h3 className="text-lg font-medium text-foreground mb-4">Company Details</h3>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={companyForm.control} name="company_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={companyForm.control} name="website" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl><Input placeholder="https://" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={companyForm.control} name="industry" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl><Input placeholder="e.g. Healthcare AI, Autonomous Driving" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={companyForm.control} name="company_size" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="200+">200+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={companyForm.control} name="company_description" render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel>Company Description</FormLabel>
                      <FormControl><Textarea placeholder="What does your company build?" className="h-24" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex justify-between items-center pt-6">
                    <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isSubmitting}>Back</Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Complete Profile
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

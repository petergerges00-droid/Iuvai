import { useState } from ‘react’;
import { useLocation, Link } from ‘wouter’;
import { useForm } from ‘react-hook-form’;
import { zodResolver } from ‘@hookform/resolvers/zod’;
import * as z from ‘zod’;
import {
ArrowLeft,
ArrowUpRight,
Briefcase,
CheckCircle2,
FileText,
Loader2,
Sparkles,
} from ‘lucide-react’;

import AppLayout from ‘@/components/layout/app-layout’;
import { useAuth } from ‘@/hooks/use-auth’;
import {
createProject,
Project,
} from ‘@/lib/supabase’;

import { Button } from ‘@/components/ui/button’;
import { Input } from ‘@/components/ui/input’;
import { Textarea } from ‘@/components/ui/textarea’;
import {
Form,
FormControl,
FormField,
FormItem,
FormLabel,
FormMessage,
} from ‘@/components/ui/form’;
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from ‘@/components/ui/select’;
import { useToast } from ‘@/hooks/use-toast’;

const formSchema = z.object({
title: z
.string()
.min(3, ‘Project title must be at least 3 characters’)
.max(120, ‘Project title is too long’),

description: z
.string()
.min(
20,
‘Please provide at least 20 characters describing the project’
)
.max(
5000,
‘Project description is too long’
),

primaryField: z
.string()
.min(1, ‘Please select a primary field’),

specialization: z
.string()
.max(
200,
‘Specialization is too long’
)
.optional(),

requiredSkills: z
.string()
.max(
1000,
‘Required skills are too long’
)
.optional(),

projectType: z
.string()
.min(1, ‘Please select a project type’),

budget: z
.string()
.max(
100,
‘Budget information is too long’
)
.optional(),

duration: z
.string()
.min(
1,
‘Please select the expected duration’
),
});

type FormValues = z.infer;

const primaryFields = [
‘Medicine’,
‘Law’,
‘Finance’,
‘Engineering’,
‘Computer Science’,
‘Data Science’,
‘Mathematics’,
‘Physics’,
‘Chemistry’,
‘Biology’,
‘Psychology’,
‘Education’,
‘Business’,
‘Other’,
];

const projectTypes = [
{
value: ‘ai_evaluation’,
label: ‘AI model evaluation’,
},
{
value: ‘data_annotation’,
label: ‘Data annotation’,
},
{
value: ‘expert_review’,
label: ‘Expert review’,
},
{
value: ‘rlhf’,
label: ‘RLHF / preference ranking’,
},
{
value: ‘domain_qa’,
label: ‘Domain-specific QA’,
},
{
value: ‘content_generation’,
label: ‘Expert content generation’,
},
{
value: ‘other’,
label: ‘Other’,
},
];

const durations = [
{
value: ‘less_than_1_week’,
label: ‘Less than 1 week’,
},
{
value: ‘1_2_weeks’,
label: ‘1–2 weeks’,
},
{
value: ‘2_4_weeks’,
label: ‘2–4 weeks’,
},
{
value: ‘1_3_months’,
label: ‘1–3 months’,
},
{
value: ‘3_plus_months’,
label: ‘3+ months’,
},
];

export default function CreateProject() {
const { user } = useAuth();
const [, setLocation] = useLocation();
const { toast } = useToast();

const [isSubmitting, setIsSubmitting] =
useState(false);

const form = useForm({
resolver: zodResolver(formSchema),
defaultValues: {
title: ‘’,
description: ‘’,
primaryField: ‘’,
specialization: ‘’,
requiredSkills: ‘’,
projectType: ‘’,
budget: ‘’,
duration: ‘’,
},
});

async function onSubmit(values: FormValues) {
if (!user?.id) {
toast({
variant: ‘destructive’,
title: ‘Authentication required’,
description:
‘Please sign in again before creating a project.’,
});

  setLocation('/login');
  return;
}
setIsSubmitting(true);
try {
  const requiredSkills = values.requiredSkills
    ? values.requiredSkills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];
  const project = await createProject({
    company_id: user.id,
    title: values.title.trim(),
    description: values.description.trim(),
    primary_field: values.primaryField,
    specialization:
      values.specialization?.trim() || null,
    required_skills:
      requiredSkills.length > 0
        ? requiredSkills
        : null,
    project_type: values.projectType,
    budget:
      values.budget?.trim() || null,
    duration: values.duration,
    status: 'draft',
  });
  toast({
    title: 'Project created',
    description:
      'Your project has been saved as a draft.',
  });
  setLocation(
    `/company-dashboard/projects/${project.id}`
  );
} catch (error) {
  console.error(
    'CREATE PROJECT ERROR:',
    error
  );
  toast({
    variant: 'destructive',
    title: 'Unable to create project',
    description:
      error instanceof Error
        ? error.message
        : 'Something went wrong while creating the project.',
  });
} finally {
  setIsSubmitting(false);
}

}

return (
{/* HEADER */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/40">
          Company workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Create a project
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the expertise your AI project needs.
        </p>
      </div>
    </div>
    {/* INTRO */}
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.045]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-[70px]" />
      <div className="relative flex gap-4 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">
            Tell us what your project needs
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Provide enough detail for IUVAI to understand
            the expertise, specialization, and skills
            required. You can refine the project later.
          </p>
        </div>
      </div>
    </section>
    {/* FORM */}
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* BASIC INFORMATION */}
        <section className="rounded-2xl border border-border/60 bg-card/40">
          <div className="border-b border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Step 01
                </p>
                <h2 className="mt-0.5 text-sm font-semibold">
                  Project information
                </h2>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-5 sm:p-6">
            {/* TITLE */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Medical AI response evaluation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what the experts will be doing, what the AI system is being evaluated or trained on, and what a successful project outcome looks like."
                      className="min-h-36 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-[11px] text-muted-foreground/50">
                    The more specific the description,
                    the better we can match your project
                    with relevant experts.
                  </p>
                </FormItem>
              )}
            />
            <div className="grid gap-6 md:grid-cols-2">
              {/* FIELD */}
              <FormField
                control={form.control}
                name="primaryField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary field
                    </FormLabel>
                    <Select
                      onValueChange={
                        field.onChange
                      }
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a field" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {primaryFields.map(
                          (fieldName) => (
                            <SelectItem
                              key={fieldName}
                              value={fieldName}
                            >
                              {fieldName}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* SPECIALIZATION */}
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Specialization
                      <span className="ml-1 text-muted-foreground/50">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Neurosurgery, cardiology, tax law..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </section>
        {/* EXPERTISE */}
        <section className="rounded-2xl border border-border/60 bg-card/40">
          <div className="border-b border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Step 02
                </p>
                <h2 className="mt-0.5 text-sm font-semibold">
                  Expertise requirements
                </h2>
              </div>
            </div>
          </div>
          <div className="space-y-6 p-5 sm:p-6">
            {/* PROJECT TYPE */}
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project type
                  </FormLabel>
                  <Select
                    onValueChange={
                      field.onChange
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What kind of AI work is this?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectTypes.map(
                        (type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* SKILLS */}
            <FormField
              control={form.control}
              name="requiredSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Required skills
                    <span className="ml-1 text-muted-foreground/50">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. clinical reasoning, medical terminology, annotation, QA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-[11px] text-muted-foreground/50">
                    Separate multiple skills with commas.
                  </p>
                </FormItem>
              )}
            />
            {/* DURATION */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expected duration
                  </FormLabel>
                  <Select
                    onValueChange={
                      field.onChange
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How long will the project run?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map(
                        (duration) => (
                          <SelectItem
                            key={
                              duration.value
                            }
                            value={
                              duration.value
                            }
                          >
                            {duration.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        {/* COMMERCIAL */}
        <section className="rounded-2xl border border-border/60 bg-card/40">
          <div className="border-b border-border/60 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  Step 03
                </p>
                <h2 className="mt-0.5 text-sm font-semibold">
                  Budget
                </h2>
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Budget / compensation
                    <span className="ml-1 text-muted-foreground/50">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. $2,000 total or $35/hour"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-[11px] leading-5 text-muted-foreground/50">
                    You can leave this blank while
                    defining the project.
                  </p>
                </FormItem>
              )}
            />
          </div>
        </section>
        {/* SUBMIT */}
        <div className="flex flex-col-reverse gap-3 border-t border-border/50 pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/company-dashboard">
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="sm:min-w-[220px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating project
              </>
            ) : (
              <>
                Save project
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
    {/* FOOTER */}
    <div className="flex items-center justify-center gap-2 border-t border-border/40 pt-5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/35">
      <Sparkles className="h-3 w-3" />
      IUVAI · Human intelligence infrastructure
    </div>
  </div>
</AppLayout>

);
}

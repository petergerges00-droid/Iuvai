import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Workflow,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function AutomationRequest() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [industry, setIndustry] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.id) {
      setError('You must be signed in to create an automation project.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a project title.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe the workflow you want to automate.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('automation_projects')
        .insert({
          company_id: user.id,
          title: title.trim(),
          description: description.trim(),
          business_goal: businessGoal.trim() || null,
          industry: industry.trim() || null,
          budget: budget.trim() || null,
          timeline: timeline.trim() || null,
          status: 'pending',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(
          'AUTOMATION PROJECT CREATION ERROR:',
          insertError
        );

        setError(
          insertError.message ||
            'Unable to create the automation project.'
        );

        return;
      }

      if (!data?.id) {
        setError(
          'The project was created, but we could not open it.'
        );
        return;
      }

      setLocation(
        `/company-dashboard/automation/${data.id}`
      );
    } catch (err) {
      console.error(
        'AUTOMATION PROJECT CREATION ERROR:',
        err
      );

      setError(
        'Something went wrong while creating your project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Automation Request">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            setLocation('/company-dashboard')
          }
          className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>

        {/* HEADER */}

        <section>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Workflow className="h-5 w-5 text-primary" />
          </div>

          <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
            AI Automation
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Automate your workflow
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Tell us what you want to automate. IUVAI will
            review your workflow and help determine how an
            AI-powered system can be designed, built, tested,
            and deployed.
          </p>
        </section>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* PROJECT INFORMATION */}

          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">

            <div className="mb-6">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Project information
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                What are you trying to automate?
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Start with the problem rather than the
                technology. You don't need to know exactly how
                the automation should be built.
              </p>
            </div>

            <div className="space-y-5">

              {/* TITLE */}

              <div className="space-y-2">
                <Label htmlFor="title">
                  Project title
                </Label>

                <Input
                  id="title"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Automate customer support triage"
                  disabled={isSubmitting}
                />
              </div>

              {/* DESCRIPTION */}

              <div className="space-y-2">
                <Label htmlFor="description">
                  Describe the workflow
                </Label>

                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe what currently happens, who is involved, what tools are used, and what you would like the system to handle."
                  className="min-h-[140px] resize-y"
                  disabled={isSubmitting}
                />

                <p className="text-xs text-muted-foreground">
                  Don't worry about technical details. Explain
                  the workflow in your own words.
                </p>
              </div>

              {/* BUSINESS GOAL */}

              <div className="space-y-2">
                <Label htmlFor="business-goal">
                  What is the main business goal?
                </Label>

                <Textarea
                  id="business-goal"
                  value={businessGoal}
                  onChange={(event) =>
                    setBusinessGoal(event.target.value)
                  }
                  placeholder="e.g. Reduce manual processing time and allow our team to focus on higher-value work."
                  className="min-h-[100px] resize-y"
                  disabled={isSubmitting}
                />
              </div>

            </div>
          </section>

          {/* PROJECT CONTEXT */}

          <section className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">

            <div className="mb-6">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                Project context
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Help us understand the project
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                These details are optional, but they help us
                understand the scope of your request.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* INDUSTRY */}

              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry
                </Label>

                <Input
                  id="industry"
                  value={industry}
                  onChange={(event) =>
                    setIndustry(event.target.value)
                  }
                  placeholder="e.g. Healthcare"
                  disabled={isSubmitting}
                />
              </div>

              {/* BUDGET */}

              <div className="space-y-2">
                <Label htmlFor="budget">
                  Budget
                </Label>

                <Input
                  id="budget"
                  value={budget}
                  onChange={(event) =>
                    setBudget(event.target.value)
                  }
                  placeholder="e.g. $1,000–$3,000"
                  disabled={isSubmitting}
                />
              </div>

              {/* TIMELINE */}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="timeline">
                  Desired timeline
                </Label>

                <Input
                  id="timeline"
                  value={timeline}
                  onChange={(event) =>
                    setTimeline(event.target.value)
                  }
                  placeholder="e.g. Within 4–6 weeks"
                  disabled={isSubmitting}
                />
              </div>

            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* SUBMIT */}

          <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Ready to submit?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your project will be added to your workspace
                    for review.
                  </p>
                </div>

              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0"
              >
                {isSubmitting
                  ? 'Creating project...'
                  : 'Create automation project'}

                {!isSubmitting && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </Button>

            </div>

          </section>

        </form>

      </div>
    </AppLayout>
  );
}

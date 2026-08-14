import { FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
  Workflow,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { getCompanyProfile, supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AutomationRequest() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();

  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [automationGoal, setAutomationGoal] = useState('');
  const [currentProcess, setCurrentProcess] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [timeline, setTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [additionalInformation, setAdditionalInformation] =
    useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /*
   * =========================================================
   * SUBMIT AUTOMATION REQUEST
   * =========================================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user?.id) {
      setError(
        'Your session could not be verified. Please sign in again.'
      );
      return;
    }

    if (!companyName.trim()) {
      setError('Please enter your company name.');
      return;
    }

    if (!contactEmail.trim()) {
      setError('Please enter a contact email.');
      return;
    }

    if (!automationGoal.trim()) {
      setError(
        'Please tell us what you would like to automate.'
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      /*
       * Try to get the latest company profile.
       *
       * This is not required for the request itself, but allows
       * us to prefill company information when available.
       */

      const companyProfile = await getCompanyProfile(user.id);

      const finalCompanyName =
        companyName.trim() ||
        companyProfile?.company_name ||
        profile?.full_name ||
        'Company';

      const finalIndustry =
        industry.trim() ||
        companyProfile?.industry ||
        null;

      const { error: insertError } = await supabase
        .from('automation_requests')
        .insert({
          company_id: user.id,
          company_name: finalCompanyName,
          contact_email: contactEmail.trim(),
          industry: finalIndustry,
          automation_goal: automationGoal.trim(),
          current_process:
            currentProcess.trim() || null,
          tools_used:
            toolsUsed.trim() || null,
          desired_outcome:
            desiredOutcome.trim() || null,
          timeline: timeline || null,
          budget: budget || null,
          additional_information:
            additionalInformation.trim() || null,
          status: 'new',
        });

      if (insertError) {
        console.error(
          'AUTOMATION REQUEST ERROR:',
          insertError
        );

        setError(
          'We could not submit your request. Please try again.'
        );

        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(
        'AUTOMATION REQUEST SUBMISSION ERROR:',
        err
      );

      setError(
        'Something went wrong while submitting your request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * =========================================================
   * SUCCESS STATE
   * =========================================================
   */

  if (submitted) {
    return (
      <AppLayout title="Automation Request">
        <div className="mx-auto max-w-2xl py-8">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-[80px]" />

            <div className="relative p-8 text-center sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>

              <Badge
                variant="outline"
                className="mt-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
              >
                Request received
              </Badge>

              <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                We’ll be in touch
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Your automation request has been submitted
                successfully. We’ll review what you need and
                get back to you to discuss the best way forward.
              </p>

              <div className="mt-8 rounded-xl border border-border/60 bg-card/40 p-5 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <div>
                    <p className="text-sm font-medium">
                      What happens next?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      An IUVAI team member will review your
                      requirements and contact you directly to
                      understand the workflow, discuss possible
                      solutions, and determine the next steps.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/company-dashboard">
                    Return to dashboard
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setCompanyName('');
                    setContactEmail('');
                    setIndustry('');
                    setAutomationGoal('');
                    setCurrentProcess('');
                    setToolsUsed('');
                    setDesiredOutcome('');
                    setTimeline('');
                    setBudget('');
                    setAdditionalInformation('');
                  }}
                >
                  Submit another request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
   * =========================================================
   * FORM
   * =========================================================
   */

  return (
    <AppLayout title="Request AI Automation">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* BACK */}

        <Link
          href="/company-dashboard"
          className="inline-flex items-center text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        {/* HEADER */}

        <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.05]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-[90px]" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Workflow className="h-5 w-5 text-primary" />
              </div>

              <div>
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary"
                >
                  AI Automation
                </Badge>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Tell us what you'd like to automate
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Give us some context about your workflow and
                  what you want to achieve. We'll review your
                  requirements and get back to you to discuss a
                  potential solution.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* COMPANY INFORMATION */}

          <section className="rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    About your company
                  </p>

                  <h2 className="mt-1 text-sm font-semibold">
                    Company information
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {/* COMPANY NAME */}

              <div className="space-y-2">
                <label
                  htmlFor="companyName"
                  className="text-xs font-medium"
                >
                  Company name
                  <span className="ml-1 text-primary">
                    *
                  </span>
                </label>

                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(event.target.value)
                  }
                  placeholder="Your company name"
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="space-y-2">
                <label
                  htmlFor="contactEmail"
                  className="text-xs font-medium"
                >
                  Contact email
                  <span className="ml-1 text-primary">
                    *
                  </span>
                </label>

                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(event) =>
                    setContactEmail(event.target.value)
                  }
                  placeholder="you@company.com"
                  required
                />
              </div>

              {/* INDUSTRY */}

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="industry"
                  className="text-xs font-medium"
                >
                  Industry
                </label>

                <Input
                  id="industry"
                  value={industry}
                  onChange={(event) =>
                    setIndustry(event.target.value)
                  }
                  placeholder="e.g. Healthcare, Finance, E-commerce, SaaS"
                />
              </div>
            </div>
          </section>

          {/* AUTOMATION REQUIREMENTS */}

          <section className="rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                    Your workflow
                  </p>

                  <h2 className="mt-1 text-sm font-semibold">
                    Automation requirements
                  </h2>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* GOAL */}

              <div className="space-y-2">
                <label
                  htmlFor="automationGoal"
                  className="text-xs font-medium"
                >
                  What would you like to automate?
                  <span className="ml-1 text-primary">
                    *
                  </span>
                </label>

                <Textarea
                  id="automationGoal"
                  value={automationGoal}
                  onChange={(event) =>
                    setAutomationGoal(event.target.value)
                  }
                  placeholder="Describe the task, workflow, or business process you'd like AI to automate."
                  className="min-h-[120px] resize-y"
                  required
                />

                <p className="text-[10px] leading-4 text-muted-foreground/60">
                  Don't worry about technical details. Describe
                  the problem in your own words.
                </p>
              </div>

              {/* CURRENT PROCESS */}

              <div className="space-y-2">
                <label
                  htmlFor="currentProcess"
                  className="text-xs font-medium"
                >
                  How is this process handled today?
                </label>

                <Textarea
                  id="currentProcess"
                  value={currentProcess}
                  onChange={(event) =>
                    setCurrentProcess(event.target.value)
                  }
                  placeholder="Tell us how your team currently handles this process, including any manual steps."
                  className="min-h-[110px] resize-y"
                />
              </div>

              {/* TOOLS */}

              <div className="space-y-2">
                <label
                  htmlFor="toolsUsed"
                  className="text-xs font-medium"
                >
                  What tools or systems do you currently use?
                </label>

                <Textarea
                  id="toolsUsed"
                  value={toolsUsed}
                  onChange={(event) =>
                    setToolsUsed(event.target.value)
                  }
                  placeholder="e.g. Salesforce, HubSpot, Gmail, Excel, internal software, Slack..."
                  className="min-h-[90px] resize-y"
                />
              </div>

              {/* DESIRED OUTCOME */}

              <div className="space-y-2">
                <label
                  htmlFor="desiredOutcome"
                  className="text-xs font-medium"
                >
                  What would a successful outcome look like?
                </label>

                <Textarea
                  id="desiredOutcome"
                  value={desiredOutcome}
                  onChange={(event) =>
                    setDesiredOutcome(event.target.value)
                  }
                  placeholder="Describe what you'd like the automated workflow to accomplish."
                  className="min-h-[100px] resize-y"
                />
              </div>
            </div>
          </section>

          {/* PROJECT DETAILS */}

          <section className="rounded-2xl border border-border/60 bg-card/40">
            <div className="border-b border-border/60 p-5 sm:p-6">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">
                Planning
              </p>

              <h2 className="mt-1 text-sm font-semibold">
                Project details
              </h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {/* TIMELINE */}

              <div className="space-y-2">
                <label
                  htmlFor="timeline"
                  className="text-xs font-medium"
                >
                  When would you like to start?
                </label>

                <Select
                  value={timeline}
                  onValueChange={setTimeline}
                >
                  <SelectTrigger id="timeline">
                    <SelectValue placeholder="Select a timeline" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="as_soon_as_possible">
                      As soon as possible
                    </SelectItem>

                    <SelectItem value="within_1_month">
                      Within 1 month
                    </SelectItem>

                    <SelectItem value="1_to_3_months">
                      1–3 months
                    </SelectItem>

                    <SelectItem value="3_to_6_months">
                      3–6 months
                    </SelectItem>

                    <SelectItem value="exploring">
                      Just exploring
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* BUDGET */}

              <div className="space-y-2">
                <label
                  htmlFor="budget"
                  className="text-xs font-medium"
                >
                  Approximate budget
                </label>

                <Select
                  value={budget}
                  onValueChange={setBudget}
                >
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select a budget range" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="under_1000">
                      Under $1,000
                    </SelectItem>

                    <SelectItem value="1000_to_5000">
                      $1,000–$5,000
                    </SelectItem>

                    <SelectItem value="5000_to_10000">
                      $5,000–$10,000
                    </SelectItem>

                    <SelectItem value="10000_plus">
                      $10,000+
                    </SelectItem>

                    <SelectItem value="not_sure">
                      Not sure yet
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ADDITIONAL INFO */}

              <div className="space-y-2 sm:col-span-2">
                <label
                  htmlFor="additionalInformation"
                  className="text-xs font-medium"
                >
                  Anything else we should know?
                </label>

                <Textarea
                  id="additionalInformation"
                  value={additionalInformation}
                  onChange={(event) =>
                    setAdditionalInformation(
                      event.target.value
                    )
                  }
                  placeholder="Add anything else that might help us understand your requirements."
                  className="min-h-[110px] resize-y"
                />
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* SUBMIT */}

          <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium">
                  Ready to discuss your workflow?
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Submit your requirements and an IUVAI team
                  member will review them and contact you.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit request
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* FOOTER NOTE */}

          <div className="flex items-center justify-center gap-2 border-t border-border/50 pt-5 text-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            No commitment required
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

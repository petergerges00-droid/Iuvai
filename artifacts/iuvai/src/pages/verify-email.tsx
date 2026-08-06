import { Link } from 'wouter';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import {
  MailCheck,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
export default function VerifyEmail() {
  return (
    <AuthLayout
      title="Verify your identity"
      subtitle="You're one step away from joining IUVAI."
    >
      <div className="relative">
        {/* Futuristic glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative flex flex-col items-center text-center">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Almost there
          </div>
          {/* Icon */}
          <div className="relative mb-7">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-lg shadow-primary/10">
              <MailCheck className="h-9 w-9 text-primary" />
            </div>
          </div>
          {/* Main message */}
          <h2 className="text-xl font-semibold tracking-tight">
            Check your email
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            We've sent a verification link to your email address.
            Click the link to verify your identity and continue
            setting up your IUVAI profile.
          </p>
          {/* Information card */}
          <div className="mt-7 w-full rounded-xl border border-border/60 bg-muted/20 p-4 text-left">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  Secure verification
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Verification helps us maintain a trusted network
                  of qualified human experts.
                </p>
              </div>
            </div>
          </div>
          {/* Spam notice */}
          <p className="mt-5 text-xs text-muted-foreground">
            Didn't receive the email? Check your spam or junk folder.
          </p>
          {/* Return button */}
          <div className="mt-7 w-full">
            <Button
              asChild
              variant="outline"
              className="group w-full h-12 rounded-xl border-border/70 bg-background/50 backdrop-blur"
            >
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Return to login
              </Link>
            </Button>
          </div>
          {/* Brand statement */}
          <div className="mt-10 pt-6 border-t border-border/60 w-full">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                IUVAI
              </span>{' '}
              — A human intelligence infrastructure powering
              tomorrow's AI.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

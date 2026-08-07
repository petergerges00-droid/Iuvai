import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase, updatePassword } from '@/lib/supabase';
import { AuthLayout } from '@/components/layout/auth-layout';
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
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] =
    useState(true);
  const [hasRecoverySession, setHasRecoverySession] =
    useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  /*
  ============================================================
  CHECK PASSWORD-RECOVERY SESSION
  ============================================================
  Supabase creates a temporary authenticated session when
  the user clicks the password-reset email link.

  We wait for that session before allowing the password
  update.
  ============================================================
  */
  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        /*
        Handle the recovery session created by the
        Supabase password-reset link.
        */
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error(
            'PASSWORD RECOVERY SESSION ERROR:',
            error
          );

          setHasRecoverySession(false);
          setIsCheckingSession(false);
          return;
        }

        if (session) {
          setHasRecoverySession(true);
          setIsCheckingSession(false);
          return;
        }

        /*
        If there is no session yet, listen briefly for the
        PASSWORD_RECOVERY event.

        This is useful because Supabase may establish the
        recovery session asynchronously after the page loads.
        */
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            if (!mounted) return;

            if (
              event === 'PASSWORD_RECOVERY' &&
              newSession
            ) {
              setHasRecoverySession(true);
              setIsCheckingSession(false);
            }
          }
        );

        /*
        Give Supabase a short window to establish the
        recovery session.
        */
        setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: latestSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (latestSession) {
            setHasRecoverySession(true);
          } else {
            setHasRecoverySession(false);
          }

          setIsCheckingSession(false);

          subscription.unsubscribe();
        }, 1500);
      } catch (error) {
        console.error(
          'RECOVERY SESSION CHECK ERROR:',
          error
        );

        if (!mounted) return;

        setHasRecoverySession(false);
        setIsCheckingSession(false);
      }
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  ============================================================
  SUBMIT NEW PASSWORD
  ============================================================
  */
  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {
    if (!hasRecoverySession) {
      toast({
        variant: 'destructive',
        title: 'Recovery session expired',
        description:
          'Please request a new password-reset link and try again.',
      });

      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(
        values.password
      );

      if (error) {
        console.error(
          'PASSWORD UPDATE ERROR:',
          error
        );

        toast({
          variant: 'destructive',
          title: 'Password update failed',
          description: error.message,
        });

        return;
      }

      toast({
        title: 'Password updated',
        description:
          'Your password has been changed successfully.',
      });

      /*
      Sign out the recovery session before returning
      to login so the user explicitly logs in with the
      new password.
      */
      await supabase.auth.signOut();

      setLocation('/login');
    } catch (error) {
      console.error(
        'PASSWORD UPDATE EXCEPTION:',
        error
      );

      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description:
          'Please request a new password-reset link and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /*
  ============================================================
  CHECKING RECOVERY SESSION
  ============================================================
  */
  if (isCheckingSession) {
    return (
      <AuthLayout
        title="Verifying reset link"
        subtitle="Securing your password recovery session."
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>

          <p className="text-sm text-muted-foreground">
            Verifying your reset link...
          </p>
        </div>
      </AuthLayout>
    );
  }

  /*
  ============================================================
  INVALID / EXPIRED RECOVERY SESSION
  ============================================================
  */
  if (!hasRecoverySession) {
    return (
      <AuthLayout
        title="Reset link expired"
        subtitle="This password-reset link is invalid or has expired."
      >
        <div className="relative">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-destructive/10 blur-3xl" />

          <div className="relative mb-7 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.025] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
              <AlertCircle
                className="h-4 w-4"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-destructive">
                Recovery unavailable
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Please request a new password-reset link.
              </p>
            </div>
          </div>

          <div className="mb-7 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <Button
            type="button"
            className="group h-12 w-full bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.2)]"
            onClick={() =>
              setLocation('/forgot-password')
            }
          >
            Request new reset link
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Button>

          <div className="mt-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
              IUVAI Studio
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  /*
  ============================================================
  VALID RECOVERY SESSION
  ============================================================
  */
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Create a new password to secure your IUVAI account."
    >
      <div className="relative">
        {/* Ambient futuristic accent */}
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* Security indicator */}
        <div className="relative mb-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck
              className="h-4 w-4"
              strokeWidth={1.7}
            />
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary/80">
              Account security
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose a password you haven't used before.
            </p>
          </div>
        </div>

        <div className="mb-7 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* New password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    New password
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Enter a new password"
                      {...field}
                      className="h-12 border-white/10 bg-white/[0.035] text-sm transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-primary/20"
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />

                  <p className="text-[11px] leading-5 text-muted-foreground/50">
                    Minimum 8 characters.
                  </p>
                </FormItem>
              )}
            />

            {/* Confirm password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Confirm password
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm your new password"
                      {...field}
                      className="h-12 border-white/10 bg-white/[0.035] text-sm transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-primary/20"
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              className="group mt-2 h-12 w-full bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.2)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password
                </>
              ) : (
                <>
                  Update password
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Brand footer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
            IUVAI Studio
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

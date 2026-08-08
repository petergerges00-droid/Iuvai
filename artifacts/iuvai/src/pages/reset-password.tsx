import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  supabase,
  updatePassword,
} from '@/lib/supabase';

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

/* ============================================================
   FORM VALIDATION
   ============================================================ */

const formSchema = z
  .object({
    password: z
      .string()
      .min(
        8,
        'Password must be at least 8 characters'
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }
  );

/* ============================================================
   RESET PASSWORD
   ============================================================ */

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  const { toast } = useToast();

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    isCheckingSession,
    setIsCheckingSession,
  ] = useState(true);

  const [
    hasRecoverySession,
    setHasRecoverySession,
  ] = useState(false);

  const form =
    useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),

      defaultValues: {
        password: '',
        confirmPassword: '',
      },
    });

  /* ==========================================================
     RECOVERY SESSION DETECTION
     ==========================================================

     Supabase password-reset links can establish the
     recovery session asynchronously.

     We therefore:

     1. Install the auth listener FIRST.
     2. Look specifically for PASSWORD_RECOVERY.
     3. Check the current URL for Supabase recovery tokens.
     4. Check the existing session.
     5. Never treat an arbitrary normal session as proof
        that this is a recovery flow.

     ========================================================== */

  useEffect(() => {
    let mounted = true;

    let recoveryDetected = false;

    const markRecoverySession = () => {
      if (!mounted) return;

      recoveryDetected = true;

      console.log(
        'IUVAI: PASSWORD RECOVERY SESSION DETECTED'
      );

      setHasRecoverySession(true);
      setIsCheckingSession(false);
    };

    /* ========================================================
       1. AUTH STATE LISTENER
       ======================================================== */

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;

          console.log(
            'IUVAI RESET AUTH EVENT:',
            event
          );

          /*
           * THIS is the authoritative recovery event.
           */
          if (
            event ===
              'PASSWORD_RECOVERY' &&
            session
          ) {
            markRecoverySession();

            return;
          }

          /*
           * If the password was successfully updated,
           * Supabase may emit USER_UPDATED.
           *
           * We do NOT use USER_UPDATED to establish a
           * recovery session.
           */
          if (
            event ===
            'USER_UPDATED'
          ) {
            console.log(
              'IUVAI: USER_UPDATED'
            );

            return;
          }
        }
      );

    /* ========================================================
       2. INSPECT CURRENT URL
       ========================================================

       Supabase may deliver the recovery information in
       either the hash fragment or query parameters,
       depending on the authentication flow/version.
       ======================================================== */

    const url =
      window.location.href;

    const hash =
      window.location.hash;

    const search =
      window.location.search;

    console.log(
      'IUVAI RESET URL:',
      url
    );

    console.log(
      'IUVAI RESET HASH:',
      hash
    );

    console.log(
      'IUVAI RESET SEARCH:',
      search
    );

    /*
     * Typical Supabase recovery URLs contain
     * type=recovery somewhere in the URL.
     */
    const isRecoveryUrl =
      hash.includes(
        'type=recovery'
      ) ||
      search.includes(
        'type=recovery'
      );

    if (isRecoveryUrl) {
      console.log(
        'IUVAI: RECOVERY URL DETECTED'
      );
    }

    /* ========================================================
       3. CHECK EXISTING SESSION
       ======================================================== */

    async function initializeRecovery() {
      try {
        const {
          data: { session },
          error,
        } =
          await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error(
            'IUVAI RECOVERY GET SESSION ERROR:',
            error
          );

          setHasRecoverySession(false);
          setIsCheckingSession(false);

          return;
        }

        console.log(
          'IUVAI RESET CURRENT SESSION:',
          session
        );

        /*
         * If PASSWORD_RECOVERY has already fired,
         * we are done.
         */
        if (recoveryDetected) {
          return;
        }

        /*
         * If the URL explicitly says this is a recovery
         * flow AND Supabase has an authenticated session,
         * accept it.
         */
        if (
          isRecoveryUrl &&
          session
        ) {
          console.log(
            'IUVAI: RECOVERY SESSION CONFIRMED FROM URL + SESSION'
          );

          markRecoverySession();

          return;
        }

        /*
         * If there is a session but no recovery indication,
         * DO NOT automatically consider it a recovery session.
         *
         * This prevents a normal logged-in user from accessing
         * the password reset form simply by visiting:
         *
         * /reset-password
         */
        if (session) {
          console.log(
            'IUVAI: NORMAL SESSION DETECTED — NOT RECOVERY'
          );

          setHasRecoverySession(false);
          setIsCheckingSession(false);

          return;
        }

        /*
         * No session yet.
         *
         * Give Supabase a short period to process the
         * recovery URL and emit PASSWORD_RECOVERY.
         */
        console.log(
          'IUVAI: WAITING FOR RECOVERY SESSION...'
        );

        setTimeout(async () => {
          if (!mounted) return;

          if (recoveryDetected) {
            return;
          }

          const {
            data: {
              session: latestSession,
            },
          } =
            await supabase.auth.getSession();

          if (!mounted) return;

          console.log(
            'IUVAI LATEST SESSION:',
            latestSession
          );

          /*
           * Only accept a session here if the URL itself
           * indicates password recovery.
           */
          if (
            isRecoveryUrl &&
            latestSession
          ) {
            console.log(
              'IUVAI: RECOVERY SESSION CONFIRMED AFTER WAIT'
            );

            markRecoverySession();

            return;
          }

          console.log(
            'IUVAI: NO VALID RECOVERY SESSION'
          );

          setHasRecoverySession(false);
          setIsCheckingSession(false);
        }, 2000);
      } catch (error) {
        console.error(
          'IUVAI RECOVERY INITIALIZATION ERROR:',
          error
        );

        if (!mounted) return;

        setHasRecoverySession(false);
        setIsCheckingSession(false);
      }
    }

    initializeRecovery();

    /* ========================================================
       CLEANUP
       ======================================================== */

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };
  }, []);

  /* ==========================================================
     SUBMIT NEW PASSWORD
     ========================================================== */

  async function onSubmit(
    values: z.infer<typeof formSchema>
  ) {
    if (!hasRecoverySession) {
      toast({
        variant: 'destructive',

        title:
          'Recovery session expired',

        description:
          'Please request a new password-reset link and try again.',
      });

      return;
    }

    setIsLoading(true);

    try {
      console.log(
        'IUVAI: UPDATING PASSWORD'
      );

      const {
        error,
      } = await updatePassword(
        values.password
      );

      if (error) {
        console.error(
          'IUVAI PASSWORD UPDATE ERROR:',
          error
        );

        toast({
          variant: 'destructive',

          title:
            'Password update failed',

          description:
            error.message,
        });

        return;
      }

      console.log(
        'IUVAI: PASSWORD UPDATED SUCCESSFULLY'
      );

      toast({
        title:
          'Password updated',

        description:
          'Your password has been changed successfully.',
      });

      /*
       * Sign out the temporary recovery session.
       *
       * This is intentional.
       *
       * The user must now explicitly sign in using
       * the new password.
       */
      await supabase.auth.signOut();

      /*
       * Give Supabase a moment to finish clearing
       * the recovery session before routing.
       */
      setTimeout(() => {
        if (mountedForRedirect()) {
          setLocation('/login');
        }
      }, 100);
    } catch (error) {
      console.error(
        'IUVAI PASSWORD UPDATE EXCEPTION:',
        error
      );

      toast({
        variant: 'destructive',

        title:
          'Something went wrong',

        description:
          'Please request a new password-reset link and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /*
   * Small helper so the delayed redirect does not
   * depend on stale component state.
   */
  function mountedForRedirect() {
    return true;
  }

  /* ==========================================================
     CHECKING
     ========================================================== */

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

  /* ==========================================================
     INVALID / EXPIRED
     ========================================================== */

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
              setLocation(
                '/forgot-password'
              )
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

  /* ==========================================================
     VALID RECOVERY SESSION
     ========================================================== */

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Create a new password to secure your IUVAI account."
    >
      <div className="relative">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        {/* SECURITY INDICATOR */}

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

        {/* FORM */}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(
              onSubmit
            )}
            className="space-y-6"
          >
            {/* NEW PASSWORD */}

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

            {/* CONFIRM PASSWORD */}

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

            {/* SUBMIT */}

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

        {/* FOOTER */}

        <div className="mt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
            IUVAI Studio
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

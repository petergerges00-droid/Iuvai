import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updatePassword } from '@/lib/supabase';
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
} from 'lucide-react';

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Supabase automatically uses the recovery session
      // established from the password-reset link.
      const { error } = await updatePassword(values.password);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Password update failed',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });

      setLocation('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

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
            <ShieldCheck className="h-4 w-4" strokeWidth={1.7} />
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

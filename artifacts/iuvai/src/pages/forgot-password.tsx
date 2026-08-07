import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { resetPassword } from '@/lib/supabase';
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
  ArrowLeft,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Request failed',
          description: error.message,
        });
        return;
      }
      setIsSent(true);
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
  if (isSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Your recovery link is on its way."
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-8 text-center">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col items-center space-y-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_0_35px_rgba(99,102,241,0.15)]">
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                If an account exists for that email address, we've sent
                instructions to reset your password.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Check your spam or junk folder if you don't see it.
              </p>
            </div>
            <Button
              asChild
              className="group h-11 w-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              <Link href="/login">
                Return to login
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
            IUVAI Studio
          </p>
        </div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a secure recovery link."
    >
      <div className="relative">
        {/* Subtle top accent */}
        <div className="mb-7 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      {...field}
                      className="h-12 border-white/10 bg-white/[0.035] text-sm transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="group h-12 w-full bg-primary text-sm font-medium tracking-wide text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_35px_rgba(99,102,241,0.2)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending recovery link
                </>
              ) : (
                <>
                  Send recovery link
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="group inline-flex items-center text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to login
          </Link>
        </div>
      </div>
      <div className="mt-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40">
          IUVAI Studio
        </p>
      </div>
    </AuthLayout>
  );
}

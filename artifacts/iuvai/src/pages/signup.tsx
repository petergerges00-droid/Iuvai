import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUp } from '@/lib/supabase';
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
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Brain,
} from 'lucide-react';
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { error, data } = await signUp(
        values.email,
        values.password
      );
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description: error.message,
        });
        return;
      }
      if (data?.user?.identities?.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description:
            'An account with this email already exists.',
        });
        return;
      }
      setLocation('/verify-email');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <AuthLayout
      title="Join IUVAI"
      subtitle="Your expertise helps shaping tomorrow."
    >
      <div className="relative">
        {/* Futuristic glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="relative">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Human intelligence infrastructure
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the network connecting exceptional human expertise
              with the future of AI.
            </p>
          </div>
          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        {...field}
                        className="h-12 rounded-xl border-border/70 bg-background/60 backdrop-blur transition-all focus:border-primary/50 focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        {...field}
                        className="h-12 rounded-xl border-border/70 bg-background/60 backdrop-blur transition-all focus:border-primary/50 focus:ring-primary/20"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Must contain at least 8 characters.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="group w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/10 transition-all hover:shadow-xl hover:shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
                {isLoading ? 'Creating account...' : 'Continue'}
              </Button>
            </form>
          </Form>
          {/* Existing account */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already part of IUVAI?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
          {/* Trust indicators */}
          <div className="mt-10 pt-6 border-t border-border/60">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <ShieldCheck className="h-4 w-4 text-primary mb-2" />
                <p className="text-xs font-medium">
                  Secure
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Your account is protected.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                <Brain className="h-4 w-4 text-primary mb-2" />
                <p className="text-xs font-medium">
                  Expert-driven
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Built around human expertise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from '@/lib/supabase';
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
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
export default function Login() {
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
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message,
        });
        return;
      }
      setLocation('/');
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
      title="Welcome back"
      subtitle="Sign in to the IUVAI network."
    >
      <div className="space-y-7">
        {/* Security indicator */}
        <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/[0.03] px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              Secure access
            </p>
            <p className="text-[11px] text-muted-foreground">
              Your IUVAI workspace is protected.
            </p>
          </div>
        </div>
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
                  <FormLabel className="text-sm">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...field}
                      className="h-12 border-border/70 bg-background/70 transition-all focus:border-primary focus:ring-primary/20"
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">
                      Password
                    </FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                      className="h-12 border-border/70 bg-background/70 transition-all focus:border-primary focus:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="group h-12 w-full text-sm font-semibold shadow-sm transition-all hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em]">
            <span className="bg-background px-3 text-muted-foreground">
              New to IUVAI
            </span>
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/signup"
            className="group inline-flex items-center text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Create your expert account
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <p className="pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          A human intelligence infrastructure
          <br />
          powering tomorrow’s AI.
        </p>
      </div>
    </AuthLayout>
  );
}

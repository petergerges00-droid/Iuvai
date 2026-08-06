import { Link } from 'wouter';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

export default function VerifyEmail() {
  return (
    <AuthLayout title="Check your email" subtitle="We've sent you a verification link.">
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-primary" />
        </div>
        
        <p className="text-muted-foreground text-sm">
          Please click the link in the email we just sent you to verify your identity.
          If you don't see it, check your spam folder.
        </p>

        <div className="pt-4 w-full">
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

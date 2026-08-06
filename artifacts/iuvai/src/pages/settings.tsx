import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getCompanyProfile,
  upsertProfile,
  upsertCompanyProfile,
  updatePassword,
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, User, Building2, Lock, Save } from 'lucide-react';
export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [newPassword, setNewPassword] = useState('');
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || '');
    setCountry(profile.country || '');
    if (profile.account_type === 'company' && user?.id) {
      getCompanyProfile(user.id).then((company) => {
        if (company) {
          setCompanyName(company.company_name || '');
          setWebsite(company.website || '');
        }
      });
    }
  }, [profile, user]);
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setIsLoading(true);
    try {
      await upsertProfile({
        id: user.id,
        full_name: fullName,
        ...(profile.account_type === 'expert' ? { country } : {}),
      });
      if (profile.account_type === 'company') {
        await upsertCompanyProfile({
          id: user.id,
          company_name: companyName,
          website: website,
        });
      }
      await refreshProfile();
      toast({
        title: 'Profile updated',
        description: 'Your IUVAI profile has been updated successfully.',
      });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: e?.message || 'Unable to update your profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Invalid password',
        description: 'Your password must contain at least 8 characters.',
      });
      return;
    }
    
    setIsPasswordLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      });
      setNewPassword('');
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Password update failed',
        description: e?.message || 'Unable to update your password.',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading IUVAI...
        </div>
      </div>
    );
  }
  const isExpert = profile.account_type === 'expert';
  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_45%)] pointer-events-none" />
          <div className="relative flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
                  IUVAI
                </span>
                <span className="h-px w-8 bg-primary/40" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Account Control
                </span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Account Settings
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                Manage your identity, account information, and security
                credentials across the IUVAI network.
              </p>
            </div>
          </div>
        </div>
        {/* Profile */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                {isExpert ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Building2 className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage the information associated with your IUVAI account.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="h-11 bg-muted/30 border-border/60"
              />
              <p className="text-xs text-muted-foreground">
                Your email address is managed by the authentication system and
                cannot be changed here.
              </p>
            </div>
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11"
                placeholder="Your full name"
              />
            </div>
            {/* Expert */}
            {isExpert && (
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                >
                  Country
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11"
                  placeholder="Your country"
                />
              </div>
            )}
            {/* Company */}
            {!isExpert && (
              <div className="space-y-6">
                <div className="h-px bg-border/60" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary mb-1">
                    Organization
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Information about your organization.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11"
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-11"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}
            <div className="pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="h-11 px-6"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Security */}
        <Card className="border-primary/10 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Security
                </CardTitle>
                <CardDescription>
                  Update your account password and maintain secure access.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    Keep your account secure
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Use a strong password that you do not reuse on other
                    services.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </p>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isPasswordLoading || !newPassword}
              variant="outline"
              className="h-11"
            >
              {isPasswordLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isPasswordLoading && (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {isPasswordLoading
                ? 'Updating...'
                : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
        {/* Account Status */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Account Type
              </p>
              <p className="mt-1 text-sm font-medium capitalize">
                {profile.account_type}
              </p>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <span className="text-xs font-mono uppercase tracking-wider text-primary">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

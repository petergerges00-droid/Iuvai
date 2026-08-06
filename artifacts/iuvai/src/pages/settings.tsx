import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { 
  getExpertProfile, 
  getCompanyProfile, 
  upsertProfile,
  upsertExpertProfile,
  upsertCompanyProfile,
  updatePassword
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    if (profile) {
      setFullName(profile.full_name || '');
      setCountry(profile.country || '');
      
      if (profile.account_type === 'company' && user?.id) {
        getCompanyProfile(user.id).then(c => {
          if (c) {
            setCompanyName(c.company_name || '');
            setWebsite(c.website || '');
          }
        });
      }
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setIsLoading(true);
    
    try {
      await upsertProfile({
        id: user.id,
        full_name: fullName,
        ...(profile.account_type === 'expert' ? { country } : {})
      });
      
      if (profile.account_type === 'company') {
        await upsertCompanyProfile({
          id: user.id,
          company_name: companyName,
          website: website
        });
      }
      
      await refreshProfile();
      toast({ title: 'Profile updated successfully' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Invalid password', description: 'Must be at least 8 characters' });
      return;
    }
    
    setIsPasswordLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      toast({ title: 'Password updated successfully' });
      setNewPassword('');
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Manage your basic account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">Email cannot be changed directly.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
              />
            </div>

            {profile.account_type === 'expert' && (
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={country} 
                  onChange={e => setCountry(e.target.value)} 
                />
              </div>
            )}

            {profile.account_type === 'company' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyName} 
                    onChange={e => setCompanyName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                  />
                </div>
              </>
            )}

            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isPasswordLoading || !newPassword} variant="secondary">
              {isPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

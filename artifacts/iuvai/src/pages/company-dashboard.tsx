import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { getCompanyProfile, CompanyProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, PlusCircle, LayoutList, ChevronRight, Users2 } from 'lucide-react';

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      getCompanyProfile(user.id).then(setCompanyProfile);
    }
  }, [user]);

  if (!profile || !companyProfile) return null;

  return (
    <AppLayout title="Overview">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Status Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card overflow-hidden shadow-sm border-t-4 border-t-primary">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight mb-2">{companyProfile.company_name}</h2>
                  <p className="text-muted-foreground max-w-md">
                    Your workspace for managing expert engagements and AI training projects.
                  </p>
                </div>
                <div className="hidden sm:flex w-16 h-16 rounded-lg bg-primary/5 items-center justify-center border border-primary/10">
                  <Users2 className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-8 mb-4">
            <h3 className="text-xl font-semibold tracking-tight">Platform Features</h3>
            <Badge variant="outline" className="font-mono uppercase tracking-wider text-xs">Coming Soon</Badge>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6">
                <PlusCircle className="w-8 h-8 text-muted-foreground mb-4" />
                <h4 className="font-medium text-foreground mb-1">Submit a Project</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Define your requirements, set compensation, and broadcast to our verified expert network.
                </p>
                <div className="text-sm font-medium text-muted-foreground/60 flex items-center">
                  In development <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6">
                <Search className="w-8 h-8 text-muted-foreground mb-4" />
                <h4 className="font-medium text-foreground mb-1">Find Experts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Search the directory directly to find domain specialists for targeted consultations.
                </p>
                <div className="text-sm font-medium text-muted-foreground/60 flex items-center">
                  In development <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed bg-muted/30 sm:col-span-2">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <LayoutList className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Active Projects</h4>
                    <p className="text-sm text-muted-foreground">
                      Track ongoing evaluations, review deliverables, and manage expert communications.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">0 Active</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Industry</div>
                <div className="font-medium">{companyProfile.industry}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Website</div>
                <div className="font-medium text-primary truncate">
                  <a href={companyProfile.website || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {companyProfile.website}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Size</div>
                <div className="font-medium">{companyProfile.company_size}</div>
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground mb-2">Account Owner</div>
                <div className="font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {profile.full_name?.charAt(0) || 'U'}
                  </div>
                  {profile.full_name}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

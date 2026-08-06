import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { getExpertProfile, ExpertProfile } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, FileText, Briefcase, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ExpertDashboard() {
  const { user, profile } = useAuth();
  const [expertProfile, setExpertProfile] = useState<ExpertProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      getExpertProfile(user.id).then(setExpertProfile);
    }
  }, [user]);

  if (!profile || !expertProfile) return null;

  return (
    <AppLayout title="Overview">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Status Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden border-none shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none mb-4">
                    Verification Pending
                  </Badge>
                  <h2 className="text-3xl font-semibold tracking-tight mb-2">Welcome, {profile.full_name}</h2>
                  <p className="text-primary-foreground/80 max-w-md">
                    Your profile is currently under review by our team. Once verified, you'll gain access to available projects matching your expertise in {expertProfile.primary_field}.
                  </p>
                </div>
                <div className="hidden sm:flex w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20">
                  <CheckCircle2 className="w-8 h-8 text-white/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-xl font-semibold tracking-tight mt-8 mb-4">Coming Soon</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-muted-foreground mb-4" />
                <h4 className="font-medium text-foreground mb-1">Assessments</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Take domain-specific assessments to unlock higher-tier projects and increase your ranking.
                </p>
                <div className="text-sm font-medium text-primary flex items-center">
                  Available soon <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6">
                <Briefcase className="w-8 h-8 text-muted-foreground mb-4" />
                <h4 className="font-medium text-foreground mb-1">Project Board</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse and apply to AI training and evaluation projects that match your unique skillset.
                </p>
                <div className="text-sm font-medium text-primary flex items-center">
                  Available soon <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Profile Strength</CardTitle>
              <CardDescription>Complete assessments to increase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Basic info complete</span>
                <span className="text-sm font-mono text-muted-foreground">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Expertise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Domain</div>
                <div className="font-medium">{expertProfile.primary_field}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Specialization</div>
                <div className="font-medium">{expertProfile.specialization}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Verified Skills</div>
                <div className="flex flex-wrap gap-2">
                  {expertProfile.skills?.map((skill, i) => (
                    <Badge key={i} variant="outline" className="font-mono font-normal">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t mt-4 flex items-center text-sm text-amber-600 dark:text-amber-500">
                <AlertCircle className="w-4 h-4 mr-2" />
                Awaiting credential verification
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

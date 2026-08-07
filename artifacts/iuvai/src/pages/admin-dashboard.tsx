import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import {
  getExperts,
  ExpertWithProfile,
} from '@/lib/supabase';

export default function AdminDashboard() {
  const [experts, setExperts] = useState<ExpertWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExperts() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getExperts();
        setExperts(data);
      } catch (err) {
        console.error('ADMIN EXPERT LOAD ERROR:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load experts.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadExperts();
  }, []);

  return (
    <AppLayout title="Admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />

            <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
              IUVAI / Internal
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Expert Network
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Manage and review experts in the IUVAI network.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Total experts
              </p>

              <Users className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {experts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <p className="text-xs text-muted-foreground">
              Verified
            </p>

            <p className="mt-3 text-3xl font-semibold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {experts.length}
            </p>
          </div>
        </div>

        {/* Expert list */}
        <div className="rounded-2xl border border-border/60 bg-card/70">
          <div className="border-b border-border/60 p-5">
            <h3 className="font-medium">
              Registered experts
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Experts currently registered with IUVAI.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">
              {error}
            </div>
          ) : experts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No experts registered yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {expert.profile?.full_name ||
                        'Unnamed expert'}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {expert.primary_field ||
                        'Field not specified'}
                      {expert.specialization
                        ? ` · ${expert.specialization}`
                        : ''}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {expert.profile?.country ||
                        'Country not specified'}
                    </p>
                  </div>

                  <div className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
                    Pending review
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

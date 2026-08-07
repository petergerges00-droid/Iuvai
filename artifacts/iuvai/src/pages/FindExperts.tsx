import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import {
  getExperts,
  searchExperts,
  ExpertWithProfile,
} from '@/lib/supabase';

export default function FindExperts() {
  const [experts, setExperts] = useState<ExpertWithProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExperts();
  }, []);

  async function loadExperts() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getExperts();
      setExperts(data);
    } catch (err) {
      console.error('Failed to load experts:', err);
      setError('Unable to load experts right now.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await searchExperts(searchTerm);
      setExperts(data);
    } catch (err) {
      console.error('Failed to search experts:', err);
      setError('Unable to search experts right now.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppLayout title="Find Experts">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
            IUVAI / Expert Network
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Find Experts
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Discover verified human experts for your AI projects.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Search by field, specialization, or AI experience..."
                className="h-11 w-full rounded-lg border border-border/70 bg-background/70 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={isLoading}
              className="rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && experts.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/70 p-8 text-center">
            <p className="text-sm font-medium">
              No experts found
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </div>
        )}

        {!isLoading && !error && experts.length > 0 && (
          <div className="grid gap-4">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="rounded-2xl border border-border/60 bg-card/70 p-6 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {expert.profile?.full_name
                          ?.charAt(0)
                          ?.toUpperCase() || 'E'}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {expert.profile?.full_name ||
                            'Verified Expert'}
                        </h3>

                        {expert.primary_field && (
                          <p className="text-sm text-primary">
                            {expert.primary_field}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                      {expert.specialization && (
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          {expert.specialization}
                        </span>
                      )}

                      {expert.profile?.country && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {expert.profile.country}
                        </span>
                      )}

                      {expert.years_experience !== null && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {expert.years_experience} years experience
                        </span>
                      )}
                    </div>

                    {expert.skills &&
                      expert.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {expert.skills
                            .slice(0, 6)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      )}
                  </div>

                  <Link
                    href={`/company/experts/${expert.id}`}
                    className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    View
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

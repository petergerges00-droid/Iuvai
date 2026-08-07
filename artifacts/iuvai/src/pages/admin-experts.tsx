import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Loader2,
  Users,
  ChevronRight,
  Search,
  ShieldCheck,
} from 'lucide-react';

import { AppLayout } from '@/components/layout/app-layout';
import {
  getExperts,
  ExpertWithProfile,
} from '@/lib/supabase';

export default function AdminExperts() {
  const [experts, setExperts] = useState<
    ExpertWithProfile[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState('');

  /*
  ============================================================
  LOAD EXPERTS
  ============================================================
  */

  useEffect(() => {
    async function loadExperts() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getExperts();

        setExperts(data);
      } catch (err) {
        console.error(
          'ADMIN EXPERT LOAD ERROR:',
          err
        );

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

  /*
  ============================================================
  FILTER EXPERTS
  ============================================================
  */

  const filteredExperts = experts.filter(
    (expert) => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      const fullName =
        expert.profile?.full_name ||
        '';

      const country =
        expert.profile?.country ||
        '';

      const primaryField =
        expert.primary_field ||
        '';

      const specialization =
        expert.specialization ||
        '';

      return (
        fullName
          .toLowerCase()
          .includes(query) ||
        country
          .toLowerCase()
          .includes(query) ||
        primaryField
          .toLowerCase()
          .includes(query) ||
        specialization
          .toLowerCase()
          .includes(query)
      );
    }
  );

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppLayout title="Experts">

      <div className="space-y-8">

        {/* ====================================================
            HEADER
            ==================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

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
              Review and manage experts registered with IUVAI.
            </p>

          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-4 py-2.5">

            <Users className="h-4 w-4 text-muted-foreground" />

            <span className="text-sm font-medium">
              {experts.length}
            </span>

            <span className="text-xs text-muted-foreground">
              registered
            </span>

          </div>

        </div>

        {/* ====================================================
            SEARCH
            ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70 p-5">

          <div className="relative">

            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search experts by name, field, specialization, or country..."
              className="h-11 w-full rounded-lg border border-border/70 bg-background pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />

          </div>

        </div>

        {/* ====================================================
            EXPERTS
            ==================================================== */}

        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <h3 className="font-medium">
              Registered experts
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Experts currently registered with IUVAI.
            </p>

          </div>

          {/* ==================================================
              LOADING
              ================================================== */}

          {isLoading && (
            <div className="flex items-center justify-center p-12">

              <Loader2 className="h-6 w-6 animate-spin text-primary" />

            </div>
          )}

          {/* ==================================================
              ERROR
              ================================================== */}

          {!isLoading && error && (
            <div className="p-6">

              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">

                <p className="text-sm font-medium text-destructive">
                  Unable to load experts
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {error}
                </p>

              </div>

            </div>
          )}

          {/* ==================================================
              EMPTY
              ================================================== */}

          {!isLoading &&
            !error &&
            filteredExperts.length === 0 && (
              <div className="p-10 text-center">

                <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />

                <p className="mt-3 text-sm font-medium">
                  {search
                    ? 'No experts found'
                    : 'No experts registered yet'}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {search
                    ? 'Try a different search.'
                    : 'Experts will appear here once they register with IUVAI.'}
                </p>

              </div>
            )}

          {/* ==================================================
              EXPERT LIST
              ================================================== */}

          {!isLoading &&
            !error &&
            filteredExperts.length > 0 && (
              <div className="divide-y divide-border/60">

                {filteredExperts.map(
                  (expert) => {

                    const name =
                      expert.profile?.full_name ||
                      'Unnamed expert';

                    const country =
                      expert.profile?.country ||
                      'Country not specified';

                    const field =
                      expert.primary_field ||
                      'Field not specified';

                    const specialization =
                      expert.specialization ||
                      '';

                    return (
                      <Link
                        key={expert.id}
                        href={`/admin/experts/${expert.id}`}
                        className="group block transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/40"
                      >

                        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">

                          {/* =================================
                              EXPERT INFORMATION
                              ================================= */}

                          <div className="flex min-w-0 items-center gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">

                              <span className="text-sm font-semibold">

                                {name
                                  .charAt(0)
                                  .toUpperCase()}

                              </span>

                            </div>

                            <div className="min-w-0">

                              <p className="font-medium">
                                {name}
                              </p>

                              <p className="mt-1 text-sm text-muted-foreground">

                                {field}

                                {specialization
                                  ? ` · ${specialization}`
                                  : ''}

                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {country}
                              </p>

                            </div>

                          </div>

                          {/* =================================
                              STATUS / ACTION
                              ================================= */}

                          <div className="flex shrink-0 items-center gap-3">

                            <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
                              Pending review
                            </span>

                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />

                          </div>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </div>

    </AppLayout>
  );
}

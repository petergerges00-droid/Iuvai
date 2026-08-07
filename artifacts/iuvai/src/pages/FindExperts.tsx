import { useEffect, useState } from ‘react’;
import { Link } from ‘wouter’;
import {
Search,
SlidersHorizontal,
UserCircle2,
MapPin,
BriefcaseBusiness,
Clock3,
ChevronRight,
X,
Loader2,
AlertCircle,
} from ‘lucide-react’;

import AppLayout from ‘@/components/layout/app-layout’;
import {
getExperts,
searchExperts,
ExpertWithProfile,
} from ‘@/lib/supabase’;

export default function FindExperts() {
const [experts, setExperts] = useState<ExpertWithProfile[]>([]);
const [searchTerm, setSearchTerm] = useState(’’);
const [countryFilter, setCountryFilter] = useState(’’);
const [fieldFilter, setFieldFilter] = useState(’’);
const [minExperience, setMinExperience] = useState(’’);
const [isLoading, setIsLoading] = useState(true);
const [isSearching, setIsSearching] = useState(false);
const [error, setError] = useState(’’);
const [showFilters, setShowFilters] = useState(false);

async function loadExperts() {
setIsLoading(true);
setError(’’);

try {
  const data = await getExperts();
  setExperts(data);
} catch (err: any) {
  console.error('Failed to load experts:', err);
  setError(
    err?.message || 'Unable to load experts. Please try again.'
  );
} finally {
  setIsLoading(false);
}

}

async function handleSearch() {
setIsSearching(true);
setError(’’);

try {
  const data = searchTerm.trim()
    ? await searchExperts(searchTerm)
    : await getExperts();
  setExperts(data);
} catch (err: any) {
  console.error('Expert search failed:', err);
  setError(
    err?.message || 'Unable to search experts. Please try again.'
  );
} finally {
  setIsSearching(false);
}

}

useEffect(() => {
loadExperts();
}, []);

const filteredExperts = experts.filter((expert) => {
const profile = expert.profile;

if (
  countryFilter &&
  !profile?.country
    ?.toLowerCase()
    .includes(countryFilter.toLowerCase())
) {
  return false;
}
if (
  fieldFilter &&
  !expert.primary_field
    ?.toLowerCase()
    .includes(fieldFilter.toLowerCase())
) {
  return false;
}
if (
  minExperience &&
  (expert.years_experience ?? 0) <
    Number(minExperience)
) {
  return false;
}
return true;

});

const hasFilters =
countryFilter ||
fieldFilter ||
minExperience;

function clearFilters() {
setCountryFilter(’’);
setFieldFilter(’’);
setMinExperience(’’);
}

return (
{/* HEADER */}
IUVAI / Expert Network
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        Find Experts
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Discover verified human experts for your AI projects.
        Search by expertise, specialization, or experience.
      </p>
    </div>
    {/* SEARCH */}
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Search by field, specialization, or AI experience..."
            className="h-11 w-full rounded-lg border border-border/70 bg-background/60 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
        <button
          type="button"
          onClick={() =>
            setShowFilters((current) => !current)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border/70 bg-background/50 px-4 text-sm font-medium transition hover:bg-muted/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>
      {/* FILTERS */}
      {showFilters && (
        <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-medium">
              Country
            </label>
            <input
              value={countryFilter}
              onChange={(event) =>
                setCountryFilter(event.target.value)
              }
              placeholder="e.g. Egypt"
              className="h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium">
              Primary field
            </label>
            <input
              value={fieldFilter}
              onChange={(event) =>
                setFieldFilter(event.target.value)
              }
              placeholder="e.g. Medicine"
              className="h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium">
              Minimum experience
            </label>
            <select
              value={minExperience}
              onChange={(event) =>
                setMinExperience(event.target.value)
              }
              className="h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Any experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
              <option value="15">15+ years</option>
            </select>
          </div>
        </div>
      )}
    </div>
    {/* RESULTS HEADER */}
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">
          {isLoading
            ? 'Loading experts...'
            : `${filteredExperts.length} expert${
                filteredExperts.length === 1 ? '' : 's'
              } found`}
        </p>
        {!isLoading && hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}
      </div>
    </div>
    {/* ERROR */}
    {error && (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm font-medium">
              Unable to load experts
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {error}
            </p>
            <button
              type="button"
              onClick={loadExperts}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )}
    {/* LOADING */}
    {isLoading && !error && (
      <div className="grid gap-5 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card/60"
          />
        ))}
      </div>
    )}
    {/* EMPTY */}
    {!isLoading &&
      !error &&
      filteredExperts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-muted/30">
            <UserCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-base font-semibold">
            No experts found
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Try changing your search terms or removing some
            filters.
          </p>
          {(searchTerm || hasFilters) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                clearFilters();
                loadExperts();
              }}
              className="mt-5 text-sm font-medium text-primary hover:underline"
            >
              Reset search
            </button>
          )}
        </div>
      )}
    {/* EXPERT GRID */}
    {!isLoading &&
      !error &&
      filteredExperts.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredExperts.map((expert) => {
            const profile = expert.profile;
            return (
              <div
                key={expert.id}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.03]"
              >
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/[0.04] blur-3xl transition-all group-hover:bg-primary/[0.08]" />
                <div className="relative">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                        <UserCircle2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold">
                          {profile?.full_name ||
                            'IUVAI Expert'}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {expert.specialization ||
                            expert.primary_field ||
                            'Professional Expert'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.15em] text-primary">
                      Verified
                    </div>
                  </div>
                  {/* META */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {expert.primary_field && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">
                          {expert.primary_field}
                        </span>
                      </div>
                    )}
                    {profile?.country && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">
                          {profile.country}
                        </span>
                      </div>
                    )}
                    {expert.years_experience !== null &&
                      expert.years_experience !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {expert.years_experience} years
                            experience
                          </span>
                        </div>
                      )}
                    {expert.availability_hours !== null &&
                      expert.availability_hours !== undefined && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {expert.availability_hours} hrs/week
                          </span>
                        </div>
                      )}
                  </div>
                  {/* SKILLS */}
                  {expert.skills &&
                    expert.skills.length > 0 && (
                      <div className="mt-5">
                        <div className="flex flex-wrap gap-2">
                          {expert.skills
                            .slice(0, 5)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] text-muted-foreground"
                              >
                                {skill}
                              </span>
                            ))}
                          {expert.skills.length > 5 && (
                            <span className="rounded-md border border-border/60 bg-muted/30 px-2.5 py-1 text-[10px] text-muted-foreground">
                              +{expert.skills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  {/* ACTION */}
                  <div className="mt-6 border-t border-border/60 pt-5">
                    <Link
                      href={`/company/find-experts/${expert.id}`}
                      className="inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      View expert
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
  </div>
</AppLayout>

);
}

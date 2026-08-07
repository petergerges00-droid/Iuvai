import { useEffect, useMemo, useState } from ‘react’;
import {
ArrowLeft,
Check,
Loader2,
Search,
UserPlus,
Users,
X,
} from ‘lucide-react’;
import { useLocation, useParams } from ‘wouter’;
import { AppLayout } from ‘@/components/layout/app-layout’;
import {
assignExpertToProject,
getAdminProject,
getExperts,
getProjectAssignments,
getProjectExperts,
removeExpertFromProject,
ExpertWithProfile,
Project,
ProjectExpert,
} from ‘@/lib/supabase’;

function calculateMatchScore(
expert: ExpertWithProfile,
project: Project
): number {
let score = 0;

const field =
expert.primary_field?.toLowerCase() || ‘’;

const specialization =
expert.specialization?.toLowerCase() || ‘’;

const projectField =
project.primary_field?.toLowerCase() || ‘’;

const projectSpecialization =
project.specialization?.toLowerCase() || ‘’;

const skills = (expert.skills || []).map((skill) =>
skill.toLowerCase()
);

const requiredSkills = (
project.required_skills || []
).map((skill) => skill.toLowerCase());

// Primary field: 35 points
if (
projectField &&
field &&
field.includes(projectField)
) {
score += 35;
}

// Specialization: 30 points
if (
projectSpecialization &&
specialization &&
(
specialization.includes(
projectSpecialization
) ||
projectSpecialization.includes(
specialization
)
)
) {
score += 30;
}

// Skills: 25 points
if (requiredSkills.length > 0) {
const matchingSkills =
requiredSkills.filter((required) =>
skills.some(
(skill) =>
skill.includes(required) ||
required.includes(skill)
)
);

score += Math.round(
  (matchingSkills.length /
    requiredSkills.length) *
    25
);

}

// Previous AI experience: 10 points
if (
expert.previous_ai_experience?.trim()
) {
score += 10;
}

return Math.min(score, 100);
}

export default function AdminProjectExperts() {
const { projectId } = useParams<{
projectId: string;
}>();

const [, setLocation] = useLocation();

const [project, setProject] =
useState<Project | null>(null);

const [experts, setExperts] =
useState<ExpertWithProfile[]>([]);

const [assignments, setAssignments] =
useState<ProjectExpert[]>([]);

const [assignedExperts, setAssignedExperts] =
useState<ExpertWithProfile[]>([]);

const [searchTerm, setSearchTerm] =
useState(’’);

const [isLoading, setIsLoading] =
useState(true);

const [error, setError] =
useState<string | null>(null);

const [assigningExpertId, setAssigningExpertId] =
useState<string | null>(null);

const [removingExpertId, setRemovingExpertId] =
useState<string | null>(null);

useEffect(() => {
if (!projectId) {
setError(‘Missing project ID.’);
setIsLoading(false);
return;
}

async function loadPage() {
  try {
    setIsLoading(true);
    setError(null);
    const [
      projectData,
      expertsData,
      assignmentsData,
      assignedExpertsData,
    ] = await Promise.all([
      getAdminProject(projectId),
      getExperts(),
      getProjectAssignments(projectId),
      getProjectExperts(projectId),
    ]);
    if (!projectData) {
      throw new Error(
        'Project could not be found.'
      );
    }
    setProject(projectData);
    setExperts(expertsData);
    setAssignments(assignmentsData);
    setAssignedExperts(
      assignedExpertsData
    );
  } catch (err) {
    console.error(
      'ADMIN PROJECT EXPERT LOAD ERROR:',
      err
    );
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to load project experts.'
    );
  } finally {
    setIsLoading(false);
  }
}
loadPage();

}, [projectId]);

const assignedExpertIds = useMemo(
() =>
new Set(
assignments.map(
(assignment) =>
assignment.expert_id
)
),
[assignments]
);

const rankedExperts = useMemo(() => {
if (!project) return [];

const filtered = experts.filter(
  (expert) => {
    const term =
      searchTerm.trim().toLowerCase();
    if (!term) return true;
    const searchable = [
      expert.profile?.full_name || '',
      expert.profile?.country || '',
      expert.primary_field || '',
      expert.specialization || '',
      expert.previous_ai_experience || '',
      ...(expert.skills || []),
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(term);
  }
);
return filtered
  .map((expert) => ({
    expert,
    score: calculateMatchScore(
      expert,
      project
    ),
  }))
  .sort((a, b) => b.score - a.score);

}, [experts, project, searchTerm]);

async function handleAssign(
expertId: string
) {
if (!projectId) return;

try {
  setAssigningExpertId(expertId);
  setError(null);
  const assignment =
    await assignExpertToProject(
      projectId,
      expertId
    );
  setAssignments((current) => [
    assignment,
    ...current,
  ]);
  const expert = experts.find(
    (item) => item.id === expertId
  );
  if (expert) {
    setAssignedExperts((current) => [
      expert,
      ...current,
    ]);
  }
} catch (err) {
  console.error(
    'ASSIGN EXPERT ERROR:',
    err
  );
  setError(
    err instanceof Error
      ? err.message
      : 'Failed to assign expert.'
  );
} finally {
  setAssigningExpertId(null);
}

}

async function handleRemove(
expertId: string
) {
if (!projectId) return;

try {
  setRemovingExpertId(expertId);
  setError(null);
  await removeExpertFromProject(
    projectId,
    expertId
  );
  setAssignments((current) =>
    current.filter(
      (assignment) =>
        assignment.expert_id !== expertId
    )
  );
  setAssignedExperts((current) =>
    current.filter(
      (expert) => expert.id !== expertId
    )
  );
} catch (err) {
  console.error(
    'REMOVE EXPERT ERROR:',
    err
  );
  setError(
    err instanceof Error
      ? err.message
      : 'Failed to remove expert.'
  );
} finally {
  setRemovingExpertId(null);
}

}

function goBack() {
setLocation(’/admin/projects’);
}

if (isLoading) {
return (
);
}

if (error && !project) {
return (
Back to projects
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    </div>
  </AppLayout>
);

}

if (!project) return null;

return (
    {/* HEADER */}
    <div>
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </button>
      <div className="mt-5 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
          IUVAI / Matching
        </p>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
        {project.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {project.description ||
          'No project description provided.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.primary_field && (
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {project.primary_field}
          </span>
        )}
        {project.specialization && (
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {project.specialization}
          </span>
        )}
        {project.project_type && (
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {project.project_type}
          </span>
        )}
        {project.budget && (
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {project.budget}
          </span>
        )}
        {project.duration && (
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
            {project.duration}
          </span>
        )}
      </div>
    </div>
    {/* ERROR */}
    {error && (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    )}
    {/* ASSIGNED EXPERTS */}
    <div className="rounded-2xl border border-border/60 bg-card/70">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <div>
          <h3 className="font-medium">
            Assigned experts
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Experts currently connected to this project.
          </p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
          {assignedExperts.length}
        </span>
      </div>
      {assignedExperts.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            No experts assigned
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select experts from the matching list below.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {assignedExperts.map((expert) => {
            const assignment =
              assignments.find(
                (item) =>
                  item.expert_id ===
                  expert.id
              );
            return (
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
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
                    {assignment?.status ||
                      'assigned'}
                  </span>
                  <button
                    type="button"
                    disabled={
                      removingExpertId ===
                      expert.id
                    }
                    onClick={() =>
                      handleRemove(
                        expert.id
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-50"
                  >
                    {removingExpertId ===
                    expert.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    {/* MATCHING */}
    <div className="rounded-2xl border border-border/60 bg-card/70">
      <div className="border-b border-border/60 p-5">
        <h3 className="font-medium">
          Find experts
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Experts are ranked using field, specialization, skills, and AI experience.
        </p>
        <div className="relative mt-4 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Search by name, field, specialization, skill..."
            className="h-11 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      {rankedExperts.length === 0 ? (
        <div className="p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium">
            No matching experts
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try changing your search.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {rankedExperts.map(
            ({ expert, score }) => {
              const isAssigned =
                assignedExpertIds.has(
                  expert.id
                );
              return (
                <div
                  key={expert.id}
                  className="p-5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium">
                          {expert.profile
                            ?.full_name ||
                            'Unnamed expert'}
                        </p>
                        <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
                          {score}% Match
                        </span>
                        {isAssigned && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground">
                            <Check className="h-3 w-3" />
                            Assigned
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {expert.primary_field ||
                          'Field not specified'}
                        {expert.specialization
                          ? ` · ${expert.specialization}`
                          : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {expert.profile
                          ?.country ||
                          'Country not specified'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {expert.skills
                          ?.slice(0, 8)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {expert.years_experience !==
                          null && (
                          <span>
                            {expert.years_experience}{' '}
                            years experience
                          </span>
                        )}
                        {expert.availability_hours !==
                          null && (
                          <span>
                            {expert.availability_hours}{' '}
                            hrs/week
                          </span>
                        )}
                        {expert.previous_ai_experience && (
                          <span>
                            AI experience
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isAssigned ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border/60 px-4 text-xs font-medium text-muted-foreground"
                        >
                          <Check className="h-4 w-4" />
                          Assigned
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            assigningExpertId ===
                            expert.id
                          }
                          onClick={() =>
                            handleAssign(
                              expert.id
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {assigningExpertId ===
                          expert.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Assign expert
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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

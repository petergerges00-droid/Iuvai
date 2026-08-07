import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  UserPlus,
  X,
} from 'lucide-react';
import { useLocation, useRoute } from 'wouter';

import { AppLayout } from '@/components/layout/app-layout';

import {
  getProject,
  getExperts,
  getProjectExperts,
  assignExpertToProject,
  removeExpertFromProject,
  Project,
  ExpertWithProfile,
} from '@/lib/supabase';

export default function ProjectExperts() {
  const [, params] = useRoute('/admin/projects/:projectId');
  const [, setLocation] = useLocation();

  const projectId = params?.projectId;

  const [project, setProject] =
    useState<Project | null>(null);

  const [experts, setExperts] = useState<
    ExpertWithProfile[]
  >([]);

  const [assignedExperts, setAssignedExperts] =
    useState<ExpertWithProfile[]>([]);

  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const [assigningId, setAssigningId] =
    useState<string | null>(null);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);

        const [
          projectData,
          expertsData,
          assignedData,
        ] = await Promise.all([
          getProject(projectId),
          getExperts(),
          getProjectExperts(projectId),
        ]);

        setProject(projectData);
        setExperts(expertsData);
        setAssignedExperts(assignedData);
      } catch (err) {
        console.error(
          'PROJECT EXPERT LOAD ERROR:',
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

    loadData();
  }, [projectId]);

  const assignedIds = useMemo(
    () =>
      new Set(
        assignedExperts.map(
          (expert) => expert.id
        )
      ),
    [assignedExperts]
  );

  /*
   * Basic MVP matching algorithm.
   *
   * +3 primary field match
   * +3 specialization match
   * +1 for every required skill match
   */
  const rankedExperts = useMemo(() => {
    if (!project) return [];

    const projectField =
      project.primary_field
        ?.toLowerCase()
        .trim();

    const projectSpecialization =
      project.specialization
        ?.toLowerCase()
        .trim();

    const requiredSkills =
      project.required_skills?.map(
        (skill) =>
          skill.toLowerCase().trim()
      ) || [];

    return experts
      .filter(
        (expert) =>
          !assignedIds.has(expert.id)
      )
      .map((expert) => {
        let score = 0;

        const expertField =
          expert.primary_field
            ?.toLowerCase()
            .trim();

        const expertSpecialization =
          expert.specialization
            ?.toLowerCase()
            .trim();

        const expertSkills =
          expert.skills?.map(
            (skill) =>
              skill.toLowerCase().trim()
          ) || [];

        if (
          projectField &&
          expertField &&
          expertField.includes(projectField)
        ) {
          score += 3;
        }

        if (
          projectSpecialization &&
          expertSpecialization &&
          expertSpecialization.includes(
            projectSpecialization
          )
        ) {
          score += 3;
        }

        for (const requiredSkill of requiredSkills) {
          if (
            expertSkills.some(
              (skill) =>
                skill.includes(requiredSkill) ||
                requiredSkill.includes(skill)
            )
          ) {
            score += 1;
          }
        }

        return {
          expert,
          score,
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score
      );
  }, [
    experts,
    project,
    assignedIds,
  ]);

  const filteredExperts =
    rankedExperts.filter(
      ({ expert }) => {
        const term =
          search.toLowerCase().trim();

        if (!term) return true;

        const name =
          expert.profile?.full_name
            ?.toLowerCase() || '';

        const field =
          expert.primary_field
            ?.toLowerCase() || '';

        const specialization =
          expert.specialization
            ?.toLowerCase() || '';

        const skills =
          expert.skills
            ?.join(' ')
            .toLowerCase() || '';

        return (
          name.includes(term) ||
          field.includes(term) ||
          specialization.includes(term) ||
          skills.includes(term)
        );
      }
    );

  async function handleAssign(
    expert: ExpertWithProfile
  ) {
    if (!projectId) return;

    try {
      setAssigningId(expert.id);

      await assignExpertToProject(
        projectId,
        expert.id
      );

      setAssignedExperts(
        (current) => [
          ...current,
          expert,
        ]
      );
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
      setAssigningId(null);
    }
  }

  async function handleRemove(
    expert: ExpertWithProfile
  ) {
    if (!projectId) return;

    try {
      setRemovingId(expert.id);

      await removeExpertFromProject(
        projectId,
        expert.id
      );

      setAssignedExperts(
        (current) =>
          current.filter(
            (item) =>
              item.id !== expert.id
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
      setRemovingId(null);
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Project Experts">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Project Experts">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Project not found.
          </p>

          <button
            onClick={() =>
              setLocation('/admin')
            }
            className="mt-4 text-sm text-primary"
          >
            Back to admin
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Project Experts">
      <div className="space-y-8">

        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() =>
              setLocation('/admin')
            }
            className="mb-5 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to projects
          </button>

          <p className="text-[10px] uppercase tracking-[0.25em] text-primary">
            IUVAI / Recruitment
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {project.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {project.primary_field && (
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs">
                {project.primary_field}
              </span>
            )}

            {project.specialization && (
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs">
                {project.specialization}
              </span>
            )}

            {project.project_type && (
              <span className="rounded-full border border-border/60 px-3 py-1 text-xs">
                {project.project_type}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}

            <button
              onClick={() =>
                setError(null)
              }
              className="ml-3 underline"
            >
              dismiss
            </button>
          </div>
        )}

        {/* Assigned experts */}
        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">
            <h3 className="font-medium">
              Assigned experts
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Experts currently assigned to this project.
            </p>
          </div>

          {assignedExperts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No experts assigned yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {assignedExperts.map(
                (expert) => (
                  <div
                    key={expert.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-medium">
                        {expert.profile
                          ?.full_name ||
                          'Unnamed expert'}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {expert.primary_field ||
                          'Field not specified'}
                        {expert.specialization
                          ? ` · ${expert.specialization}`
                          : ''}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        removingId ===
                        expert.id
                      }
                      onClick={() =>
                        handleRemove(
                          expert
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs hover:bg-muted disabled:opacity-50"
                    >
                      {removingId ===
                      expert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}

                      Remove
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Matching experts */}
        <div className="rounded-2xl border border-border/60 bg-card/70">

          <div className="border-b border-border/60 p-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h3 className="font-medium">
                  Matching experts
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Experts ranked by field, specialization and skills.
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search experts..."
                  className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>

            </div>
          </div>

          {filteredExperts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No matching experts found.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">

              {filteredExperts.map(
                ({ expert, score }) => (
                  <div
                    key={expert.id}
                    className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                  >

                    <div className="min-w-0">

                      <div className="flex items-center gap-3">
                        <p className="font-medium">
                          {expert.profile
                            ?.full_name ||
                            'Unnamed expert'}
                        </p>

                        {score > 0 && (
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10px] font-medium text-primary">
                            Match {score}
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

                      {expert.skills &&
                        expert.skills.length >
                          0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {expert.skills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-border/60 px-2.5 py-1 text-[10px] text-muted-foreground"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>

                    <button
                      type="button"
                      disabled={
                        assigningId ===
                        expert.id
                      }
                      onClick={() =>
                        handleAssign(
                          expert
                        )
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {assigningId ===
                      expert.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}

                      Assign
                    </button>

                  </div>
                )
              )}

            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

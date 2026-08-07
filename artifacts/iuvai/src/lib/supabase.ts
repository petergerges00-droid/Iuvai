import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type AccountType = 'expert' | 'company';

export type ProjectStatus =
  | 'draft'
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ProjectRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export type ProjectExpertStatus =
  | 'assigned'
  | 'accepted'
  | 'declined'
  | 'completed';

export interface Profile {
  id: string;
  full_name: string | null;
  account_type: AccountType | null;
  country: string | null;
  created_at: string;
}

export interface ExpertProfile {
  id: string;
  primary_field: string | null;
  specialization: string | null;
  years_experience: number | null;
  highest_qualification: string | null;
  skills: string[] | null;
  languages: string[] | null;
  previous_ai_experience: string | null;
  availability_hours: number | null;
  created_at: string;
  resume_path: string | null;
  resume_file_name: string | null;
}

export interface CompanyProfile {
  id: string;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  company_description: string | null;
  company_size: string | null;
  created_at: string;
}

export interface ExpertWithProfile extends ExpertProfile {
  profile?: Profile | null;
}

export interface Project {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  primary_field: string | null;
  specialization: string | null;
  required_skills: string[] | null;
  project_type: string | null;
  budget: string | null;
  duration: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectRequest {
  id: string;
  project_id: string;
  expert_id: string;
  company_id: string;
  message: string | null;
  status: ProjectRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectExpert {
  id: string;
  project_id: string;
  expert_id: string;
  status: ProjectExpertStatus;
  assigned_at: string;
  notes: string | null;
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string
) {
  return supabase.auth.signUp({
    email,
    password,
  });
}

export async function signIn(
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({
    password,
  });
}

// ─────────────────────────────────────────────────────────────
// PROFILE HELPERS
// ─────────────────────────────────────────────────────────────

export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('GET PROFILE ERROR:', error);
    return null;
  }

  return data as Profile;
}

export async function upsertProfile(
  profile: Partial<Profile> & { id: string }
) {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile, {
      onConflict: 'id',
    });

  if (error) {
    throw new Error(
      `Failed to save profile: ${error.message}`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// EXPERT PROFILE
// ─────────────────────────────────────────────────────────────

export async function getExpertProfile(
  userId: string
): Promise<ExpertProfile | null> {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(
      'GET EXPERT PROFILE ERROR:',
      error
    );

    return null;
  }

  return data as ExpertProfile;
}

export async function upsertExpertProfile(
  profile: Partial<ExpertProfile> & { id: string }
) {
  const { data, error } = await supabase
    .from('expert_profiles')
    .upsert(profile, {
      onConflict: 'id',
    })
    .select();

  console.log('EXPERT PROFILE UPSERT:', {
    data,
    error,
    profile,
  });

  if (error) {
    throw new Error(
      `Expert profile failed: ${error.message} | Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`
    );
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROFILE
// ─────────────────────────────────────────────────────────────

export async function getCompanyProfile(
  userId: string
): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(
      'GET COMPANY PROFILE ERROR:',
      error
    );

    return null;
  }

  return data as CompanyProfile;
}

export async function upsertCompanyProfile(
  profile: Partial<CompanyProfile> & { id: string }
) {
  const { error } = await supabase
    .from('company_profiles')
    .upsert(profile, {
      onConflict: 'id',
    });

  if (error) {
    throw new Error(
      `Failed to save company profile: ${error.message}`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// EXPERT DISCOVERY
// ─────────────────────────────────────────────────────────────

/**
 * Get all expert profiles with their public profiles.
 *
 * This intentionally uses TWO queries instead of a nested
 * Supabase relationship.
 *
 * expert_profiles.id === profiles.id
 */
export async function getExperts(): Promise<
  ExpertWithProfile[]
> {
  // Get expert profiles
  const {
    data: expertProfiles,
    error: expertError,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  console.log('GET EXPERT PROFILES RAW:', {
    data: expertProfiles,
    error: expertError,
  });

  if (expertError) {
    console.error(
      'GET EXPERT PROFILES ERROR:',
      expertError
    );

    throw new Error(
      `Failed to load expert profiles: ${expertError.message}`
    );
  }

  if (
    !expertProfiles ||
    expertProfiles.length === 0
  ) {
    return [];
  }

  // Get matching public profiles
  const expertIds = expertProfiles.map(
    (expert) => expert.id
  );

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      account_type,
      country,
      created_at
    `)
    .in('id', expertIds);

  console.log('GET EXPERT PUBLIC PROFILES RAW:', {
    data: profiles,
    error: profileError,
  });

  if (profileError) {
    console.error(
      'GET EXPERT PUBLIC PROFILES ERROR:',
      profileError
    );

    throw new Error(
      `Failed to load expert profiles: ${profileError.message}`
    );
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return expertProfiles.map((expert) => ({
    ...expert,
    profile:
      profileMap.get(expert.id) || null,
  })) as ExpertWithProfile[];
}

/**
 * Search experts by field, specialization,
 * AI experience, country, or name.
 *
 * Uses separate queries to avoid relying on a
 * Supabase foreign-key relationship.
 */
export async function searchExperts(
  searchTerm: string
): Promise<ExpertWithProfile[]> {
  const term = searchTerm.trim();

  if (!term) {
    return getExperts();
  }

  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .or(
      `primary_field.ilike.%${term}%,` +
        `specialization.ilike.%${term}%,` +
        `previous_ai_experience.ilike.%${term}%`
    )
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'SEARCH EXPERTS ERROR:',
      error
    );

    throw new Error(
      `Failed to search experts: ${error.message}`
    );
  }

  if (!data || data.length === 0) {
    return [];
  }

  const expertIds = data.map(
    (expert) => expert.id
  );

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      account_type,
      country,
      created_at
    `)
    .in('id', expertIds);

  if (profileError) {
    throw new Error(
      `Failed to load expert profiles: ${profileError.message}`
    );
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return data.map((expert) => ({
    ...expert,
    profile:
      profileMap.get(expert.id) || null,
  })) as ExpertWithProfile[];
}

/**
 * Get experts by primary field.
 */
export async function getExpertsByField(
  primaryField: string
): Promise<ExpertWithProfile[]> {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .ilike(
      'primary_field',
      `%${primaryField}%`
    )
    .order('years_experience', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load experts: ${error.message}`
    );
  }

  if (!data || data.length === 0) {
    return [];
  }

  const expertIds = data.map(
    (expert) => expert.id
  );

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      account_type,
      country,
      created_at
    `)
    .in('id', expertIds);

  if (profileError) {
    throw new Error(
      `Failed to load expert profiles: ${profileError.message}`
    );
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return data.map((expert) => ({
    ...expert,
    profile:
      profileMap.get(expert.id) || null,
  })) as ExpertWithProfile[];
}

/**
 * Get one expert with public profile information.
 */
export async function getExpertWithProfile(
  expertId: string
): Promise<ExpertWithProfile | null> {
  const {
    data: expert,
    error: expertError,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('id', expertId)
    .single();

  if (expertError) {
    console.error(
      'GET EXPERT ERROR:',
      expertError
    );

    return null;
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      account_type,
      country,
      created_at
    `)
    .eq('id', expertId)
    .maybeSingle();

  if (profileError) {
    console.error(
      'GET EXPERT PUBLIC PROFILE ERROR:',
      profileError
    );

    return {
      ...(expert as ExpertProfile),
      profile: null,
    };
  }

  return {
    ...(expert as ExpertProfile),
    profile: profile || null,
  };
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROJECTS
// ─────────────────────────────────────────────────────────────

export async function createProject(
  project: Omit<
    Project,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create project: ${error.message}`
    );
  }

  return data as Project;
}

export async function getCompanyProjects(
  companyId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load company projects: ${error.message}`
    );
  }

  return (data || []) as Project[];
}

export async function getProject(
  projectId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error(
      'GET PROJECT ERROR:',
      error
    );

    return null;
  }

  return data as Project;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update project: ${error.message}`
    );
  }

  return data as Project;
}

export async function deleteProject(
  projectId: string
) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    throw new Error(
      `Failed to delete project: ${error.message}`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN PROJECT MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'GET ALL PROJECTS ERROR:',
      error
    );

    throw new Error(
      `Failed to load projects: ${error.message}`
    );
  }

  return (data || []) as Project[];
}

export async function getAdminProject(
  projectId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error(
      'GET ADMIN PROJECT ERROR:',
      error
    );

    return null;
  }

  return data as Project;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update project status: ${error.message}`
    );
  }

  return data as Project;
}

// ─────────────────────────────────────────────────────────────
// PROJECT REQUESTS
// ─────────────────────────────────────────────────────────────

export async function createProjectRequest(
  request: Omit<
    ProjectRequest,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<ProjectRequest> {
  const { data, error } = await supabase
    .from('project_requests')
    .insert(request)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to send project request: ${error.message}`
    );
  }

  return data as ProjectRequest;
}

export async function getCompanyProjectRequests(
  companyId: string
): Promise<ProjectRequest[]> {
  const { data, error } = await supabase
    .from('project_requests')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load project requests: ${error.message}`
    );
  }

  return (data || []) as ProjectRequest[];
}

export async function getExpertProjectRequests(
  expertId: string
): Promise<ProjectRequest[]> {
  const { data, error } = await supabase
    .from('project_requests')
    .select('*')
    .eq('expert_id', expertId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load expert requests: ${error.message}`
    );
  }

  return (data || []) as ProjectRequest[];
}

export async function updateProjectRequestStatus(
  requestId: string,
  status: ProjectRequestStatus
): Promise<ProjectRequest> {
  const { data, error } = await supabase
    .from('project_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update request: ${error.message}`
    );
  }

  return data as ProjectRequest;
}

// ─────────────────────────────────────────────────────────────
// RESUME STORAGE
// ─────────────────────────────────────────────────────────────

export async function uploadResume(
  userId: string,
  file: File
) {
  const extension =
    file.name.split('.').pop()?.toLowerCase() ||
    'pdf';

  const filePath = `${userId}/resume.${extension}`;

  const { data: existingFiles } =
    await supabase.storage
      .from('resumes')
      .list(userId);

  if (
    existingFiles &&
    existingFiles.length > 0
  ) {
    const filesToRemove =
      existingFiles.map(
        (file) =>
          `${userId}/${file.name}`
      );

    const { error: removeError } =
      await supabase.storage
        .from('resumes')
        .remove(filesToRemove);

    if (removeError) {
      console.warn(
        'Could not remove old resume:',
        removeError
      );
    }
  }

  const { error: uploadError } =
    await supabase.storage
      .from('resumes')
      .upload(
        filePath,
        file,
        {
          upsert: true,
          contentType:
            file.type ||
            'application/pdf',
        }
      );

  if (uploadError) {
    throw new Error(
      `Resume upload failed: ${uploadError.message}`
    );
  }

  await upsertExpertProfile({
    id: userId,
    resume_path: filePath,
    resume_file_name: file.name,
  });

  return filePath;
}

export async function deleteResume(
  userId: string
) {
  const { data: files } =
    await supabase.storage
      .from('resumes')
      .list(userId);

  if (
    files &&
    files.length > 0
  ) {
    const { error } =
      await supabase.storage
        .from('resumes')
        .remove(
          files.map(
            (file) =>
              `${userId}/${file.name}`
          )
        );

    if (error) {
      console.warn(
        'Could not remove resume files:',
        error
      );
    }
  }

  await upsertExpertProfile({
    id: userId,
    resume_path: null,
    resume_file_name: null,
  });
}

// ─────────────────────────────────────────────────────────────
// PROJECT ↔ EXPERT ASSIGNMENTS
// ─────────────────────────────────────────────────────────────

/**
 * Get experts assigned to a project.
 *
 * Uses separate queries rather than relying on a nested
 * Supabase relationship.
 */
export async function getProjectExperts(
  projectId: string
): Promise<ExpertWithProfile[]> {
  // Get assignment records
  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from('project_experts')
    .select('expert_id')
    .eq('project_id', projectId);

  if (assignmentError) {
    console.error(
      'GET PROJECT ASSIGNMENTS ERROR:',
      assignmentError
    );

    throw new Error(
      `Failed to load project assignments: ${assignmentError.message}`
    );
  }

  if (
    !assignments ||
    assignments.length === 0
  ) {
    return [];
  }

  const expertIds = assignments.map(
    (assignment) =>
      assignment.expert_id
  );

  // Get expert profiles
  const {
    data: expertProfiles,
    error: expertError,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .in('id', expertIds);

  if (expertError) {
    console.error(
      'GET PROJECT EXPERT PROFILES ERROR:',
      expertError
    );

    throw new Error(
      `Failed to load project experts: ${expertError.message}`
    );
  }

  if (
    !expertProfiles ||
    expertProfiles.length === 0
  ) {
    return [];
  }

  // Get public profiles
  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      account_type,
      country,
      created_at
    `)
    .in('id', expertIds);

  if (profileError) {
    throw new Error(
      `Failed to load expert profiles: ${profileError.message}`
    );
  }

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  return expertProfiles.map((expert) => ({
    ...expert,
    profile:
      profileMap.get(expert.id) || null,
  })) as ExpertWithProfile[];
}

/**
 * Get full assignment records for a project.
 */
export async function getProjectAssignments(
  projectId: string
): Promise<ProjectExpert[]> {
  const { data, error } = await supabase
    .from('project_experts')
    .select('*')
    .eq('project_id', projectId)
    .order('assigned_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load project assignments: ${error.message}`
    );
  }

  return (data || []) as ProjectExpert[];
}

/**
 * Assign an expert to a project.
 */
export async function assignExpertToProject(
  projectId: string,
  expertId: string,
  notes?: string
): Promise<ProjectExpert> {
  const {
    data: existing,
    error: existingError,
  } = await supabase
    .from('project_experts')
    .select('id')
    .eq('project_id', projectId)
    .eq('expert_id', expertId)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Failed to check existing assignment: ${existingError.message}`
    );
  }

  if (existing) {
    throw new Error(
      'This expert is already assigned to this project.'
    );
  }

  const { data, error } = await supabase
    .from('project_experts')
    .insert({
      project_id: projectId,
      expert_id: expertId,
      status: 'assigned',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to assign expert: ${error.message}`
    );
  }

  return data as ProjectExpert;
}

/**
 * Remove an expert from a project.
 */
export async function removeExpertFromProject(
  projectId: string,
  expertId: string
) {
  const { error } = await supabase
    .from('project_experts')
    .delete()
    .eq('project_id', projectId)
    .eq('expert_id', expertId);

  if (error) {
    throw new Error(
      `Failed to remove expert: ${error.message}`
    );
  }
}

/**
 * Update an expert's project assignment status.
 */
export async function updateProjectExpertStatus(
  assignmentId: string,
  status: ProjectExpertStatus
): Promise<ProjectExpert> {
  const { data, error } = await supabase
    .from('project_experts')
    .update({
      status,
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update assignment: ${error.message}`
    );
  }

  return data as ProjectExpert;
}

/**
 * Update assignment notes.
 */
export async function updateProjectExpertNotes(
  assignmentId: string,
  notes: string | null
): Promise<ProjectExpert> {
  const { data, error } = await supabase
    .from('project_experts')
    .update({
      notes,
    })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update assignment notes: ${error.message}`
    );
  }

  return data as ProjectExpert;
}

/**
 * Get all projects an expert has been assigned to.
 */
export async function getExpertProjects(
  expertId: string
): Promise<Project[]> {
  const {
    data: assignments,
    error: assignmentError,
  } = await supabase
    .from('project_experts')
    .select('project_id')
    .eq('expert_id', expertId);

  if (assignmentError) {
    throw new Error(
      `Failed to load expert projects: ${assignmentError.message}`
    );
  }

  if (
    !assignments ||
    assignments.length === 0
  ) {
    return [];
  }

  const projectIds = assignments.map(
    (assignment) =>
      assignment.project_id
  );

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds);

  if (error) {
    throw new Error(
      `Failed to load expert projects: ${error.message}`
    );
  }

  return (data || []) as Project[];
}

/**
 * Get all assignment records for an expert.
 */
export async function getExpertAssignments(
  expertId: string
): Promise<ProjectExpert[]> {
  const { data, error } = await supabase
    .from('project_experts')
    .select('*')
    .eq('expert_id', expertId)
    .order('assigned_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load expert assignments: ${error.message}`
    );
  }

  return (data || []) as ProjectExpert[];
}

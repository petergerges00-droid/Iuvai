import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────
// SUPABASE CLIENT
// ─────────────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

export type VerificationStatus =
  | 'pending'
  | 'approved'
  | 'declined';

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

// ─────────────────────────────────────────────────────────────
// PROFILE TYPES
// ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  account_type: AccountType | null;
  country: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// EXPERT PROFILE
//
// Deliberately field-agnostic.
// Medicine is only one possible primary_field.
// ─────────────────────────────────────────────────────────────

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

  verification_status: VerificationStatus;

  // Optional field-specific credential support.
  // Currently used for medical credentials because
  // those columns already exist in the database.
  medical_certificate_path: string | null;
  medical_certificate_file_name: string | null;
  medical_certificate_status: VerificationStatus;
}

export interface ExpertWithProfile
  extends ExpertProfile {
  profile?: Profile | null;
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROFILE
// ─────────────────────────────────────────────────────────────

export interface CompanyProfile {
  id: string;

  company_name: string | null;
  website: string | null;

  industry: string | null;
  company_description: string | null;
  company_size: string | null;

  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// PROJECT TYPES
//
// Also deliberately field-agnostic.
// ─────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  company_id: string | null;

  title: string;
  description: string | null;

  primary_field: string | null;
  specialization: string | null;
  required_skills: string[] | null;

  project_type: string | null;

  budget: string | null;
  duration: string | null;

  status: ProjectStatus;

  client_name: string | null;
  source: string | null;
  source_url: string | null;

  compensation: string | null;
  experts_needed: number | null;
  deadline: string | null;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// PROJECT REQUEST
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// PROJECT EXPERT ASSIGNMENT
// ─────────────────────────────────────────────────────────────

export interface ProjectExpert {
  id: string;

  project_id: string;
  expert_id: string;

  status: ProjectExpertStatus;

  assigned_at: string;

  notes: string | null;
}

// ─────────────────────────────────────────────────────────────
// INTERNAL DATABASE TYPE
//
// Your existing database unfortunately uses:
//
//   Resume_path
//   Resume_file_name
//
// with capital letters.
//
// The application interface above intentionally uses the
// cleaner resume_path / resume_file_name names.
//
// These helpers keep the rest of the application consistent
// without requiring an immediate database migration.
// ─────────────────────────────────────────────────────────────

type DatabaseExpertProfile = Omit<
  ExpertProfile,
  'resume_path' | 'resume_file_name'
> & {
  Resume_path: string | null;
  Resume_file_name: string | null;
};

function normalizeExpertProfile(
  profile: DatabaseExpertProfile
): ExpertProfile {
  const {
    Resume_path,
    Resume_file_name,
    ...rest
  } = profile;

  return {
    ...rest,
    resume_path: Resume_path ?? null,
    resume_file_name:
      Resume_file_name ?? null,
  };
}

function normalizeExpertProfiles(
  profiles: DatabaseExpertProfile[]
): ExpertProfile[] {
  return profiles.map(
    normalizeExpertProfile
  );
}

function toDatabaseExpertProfile(
  profile: Partial<ExpertProfile> & {
    id: string;
  }
) {
  const {
    resume_path,
    resume_file_name,
    ...rest
  } = profile;

  return {
    ...rest,

    ...(resume_path !== undefined
      ? {
          Resume_path: resume_path,
        }
      : {}),

    ...(resume_file_name !== undefined
      ? {
          Resume_file_name:
            resume_file_name,
        }
      : {}),
  };
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string
) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
  });
}

export async function signIn(
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ─────────────────────────────────────────────────────────────
// PASSWORD RECOVERY
// ─────────────────────────────────────────────────────────────

const PRODUCTION_URL =
  'https://6736f081.iuvai.pages.dev';

const PASSWORD_RESET_URL =
  `${PRODUCTION_URL}/reset-password`;

export async function resetPassword(
  email: string
) {
  return supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: PASSWORD_RESET_URL,
    }
  );
}

export async function updatePassword(
  password: string
) {
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
  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(
      'GET PROFILE ERROR:',
      error
    );

    return null;
  }

  return data as Profile;
}

export async function upsertProfile(
  profile: Partial<Profile> & {
    id: string;
  }
) {
  const {
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
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

  return normalizeExpertProfile(
    data as DatabaseExpertProfile
  );
}

export async function upsertExpertProfile(
  profile: Partial<ExpertProfile> & {
    id: string;
  }
) {
  const databaseProfile =
    toDatabaseExpertProfile(profile);

  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .upsert(databaseProfile, {
      onConflict: 'id',
    })
    .select();

  console.log(
    'EXPERT PROFILE UPSERT:',
    {
      data,
      error,
      profile,
    }
  );

  if (error) {
    throw new Error(
      `Expert profile failed: ${error.message} | Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`
    );
  }

  return normalizeExpertProfiles(
    (data || []) as DatabaseExpertProfile[]
  );
}

// ─────────────────────────────────────────────────────────────
// EXPERT VERIFICATION
// ─────────────────────────────────────────────────────────────

export async function updateExpertVerificationStatus(
  expertId: string,
  status: VerificationStatus
): Promise<ExpertProfile> {
  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .update({
      verification_status: status,
    })
    .eq('id', expertId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update verification status: ${error.message}`
    );
  }

  return normalizeExpertProfile(
    data as DatabaseExpertProfile
  );
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROFILE
// ─────────────────────────────────────────────────────────────

export async function getCompanyProfile(
  userId: string
): Promise<CompanyProfile | null> {
  const {
    data,
    error,
  } = await supabase
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
  profile: Partial<CompanyProfile> & {
    id: string;
  }
) {
  const {
    error,
  } = await supabase
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

async function attachProfilesToExperts(
  expertProfiles: DatabaseExpertProfile[]
): Promise<ExpertWithProfile[]> {
  if (
    !expertProfiles ||
    expertProfiles.length === 0
  ) {
    return [];
  }

  const normalized =
    normalizeExpertProfiles(
      expertProfiles
    );

  const expertIds =
    normalized.map(
      (expert) => expert.id
    );

  const {
    data: profiles,
    error: profileError,
  } =
    await supabase
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

  const profileMap =
    new Map(
      (profiles || []).map(
        (profile) => [
          profile.id,
          profile,
        ]
      )
    );

  return normalized.map(
    (expert) => ({
      ...expert,
      profile:
        profileMap.get(
          expert.id
        ) || null,
    })
  );
}

export async function getExperts(): Promise<
  ExpertWithProfile[]
> {
  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error(
      'GET EXPERT PROFILES ERROR:',
      error
    );

    throw new Error(
      `Failed to load expert profiles: ${error.message}`
    );
  }

  return attachProfilesToExperts(
    (data || []) as DatabaseExpertProfile[]
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH EXPERTS
// ─────────────────────────────────────────────────────────────

export async function searchExperts(
  searchTerm: string
): Promise<ExpertWithProfile[]> {
  const term =
    searchTerm.trim();

  if (!term) {
    return getExperts();
  }

  const {
    data,
    error,
  } = await supabase
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
    throw new Error(
      `Failed to search experts: ${error.message}`
    );
  }

  return attachProfilesToExperts(
    (data || []) as DatabaseExpertProfile[]
  );
}

// ─────────────────────────────────────────────────────────────
// EXPERTS BY FIELD
// ─────────────────────────────────────────────────────────────

export async function getExpertsByField(
  primaryField: string
): Promise<ExpertWithProfile[]> {
  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .ilike(
      'primary_field',
      `%${primaryField}%`
    )
    .order(
      'years_experience',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load experts: ${error.message}`
    );
  }

  return attachProfilesToExperts(
    (data || []) as DatabaseExpertProfile[]
  );
}

// ─────────────────────────────────────────────────────────────
// SINGLE EXPERT
// ─────────────────────────────────────────────────────────────

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
  } =
    await supabase
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

  const normalized =
    normalizeExpertProfile(
      expert as DatabaseExpertProfile
    );

  if (profileError) {
    return {
      ...normalized,
      profile: null,
    };
  }

  return {
    ...normalized,
    profile:
      profile || null,
  };
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROJECTS
// ─────────────────────────────────────────────────────────────

export async function createProject(
  project: Omit<
    Project,
    'id' |
    'created_at' |
    'updated_at'
  >
): Promise<Project> {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .select('*')
    .eq(
      'company_id',
      companyId
    )
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
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
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
  const {
    error,
  } = await supabase
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

export async function getAllProjects(): Promise<
  Project[]
> {
  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load projects: ${error.message}`
    );
  }

  return (data || []) as Project[];
}

export async function getAdminProject(
  projectId: string
): Promise<Project | null> {
  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    return null;
  }

  return data as Project;
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<Project> {
  const {
    data,
    error,
  } = await supabase
    .from('projects')
    .update({
      status,
      updated_at:
        new Date().toISOString(),
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
    'id' |
    'created_at' |
    'updated_at'
  >
): Promise<ProjectRequest> {
  const {
    data,
    error,
  } = await supabase
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
  const {
    data,
    error,
  } = await supabase
    .from('project_requests')
    .select('*')
    .eq(
      'company_id',
      companyId
    )
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
  const {
    data,
    error,
  } = await supabase
    .from('project_requests')
    .select('*')
    .eq(
      'expert_id',
      expertId
    )
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

export async function getProjectRequest(
  requestId: string
): Promise<ProjectRequest | null> {
  const {
    data,
    error,
  } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (error) {
    return null;
  }

  return data as ProjectRequest;
}

export async function getExpertProjectRequestForProject(
  expertId: string,
  projectId: string
): Promise<ProjectRequest | null> {
  const {
    data,
    error,
  } =
    await supabase
      .from('project_requests')
      .select('*')
      .eq(
        'expert_id',
        expertId
      )
      .eq(
        'project_id',
        projectId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to check project request: ${error.message}`
    );
  }

  return data as ProjectRequest | null;
}

export async function updateProjectRequestStatus(
  requestId: string,
  status: ProjectRequestStatus
): Promise<ProjectRequest> {
  const {
    data,
    error,
  } = await supabase
    .from('project_requests')
    .update({
      status,
      updated_at:
        new Date().toISOString(),
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
//
// Existing bucket: "Resumes"
// Existing database columns:
//   Resume_path
//   Resume_file_name
// ─────────────────────────────────────────────────────────────

const RESUME_BUCKET = 'Resumes';

export async function uploadResume(
  userId: string,
  file: File
) {
  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'pdf';

  const filePath =
    `${userId}/resume.${extension}`;

  const {
    data: existingFiles,
    error: listError,
  } =
    await supabase.storage
      .from(RESUME_BUCKET)
      .list(userId);

  if (listError) {
    console.warn(
      'Could not list existing resumes:',
      listError
    );
  }

  if (
    existingFiles &&
    existingFiles.length > 0
  ) {
    const filesToRemove =
      existingFiles.map(
        (existingFile) =>
          `${userId}/${existingFile.name}`
      );

    const {
      error: removeError,
    } =
      await supabase.storage
        .from(RESUME_BUCKET)
        .remove(
          filesToRemove
        );

    if (removeError) {
      console.warn(
        'Could not remove old resume:',
        removeError
      );
    }
  }

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(RESUME_BUCKET)
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
    resume_file_name:
      file.name,
  });

  return filePath;
}

export async function deleteResume(
  userId: string
) {
  const {
    data: files,
    error: listError,
  } =
    await supabase.storage
      .from(RESUME_BUCKET)
      .list(userId);

  if (listError) {
    console.warn(
      'Could not list resume files:',
      listError
    );
  }

  if (
    files &&
    files.length > 0
  ) {
    const {
      error,
    } =
      await supabase.storage
        .from(RESUME_BUCKET)
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
// MEDICAL CERTIFICATE STORAGE
//
// This remains supported because your current database already
// contains these fields.
//
// It does NOT make the overall IUVAI architecture medical.
// It is simply one optional credential type for V1.
// ─────────────────────────────────────────────────────────────

const MEDICAL_CERTIFICATE_BUCKET =
  'medical-certificates';

export async function uploadMedicalCertificate(
  userId: string,
  file: File
) {
  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'pdf';

  const filePath =
    `${userId}/medical-certificate.${extension}`;

  const {
    data: existingFiles,
    error: listError,
  } =
    await supabase.storage
      .from(
        MEDICAL_CERTIFICATE_BUCKET
      )
      .list(userId);

  if (listError) {
    console.warn(
      'Could not list existing medical certificates:',
      listError
    );
  }

  if (
    existingFiles &&
    existingFiles.length > 0
  ) {
    const filesToRemove =
      existingFiles.map(
        (existingFile) =>
          `${userId}/${existingFile.name}`
      );

    const {
      error: removeError,
    } =
      await supabase.storage
        .from(
          MEDICAL_CERTIFICATE_BUCKET
        )
        .remove(
          filesToRemove
        );

    if (removeError) {
      console.warn(
        'Could not remove old medical certificate:',
        removeError
      );
    }
  }

  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        MEDICAL_CERTIFICATE_BUCKET
      )
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
      `Medical certificate upload failed: ${uploadError.message}`
    );
  }

  await upsertExpertProfile({
    id: userId,

    medical_certificate_path:
      filePath,

    medical_certificate_file_name:
      file.name,

    medical_certificate_status:
      'pending',
  });

  return filePath;
}

export async function deleteMedicalCertificate(
  userId: string
) {
  const {
    data: files,
    error: listError,
  } =
    await supabase.storage
      .from(
        MEDICAL_CERTIFICATE_BUCKET
      )
      .list(userId);

  if (listError) {
    console.warn(
      'Could not list medical certificate files:',
      listError
    );
  }

  if (
    files &&
    files.length > 0
  ) {
    const {
      error,
    } =
      await supabase.storage
        .from(
          MEDICAL_CERTIFICATE_BUCKET
        )
        .remove(
          files.map(
            (file) =>
              `${userId}/${file.name}`
          )
        );

    if (error) {
      console.warn(
        'Could not remove medical certificate files:',
        error
      );
    }
  }

  await upsertExpertProfile({
    id: userId,

    medical_certificate_path:
      null,

    medical_certificate_file_name:
      null,

    medical_certificate_status:
      'pending',
  });
}

export async function updateMedicalCertificateStatus(
  expertId: string,
  status: VerificationStatus
): Promise<ExpertProfile> {
  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .update({
      medical_certificate_status:
        status,
    })
    .eq('id', expertId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update medical certificate status: ${error.message}`
    );
  }

  return normalizeExpertProfile(
    data as DatabaseExpertProfile
  );
}

export async function getMedicalCertificateUrl(
  certificatePath: string
): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.storage
      .from(
        MEDICAL_CERTIFICATE_BUCKET
      )
      .createSignedUrl(
        certificatePath,
        60 * 10
      );

  if (
    error ||
    !data?.signedUrl
  ) {
    throw new Error(
      `Failed to generate medical certificate URL: ${
        error?.message ||
        'Unknown error'
      }`
    );
  }

  return data.signedUrl;
}

// ─────────────────────────────────────────────────────────────
// PROJECT ↔ EXPERT ASSIGNMENTS
// ─────────────────────────────────────────────────────────────

export async function getProjectExperts(
  projectId: string
): Promise<ExpertWithProfile[]> {
  const {
    data: assignments,
    error: assignmentError,
  } =
    await supabase
      .from('project_experts')
      .select('expert_id')
      .eq(
        'project_id',
        projectId
      );

  if (assignmentError) {
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

  const expertIds =
    assignments.map(
      (assignment) =>
        assignment.expert_id
    );

  const {
    data: expertProfiles,
    error: expertError,
  } =
    await supabase
      .from('expert_profiles')
      .select('*')
      .in(
        'id',
        expertIds
      );

  if (expertError) {
    throw new Error(
      `Failed to load project experts: ${expertError.message}`
    );
  }

  return attachProfilesToExperts(
    (expertProfiles ||
      []) as DatabaseExpertProfile[]
  );
}

export async function getProjectAssignments(
  projectId: string
): Promise<ProjectExpert[]> {
  const {
    data,
    error,
  } = await supabase
    .from('project_experts')
    .select('*')
    .eq(
      'project_id',
      projectId
    )
    .order(
      'assigned_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load project assignments: ${error.message}`
    );
  }

  return (data || []) as ProjectExpert[];
}

export async function assignExpertToProject(
  projectId: string,
  expertId: string,
  notes?: string
): Promise<ProjectExpert> {
  const {
    data: existing,
    error: existingError,
  } =
    await supabase
      .from('project_experts')
      .select('id')
      .eq(
        'project_id',
        projectId
      )
      .eq(
        'expert_id',
        expertId
      )
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

  const {
    data,
    error,
  } =
    await supabase
      .from('project_experts')
      .insert({
        project_id:
          projectId,

        expert_id:
          expertId,

        status:
          'assigned',

        notes:
          notes || null,
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

export async function removeExpertFromProject(
  projectId: string,
  expertId: string
) {
  const {
    error,
  } =
    await supabase
      .from('project_experts')
      .delete()
      .eq(
        'project_id',
        projectId
      )
      .eq(
        'expert_id',
        expertId
      );

  if (error) {
    throw new Error(
      `Failed to remove expert: ${error.message}`
    );
  }
}

export async function updateProjectExpertStatus(
  assignmentId: string,
  status: ProjectExpertStatus
): Promise<ProjectExpert> {
  const {
    data,
    error,
  } =
    await supabase
      .from('project_experts')
      .update({
        status,
      })
      .eq(
        'id',
        assignmentId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update assignment: ${error.message}`
    );
  }

  return data as ProjectExpert;
}

export async function updateProjectExpertNotes(
  assignmentId: string,
  notes: string | null
): Promise<ProjectExpert> {
  const {
    data,
    error,
  } =
    await supabase
      .from('project_experts')
      .update({
        notes,
      })
      .eq(
        'id',
        assignmentId
      )
      .select()
      .single();

  if (error) {
    throw new Error(
      `Failed to update assignment notes: ${error.message}`
    );
  }

  return data as ProjectExpert;
}

// ─────────────────────────────────────────────────────────────
// EXPERT PROJECTS
// ─────────────────────────────────────────────────────────────

export async function getExpertProjects(
  expertId: string
): Promise<Project[]> {
  const {
    data: assignments,
    error: assignmentError,
  } =
    await supabase
      .from('project_experts')
      .select('project_id')
      .eq(
        'expert_id',
        expertId
      );

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

  const projectIds =
    assignments.map(
      (assignment) =>
        assignment.project_id
    );

  const {
    data,
    error,
  } =
    await supabase
      .from('projects')
      .select('*')
      .in(
        'id',
        projectIds
      );

  if (error) {
    throw new Error(
      `Failed to load expert projects: ${error.message}`
    );
  }

  return (data || []) as Project[];
}

export async function getExpertAssignments(
  expertId: string
): Promise<ProjectExpert[]> {
  const {
    data,
    error,
  } =
    await supabase
      .from('project_experts')
      .select('*')
      .eq(
        'expert_id',
        expertId
      )
      .order(
        'assigned_at',
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      `Failed to load expert assignments: ${error.message}`
    );
  }

  return (data || []) as ProjectExpert[];
}

// ─────────────────────────────────────────────────────────────
// RESUME URL
// ─────────────────────────────────────────────────────────────

export async function getResumeUrl(
  resumePath: string
): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(
        resumePath,
        60 * 10
      );

  if (
    error ||
    !data?.signedUrl
  ) {
    throw new Error(
      `Failed to generate resume URL: ${
        error?.message ||
        'Unknown error'
      }`
    );
  }

  return data.signedUrl;
}

// ─────────────────────────────────────────────────────────────
// IUVAI V1 — EVALUATIONS
// ─────────────────────────────────────────────────────────────

export type EvaluationStatus =
  | 'draft'
  | 'open'
  | 'closed';

export type EvaluationSubmissionStatus =
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface Evaluation {
  id: string;
  title: string;
  description: string | null;

  primary_field: string | null;
  specialization: string | null;

  instructions: string | null;

  status: EvaluationStatus;

  time_limit_minutes: number | null;

  created_at: string;
  updated_at: string;
}

export interface EvaluationQuestion {
  id: string;
  evaluation_id: string;

  question_order: number;

  prompt: string;
  context: string | null;

  response_type: 'text' | 'long_text';

  created_at: string;
}

export interface EvaluationSubmission {
  id: string;

  evaluation_id: string;
  expert_id: string;

  status: EvaluationSubmissionStatus;

  started_at: string;
  submitted_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface EvaluationAnswer {
  id: string;

  submission_id: string;
  question_id: string;

  answer_text: string | null;

  created_at: string;
  updated_at: string;
}


// ─────────────────────────────────────────────────────────────
// GET OPEN EVALUATIONS
// ─────────────────────────────────────────────────────────────

export async function getOpenEvaluations(): Promise<Evaluation[]> {
  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .select('*')
    .eq('status', 'open')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Failed to load evaluations: ${error.message}`
    );
  }

  return (data || []) as Evaluation[];
}


// ─────────────────────────────────────────────────────────────
// GET EVALUATION
// ─────────────────────────────────────────────────────────────

export async function getEvaluation(
  evaluationId: string
): Promise<Evaluation | null> {
  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', evaluationId)
    .single();

  if (error) {
    console.error(
      'GET EVALUATION ERROR:',
      error
    );

    return null;
  }

  return data as Evaluation;
}


// ─────────────────────────────────────────────────────────────
// GET EVALUATION QUESTIONS
// ─────────────────────────────────────────────────────────────

export async function getEvaluationQuestions(
  evaluationId: string
): Promise<EvaluationQuestion[]> {
  const {
    data,
    error,
  } = await supabase
    .from('evaluation_questions')
    .select('*')
    .eq(
      'evaluation_id',
      evaluationId
    )
    .order('question_order', {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load evaluation questions: ${error.message}`
    );
  }

  return (data || []) as EvaluationQuestion[];
}


// ─────────────────────────────────────────────────────────────
// GET EXISTING SUBMISSION
// ─────────────────────────────────────────────────────────────

export async function getEvaluationSubmission(
  evaluationId: string,
  expertId: string
): Promise<EvaluationSubmission | null> {
  const {
    data,
    error,
  } = await supabase
    .from('evaluation_submissions')
    .select('*')
    .eq(
      'evaluation_id',
      evaluationId
    )
    .eq(
      'expert_id',
      expertId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load evaluation submission: ${error.message}`
    );
  }

  return data as EvaluationSubmission | null;
}


// ─────────────────────────────────────────────────────────────
// START EVALUATION
// ─────────────────────────────────────────────────────────────

export async function startEvaluation(
  evaluationId: string,
  expertId: string
): Promise<EvaluationSubmission> {

  const existing =
    await getEvaluationSubmission(
      evaluationId,
      expertId
    );

  if (existing) {
    return existing;
  }

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_submissions')
    .insert({
      evaluation_id:
        evaluationId,

      expert_id:
        expertId,

      status:
        'in_progress',
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to start evaluation: ${error.message}`
    );
  }

  return data as EvaluationSubmission;
}


// ─────────────────────────────────────────────────────────────
// GET ANSWERS
// ─────────────────────────────────────────────────────────────

export async function getEvaluationAnswers(
  submissionId: string
): Promise<EvaluationAnswer[]> {
  const {
    data,
    error,
  } = await supabase
    .from('evaluation_answers')
    .select('*')
    .eq(
      'submission_id',
      submissionId
    );

  if (error) {
    throw new Error(
      `Failed to load evaluation answers: ${error.message}`
    );
  }

  return (data || []) as EvaluationAnswer[];
}


// ─────────────────────────────────────────────────────────────
// SAVE ANSWER
// ─────────────────────────────────────────────────────────────

export async function saveEvaluationAnswer(
  submissionId: string,
  questionId: string,
  answerText: string
): Promise<EvaluationAnswer> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_answers')
    .upsert(
      {
        submission_id:
          submissionId,

        question_id:
          questionId,

        answer_text:
          answerText,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          'submission_id,question_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save answer: ${error.message}`
    );
  }

  return data as EvaluationAnswer;
}


// ─────────────────────────────────────────────────────────────
// SUBMIT EVALUATION
// ─────────────────────────────────────────────────────────────

export async function submitEvaluation(
  submissionId: string
): Promise<EvaluationSubmission> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_submissions')
    .update({
      status:
        'submitted',

      submitted_at:
        new Date().toISOString(),

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      submissionId
    )
    .eq(
      'expert_id',
      (await supabase.auth.getUser()).data.user?.id
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to submit evaluation: ${error.message}`
    );
  }

  return data as EvaluationSubmission;
}

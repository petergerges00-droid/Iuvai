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

export type ServiceType =
  | 'human_intelligence'
  | 'ai_automation';

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
// AI AUTOMATION PROJECT
// ─────────────────────────────────────────────────────────────

export type AutomationProjectStatus =
  | 'draft'
  | 'discovery'
  | 'design'
  | 'development'
  | 'testing'
  | 'deployed'
  | 'completed'
  | 'cancelled';

export interface AutomationProject {
  id: string;

  company_id: string;

  title: string;
  description: string | null;

  business_goal: string | null;

  industry: string | null;

  status: AutomationProjectStatus;

  budget: string | null;
  timeline: string | null;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// AI AUTOMATION REQUESTS
//
// V1 workflow:
//
// Company
//    ↓
// submits automation request
//    ↓
// Supabase automation_requests
//    ↓
// Supabase Edge Function
//    ↓
// Resend
//    ↓
// Peter.gerges00@gmail.com
//
// Companies do NOT create automation projects directly.
// ─────────────────────────────────────────────────────────────

export type AutomationRequestStatus =
  | 'pending'
  | 'reviewed'
  | 'contacted'
  | 'converted'
  | 'rejected'
  | 'cancelled';

export interface AutomationRequest {
  id: string;

  company_id: string;

  title: string;
  description: string | null;

  business_goal: string | null;

  industry: string | null;

  budget: string | null;
  timeline: string | null;

  status: AutomationRequestStatus;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// CREATE AUTOMATION REQUEST
// ─────────────────────────────────────────────────────────────

export async function createAutomationRequest(
  request: Omit<
    AutomationRequest,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<AutomationRequest> {

  // Verify that the user is authenticated.
  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to submit an automation request.'
    );
  }

  // Make sure the request is being submitted for
  // the currently authenticated company.
  if (request.company_id !== user.id) {
    throw new Error(
      'You are not authorized to submit this automation request.'
    );
  }

  // ───────────────────────────────────────────────────────────
  // CREATE REQUEST IN SUPABASE
  // ───────────────────────────────────────────────────────────

  const {
    data,
    error,
  } = await supabase
    .from('automation_requests')
    .insert({
      ...request,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to submit automation request: ${error.message}`
    );
  }

  const automationRequest =
    data as AutomationRequest;

  // ───────────────────────────────────────────────────────────
  // SEND EMAIL NOTIFICATION
  //
  // IMPORTANT:
  // The Resend API key MUST NOT be stored in this frontend file.
  //
  // The Supabase Edge Function:
  //
  // notify-automation-request
  //
  // owns the Resend API key and is responsible for
  // sending the email.
  // ───────────────────────────────────────────────────────────

  try {

    console.log(
      'AUTOMATION REQUEST CREATED:',
      automationRequest
    );

    console.log(
      'CALLING EMAIL NOTIFICATION FUNCTION:',
      automationRequest.id
    );

    const {
      data: functionData,
      error: functionError,
    } = await supabase.functions.invoke(
      'notify-automation-request',
      {
        body: {
          requestId:
            automationRequest.id,

          // Pass the complete request as well.
          // This allows the Edge Function to send the email
          // without needing another database query if desired.
          request:
            automationRequest,
        },
      }
    );

    // Supabase Edge Function invocation failed.
    if (functionError) {

      console.error(
        'NOTIFY AUTOMATION REQUEST FUNCTION ERROR:',
        functionError
      );

      throw new Error(
        `Automation request was created, but the email notification failed: ${
          functionError.message ||
          'Unknown Edge Function error'
        }`
      );
    }

    // Log the actual Edge Function response.
    console.log(
      'AUTOMATION EMAIL FUNCTION RESPONSE:',
      functionData
    );

    // If your Edge Function returns something like:
    //
    // { success: false, error: "..." }
    //
    // catch that too.
    if (
      functionData &&
      typeof functionData === 'object' &&
      'success' in functionData &&
      functionData.success === false
    ) {

      const functionResponse =
        functionData as {
          success?: boolean;
          error?: string;
        };

      console.error(
        'AUTOMATION EMAIL FUNCTION REPORTED FAILURE:',
        functionResponse
      );

      throw new Error(
        `Automation request was created, but the email notification failed: ${
          functionResponse.error ||
          'The notification function reported a failure.'
        }`
      );
    }

    console.log(
      'AUTOMATION REQUEST EMAIL NOTIFICATION SENT SUCCESSFULLY:',
      automationRequest.id
    );

  } catch (notificationError) {

    console.error(
      'AUTOMATION REQUEST NOTIFICATION ERROR:',
      notificationError
    );

    // IMPORTANT:
    // The database request already exists.
    //
    // We deliberately throw here so the frontend does NOT
    // pretend that the complete submission succeeded.
    //
    // This also makes the actual email/Edge Function problem
    // visible in the browser console and UI error handling.

    if (
      notificationError instanceof Error
    ) {
      throw notificationError;
    }

    throw new Error(
      'Automation request was created, but the email notification failed.'
    );
  }

  return automationRequest;
}

// ─────────────────────────────────────────────────────────────
// GET COMPANY AUTOMATION REQUESTS
// ─────────────────────────────────────────────────────────────

export async function getCompanyAutomationRequests(
  companyId: string
): Promise<AutomationRequest[]> {

  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to view automation requests.'
    );
  }

  if (user.id !== companyId) {
    throw new Error(
      'You are not authorized to view these automation requests.'
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from('automation_requests')
    .select('*')
    .eq(
      'company_id',
      companyId
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load automation requests: ${error.message}`
    );
  }

  return (
    data || []
  ) as AutomationRequest[];
}

// ─────────────────────────────────────────────────────────────
// GET SINGLE AUTOMATION REQUEST
// ─────────────────────────────────────────────────────────────

export async function getAutomationRequest(
  requestId: string
): Promise<AutomationRequest | null> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_requests')
    .select('*')
    .eq(
      'id',
      requestId
    )
    .single();

  if (error) {
    console.error(
      'GET AUTOMATION REQUEST ERROR:',
      error
    );

    return null;
  }

  return data as AutomationRequest;
}

// ─────────────────────────────────────────────────────────────
// UPDATE AUTOMATION REQUEST
//
// Primarily intended for admin workflows.
// ─────────────────────────────────────────────────────────────

export async function updateAutomationRequest(
  requestId: string,
  updates: Partial<
    Pick<
      AutomationRequest,
      | 'title'
      | 'description'
      | 'business_goal'
      | 'industry'
      | 'budget'
      | 'timeline'
      | 'status'
    >
  >
): Promise<AutomationRequest> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_requests')
    .update({
      ...updates,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      requestId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update automation request: ${error.message}`
    );
  }

  return data as AutomationRequest;
}

// ─────────────────────────────────────────────────────────────
// UPDATE AUTOMATION REQUEST STATUS
// ─────────────────────────────────────────────────────────────

export async function updateAutomationRequestStatus(
  requestId: string,
  status: AutomationRequestStatus
): Promise<AutomationRequest> {

  return updateAutomationRequest(
    requestId,
    {
      status,
    }
  );
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
// The database currently uses:
//
//   Resume_path
//   Resume_file_name
//
// with capital letters.
//
// The application interface intentionally uses:
//
//   resume_path
//   resume_file_name
//
// These helpers keep the rest of the application consistent
// without requiring a database migration.
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
    resume_path:
      Resume_path ?? null,
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
          Resume_path:
            resume_path,
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
  'https://iuvai.pages.dev';

const PASSWORD_RESET_URL =
  `${PRODUCTION_URL}/reset-password`;

export async function resetPassword(
  email: string
) {

  return supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo:
        PASSWORD_RESET_URL,
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
    .upsert(
      profile,
      {
        onConflict: 'id',
      }
    );

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
    toDatabaseExpertProfile(
      profile
    );

  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .upsert(
      databaseProfile,
      {
        onConflict: 'id',
      }
    )
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
      verification_status:
        status,
    })
    .eq(
      'id',
      expertId
    )
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
    .upsert(
      profile,
      {
        onConflict: 'id',
      }
    );

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
      (expert) =>
        expert.id
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
      .in(
        'id',
        expertIds
      );

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

// ─────────────────────────────────────────────────────────────
// AI AUTOMATION PROJECTS
// ─────────────────────────────────────────────────────────────

export async function createAutomationProject(
  project: Omit<
    AutomationProject,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<AutomationProject> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create automation project: ${error.message}`
    );
  }

  return data as AutomationProject;
}

export async function getCompanyAutomationProjects(
  companyId: string
): Promise<AutomationProject[]> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_projects')
    .select('*')
    .eq(
      'company_id',
      companyId
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load automation projects: ${error.message}`
    );
  }

  return (
    data || []
  ) as AutomationProject[];
}

export async function getAutomationProject(
  projectId: string
): Promise<AutomationProject | null> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_projects')
    .select('*')
    .eq(
      'id',
      projectId
    )
    .single();

  if (error) {
    console.error(
      'GET AUTOMATION PROJECT ERROR:',
      error
    );

    return null;
  }

  return data as AutomationProject;
}

export async function updateAutomationProject(
  projectId: string,
  updates: Partial<AutomationProject>
): Promise<AutomationProject> {

  const {
    data,
    error,
  } = await supabase
    .from('automation_projects')
    .update({
      ...updates,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      projectId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update automation project: ${error.message}`
    );
  }

  return data as AutomationProject;
}

export async function updateAutomationProjectStatus(
  projectId: string,
  status: AutomationProjectStatus
): Promise<AutomationProject> {

  return updateAutomationProject(
    projectId,
    {
      status,
    }
  );
}

// ─────────────────────────────────────────────────────────────
// GET EXPERTS
// ─────────────────────────────────────────────────────────────

export async function getExperts(): Promise<
  ExpertWithProfile[]
> {

  const {
    data,
    error,
  } = await supabase
    .from('expert_profiles')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

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
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

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
    .eq(
      'id',
      expertId
    )
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
      .eq(
        'id',
        expertId
      )
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
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load company projects: ${error.message}`
    );
  }

  return (
    data || []
  ) as Project[];
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
    .eq(
      'id',
      projectId
    )
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
    .eq(
      'id',
      projectId
    )
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
    .eq(
      'id',
      projectId
    );

  if (error) {
    throw new Error(
      `Failed to delete project: ${error.message}`
    );
  }
}
// ─────────────────────────────────────────────────────────────
// ADMIN — DELETE EXPERT
// ─────────────────────────────────────────────────────────────

export async function deleteExpert(
  expertId: string
): Promise<void> {

  if (!expertId) {
    throw new Error(
      'Expert ID is required.'
    );
  }

  // Verify that the current user is authenticated.
  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to delete an expert.'
    );
  }

  // The actual admin authorization check happens
  // inside the Edge Function.
  //
  // IMPORTANT:
  // Never put the Supabase service-role key in this file.

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'delete-expert',
    {
      body: {
        expertId,
      },
    }
  );

  if (error) {
    console.error(
      'DELETE EXPERT FUNCTION ERROR:',
      error
    );

    throw new Error(
      `Failed to delete expert: ${
        error.message ||
        'Unknown Edge Function error'
      }`
    );
  }

  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    data.success === false
  ) {
    throw new Error(
      data.error ||
      'Failed to delete expert.'
    );
  }

  console.log(
    'EXPERT DELETED SUCCESSFULLY:',
    expertId
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN — DELETE EVALUATION
// ─────────────────────────────────────────────────────────────

export async function deleteEvaluation(
  evaluationId: string
): Promise<void> {

  if (!evaluationId) {
    throw new Error(
      'Evaluation ID is required.'
    );
  }

  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to delete an evaluation.'
    );
  }

  const {
    error,
  } = await supabase
    .from('evaluations')
    .delete()
    .eq(
      'id',
      evaluationId
    );

  if (error) {
    console.error(
      'DELETE EVALUATION ERROR:',
      error
    );

    throw new Error(
      `Failed to delete evaluation: ${error.message} | Code: ${error.code} | Details: ${error.details} | Hint: ${error.hint}`
    );
  }

  console.log(
    'EVALUATION DELETED SUCCESSFULLY:',
    evaluationId
  );
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
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load projects: ${error.message}`
    );
  }

  return (
    data || []
  ) as Project[];
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
    .eq(
      'id',
      projectId
    )
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
    .eq(
      'id',
      projectId
    )
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
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load project requests: ${error.message}`
    );
  }

  return (
    data || []
  ) as ProjectRequest[];
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
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load expert requests: ${error.message}`
    );
  }

  return (
    data || []
  ) as ProjectRequest[];
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
    .eq(
      'id',
      requestId
    )
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
    .eq(
      'id',
      requestId
    )
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

const RESUME_BUCKET =
  'Resumes';

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
      .from(
        RESUME_BUCKET
      )
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
        .from(
          RESUME_BUCKET
        )
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
      .from(
        RESUME_BUCKET
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
      `Resume upload failed: ${uploadError.message}`
    );
  }

  await upsertExpertProfile({
    id: userId,

    resume_path:
      filePath,

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
      .from(
        RESUME_BUCKET
      )
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
        .from(
          RESUME_BUCKET
        )
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

    resume_path:
      null,

    resume_file_name:
      null,
  });
}

// ─────────────────────────────────────────────────────────────
// MEDICAL CERTIFICATE STORAGE
//
// Existing bucket:
//
//   medical-certificates
//
// Database columns:
//
//   medical_certificate_path
//   medical_certificate_file_name
//   medical_certificate_status
//
// Storage path:
//
//   <user_id>/medical-certificate.<extension>
//
// The bucket is private.
//
// Existing RLS policies allow an authenticated expert to:
//
//   - upload their own certificate
//   - view their own certificate
//   - update their own certificate
//   - delete their own certificate
//
// Admins can manage certificates through the existing
// is_admin() policy.
// ─────────────────────────────────────────────────────────────

const MEDICAL_CERTIFICATE_BUCKET =
  'medical-certificates';

const MAX_CERTIFICATE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_CERTIFICATE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const ALLOWED_CERTIFICATE_EXTENSIONS = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'webp',
];

// ─────────────────────────────────────────────────────────────
// UPLOAD MEDICAL CERTIFICATE
// ─────────────────────────────────────────────────────────────

export async function uploadMedicalCertificate(
  userId: string,
  file: File
): Promise<string> {

  if (!userId) {
    throw new Error(
      'Cannot upload certificate: user ID is missing.'
    );
  }

  if (!file) {
    throw new Error(
      'Please select a certificate file.'
    );
  }

  // Verify authentication.
  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to upload a certificate.'
    );
  }

  // Prevent one authenticated user from uploading
  // into another user's folder.
  if (user.id !== userId) {
    throw new Error(
      'You are not authorized to upload this certificate.'
    );
  }

  // File size validation.
  if (file.size > MAX_CERTIFICATE_SIZE) {
    throw new Error(
      'Certificate file is too large. Maximum size is 10 MB.'
    );
  }

  // Validate MIME type when provided by the browser.
  if (
    file.type &&
    !ALLOWED_CERTIFICATE_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      'Invalid certificate file type. Please upload a PDF, JPG, PNG, or WebP file.'
    );
  }

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'pdf';

  if (
    !ALLOWED_CERTIFICATE_EXTENSIONS.includes(
      extension
    )
  ) {
    throw new Error(
      'Invalid certificate file extension.'
    );
  }

  const filePath =
    `${userId}/medical-certificate.${extension}`;

  // ───────────────────────────────────────────────────────────
  // Find and remove previous certificates.
  // Only one certificate is maintained for V1.
  // ───────────────────────────────────────────────────────────

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
      existingFiles
        .filter(
          (existingFile) =>
            existingFile.name !==
            '.emptyFolderPlaceholder'
        )
        .map(
          (existingFile) =>
            `${userId}/${existingFile.name}`
        );

    if (
      filesToRemove.length > 0
    ) {

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
  }

  // ───────────────────────────────────────────────────────────
  // Upload certificate
  // ───────────────────────────────────────────────────────────

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

          cacheControl:
            '3600',
        }
      );

  if (uploadError) {
    throw new Error(
      `Medical certificate upload failed: ${uploadError.message}`
    );
  }

  // ───────────────────────────────────────────────────────────
  // Save certificate metadata
  //
  // Any new upload returns the certificate to "pending"
  // because it must be reviewed again.
  // ───────────────────────────────────────────────────────────

  try {

    await upsertExpertProfile({
      id: userId,

      medical_certificate_path:
        filePath,

      medical_certificate_file_name:
        file.name,

      medical_certificate_status:
        'pending',
    });

  } catch (databaseError) {

    // Avoid leaving an orphaned storage object
    // if the database update fails.
    try {

      await supabase.storage
        .from(
          MEDICAL_CERTIFICATE_BUCKET
        )
        .remove([
          filePath,
        ]);

    } catch (cleanupError) {

      console.warn(
        'Could not clean up uploaded certificate after database failure:',
        cleanupError
      );
    }

    throw databaseError;
  }

  return filePath;
}

// ─────────────────────────────────────────────────────────────
// GENERIC ONBOARDING CERTIFICATE FUNCTION
//
// The onboarding UI should use:
//
//   uploadCertificate(userId, file)
//
// The underlying V1 database remains unchanged.
// ─────────────────────────────────────────────────────────────

export async function uploadCertificate(
  userId: string,
  file: File
): Promise<string> {

  return uploadMedicalCertificate(
    userId,
    file
  );
}

// ─────────────────────────────────────────────────────────────
// DELETE MEDICAL CERTIFICATE
// ─────────────────────────────────────────────────────────────

export async function deleteMedicalCertificate(
  userId: string
): Promise<void> {

  if (!userId) {
    throw new Error(
      'Cannot delete certificate: user ID is missing.'
    );
  }

  // Verify authentication.
  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      'You must be signed in to delete a certificate.'
    );
  }

  // Prevent deleting another user's certificate.
  if (user.id !== userId) {
    throw new Error(
      'You are not authorized to delete this certificate.'
    );
  }

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

    const filesToRemove =
      files
        .filter(
          (file) =>
            file.name !==
            '.emptyFolderPlaceholder'
        )
        .map(
          (file) =>
            `${userId}/${file.name}`
        );

    if (
      filesToRemove.length > 0
    ) {

      const {
        error,
      } =
        await supabase.storage
          .from(
            MEDICAL_CERTIFICATE_BUCKET
          )
          .remove(
            filesToRemove
          );

      if (error) {
        throw new Error(
          `Failed to delete medical certificate: ${error.message}`
        );
      }
    }
  }

  // Clear certificate metadata.
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

// ─────────────────────────────────────────────────────────────
// GENERIC ONBOARDING DELETE FUNCTION
// ─────────────────────────────────────────────────────────────

export async function deleteCertificate(
  userId: string
): Promise<void> {

  return deleteMedicalCertificate(
    userId
  );
}

// ─────────────────────────────────────────────────────────────
// UPDATE MEDICAL CERTIFICATE STATUS
//
// Intended for admin/reviewer workflows.
// ─────────────────────────────────────────────────────────────

export async function updateMedicalCertificateStatus(
  expertId: string,
  status: VerificationStatus
): Promise<ExpertProfile> {

  const {
    data,
    error,
  } =
    await supabase
      .from('expert_profiles')
      .update({
        medical_certificate_status:
          status,
      })
      .eq(
        'id',
        expertId
      )
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

// ─────────────────────────────────────────────────────────────
// GET SIGNED MEDICAL CERTIFICATE URL
//
// The bucket is PRIVATE.
//
// This creates a temporary signed URL rather than exposing
// the certificate publicly.
// ─────────────────────────────────────────────────────────────

export async function getMedicalCertificateUrl(
  certificatePath: string
): Promise<string> {

  if (!certificatePath) {
    throw new Error(
      'Certificate path is missing.'
    );
  }

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
// GENERIC ONBOARDING CERTIFICATE URL FUNCTION
// ─────────────────────────────────────────────────────────────

export async function getCertificateUrl(
  certificatePath: string
): Promise<string> {

  return getMedicalCertificateUrl(
    certificatePath
  );
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

  return (
    data || []
  ) as ProjectExpert[];
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

  return (
    data || []
  ) as Project[];
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

  return (
    data || []
  ) as ProjectExpert[];
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
      .from(
        RESUME_BUCKET
      )
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

  response_type:
    | 'text'
    | 'long_text';

  created_at: string;
}

export interface EvaluationSubmission {
  id: string;

  evaluation_id: string;
  expert_id: string;

  status:
    EvaluationSubmissionStatus;

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

export async function getOpenEvaluations(): Promise<
  Evaluation[]
> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .select('*')
    .eq(
      'status',
      'open'
    )
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load evaluations: ${error.message}`
    );
  }

  return (
    data || []
  ) as Evaluation[];
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
    .eq(
      'id',
      evaluationId
    )
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
    .order(
      'question_order',
      {
        ascending: true,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load evaluation questions: ${error.message}`
    );
  }

  return (
    data || []
  ) as EvaluationQuestion[];
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

  return (
    data || []
  ) as EvaluationAnswer[];
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
    data: {
      user,
    },
  } = await supabase.auth.getUser();

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
      user?.id
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

// ─────────────────────────────────────────────────────────────
// GET ALL EVALUATIONS
// ─────────────────────────────────────────────────────────────

export async function getAllEvaluations(): Promise<
  Evaluation[]
> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load evaluations: ${error.message}`
    );
  }

  return (
    data || []
  ) as Evaluation[];
}

// ─────────────────────────────────────────────────────────────
// IUVAI V1 — EVALUATION REVIEWS
// ─────────────────────────────────────────────────────────────

export type EvaluationReviewStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected';

export interface EvaluationReview {
  id: string;

  submission_id: string;
  reviewer_id: string;

  status:
    EvaluationReviewStatus;

  overall_score: number | null;

  reviewer_notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface EvaluationQuestionReview {
  id: string;

  review_id: string;
  question_id: string;

  score: number | null;

  feedback: string | null;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────
// CREATE OR GET REVIEW
// ─────────────────────────────────────────────────────────────

export async function getEvaluationReview(
  submissionId: string
): Promise<EvaluationReview | null> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_reviews')
    .select('*')
    .eq(
      'submission_id',
      submissionId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load evaluation review: ${error.message}`
    );
  }

  return data as EvaluationReview | null;
}

export async function createEvaluationReview(
  submissionId: string,
  reviewerId: string
): Promise<EvaluationReview> {

  const existing =
    await getEvaluationReview(
      submissionId
    );

  if (existing) {
    return existing;
  }

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_reviews')
    .insert({
      submission_id:
        submissionId,

      reviewer_id:
        reviewerId,

      status:
        'in_review',
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create evaluation review: ${error.message}`
    );
  }

  return data as EvaluationReview;
}

// ─────────────────────────────────────────────────────────────
// GET QUESTION REVIEWS
// ─────────────────────────────────────────────────────────────

export async function getEvaluationQuestionReviews(
  reviewId: string
): Promise<EvaluationQuestionReview[]> {

  const {
    data,
    error,
  } = await supabase
    .from(
      'evaluation_question_reviews'
    )
    .select('*')
    .eq(
      'review_id',
      reviewId
    );

  if (error) {
    throw new Error(
      `Failed to load question reviews: ${error.message}`
    );
  }

  return (
    data || []
  ) as EvaluationQuestionReview[];
}

// ─────────────────────────────────────────────────────────────
// SAVE QUESTION REVIEW
// ─────────────────────────────────────────────────────────────

export async function saveEvaluationQuestionReview(
  reviewId: string,
  questionId: string,
  score: number | null,
  feedback: string | null
): Promise<EvaluationQuestionReview> {

  const {
    data,
    error,
  } = await supabase
    .from(
      'evaluation_question_reviews'
    )
    .upsert(
      {
        review_id:
          reviewId,

        question_id:
          questionId,

        score,

        feedback,

        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict:
          'review_id,question_id',
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to save question review: ${error.message}`
    );
  }

  return data as EvaluationQuestionReview;
}

// ─────────────────────────────────────────────────────────────
// UPDATE OVERALL REVIEW
// ─────────────────────────────────────────────────────────────

export async function updateEvaluationReview(
  reviewId: string,
  updates: Partial<
    Pick<
      EvaluationReview,
      | 'status'
      | 'overall_score'
      | 'reviewer_notes'
    >
  >
): Promise<EvaluationReview> {

  const {
    data,
    error,
  } = await supabase
    .from(
      'evaluation_reviews'
    )
    .update({
      ...updates,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      reviewId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update evaluation review: ${error.message}`
    );
  }

  return data as EvaluationReview;
}

// ─────────────────────────────────────────────────────────────
// GET SUBMITTED EVALUATIONS FOR ADMIN
// ─────────────────────────────────────────────────────────────

export async function getSubmittedEvaluations() {

  const {
    data,
    error,
  } = await supabase
    .from(
      'evaluation_submissions'
    )
    .select(`
      *,
      evaluations (
        id,
        title,
        primary_field,
        specialization
      )
    `)
    .eq(
      'status',
      'submitted'
    )
    .order(
      'submitted_at',
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Failed to load submitted evaluations: ${error.message}`
    );
  }

  return data || [];
}

// ─────────────────────────────────────────────────────────────
// ADMIN — EVALUATION MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function updateEvaluation(
  evaluationId: string,
  updates: Partial<Evaluation>
): Promise<Evaluation> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .update({
      ...updates,
      updated_at:
        new Date().toISOString(),
    })
    .eq(
      'id',
      evaluationId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update evaluation: ${error.message}`
    );
  }

  return data as Evaluation;
}

export async function createEvaluation(
  evaluation: Omit<
    Evaluation,
    'id' |
    'created_at' |
    'updated_at'
  >
): Promise<Evaluation> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluations')
    .insert(evaluation)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create evaluation: ${error.message}`
    );
  }

  return data as Evaluation;
}

export async function createEvaluationQuestion(
  question: Omit<
    EvaluationQuestion,
    'id' |
    'created_at'
  >
): Promise<EvaluationQuestion> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_questions')
    .insert(question)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create question: ${error.message}`
    );
  }

  return data as EvaluationQuestion;
}

export async function updateEvaluationQuestion(
  questionId: string,
  updates: Partial<EvaluationQuestion>
): Promise<EvaluationQuestion> {

  const {
    data,
    error,
  } = await supabase
    .from('evaluation_questions')
    .update(updates)
    .eq(
      'id',
      questionId
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update question: ${error.message}`
    );
  }

  return data as EvaluationQuestion;
}

export async function deleteEvaluationQuestion(
  questionId: string
): Promise<void> {

  const {
    error,
  } = await supabase
    .from('evaluation_questions')
    .delete()
    .eq(
      'id',
      questionId
    );

  if (error) {
    throw new Error(
      `Failed to delete question: ${error.message}`
    );
  }
}

export async function setEvaluationStatus(
  evaluationId: string,
  status: EvaluationStatus
): Promise<Evaluation> {

  return updateEvaluation(
    evaluationId,
    {
      status,
    }
  );
}

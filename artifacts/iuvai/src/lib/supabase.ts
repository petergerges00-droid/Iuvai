import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types mirroring existing Supabase tables ──────────────────────────────

export type AccountType = 'expert' | 'company';

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

// ─── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
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
  return supabase.auth.updateUser({ password });
}

// ─── Profile helpers ───────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }) {
  const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
  if (error) throw new Error(`Failed to save profile: ${error.message}`);
}

export async function getExpertProfile(userId: string): Promise<ExpertProfile | null> {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as ExpertProfile;
}

export async function upsertExpertProfile(
  profile: Partial<ExpertProfile> & { id: string }
) {
  const { data, error } = await supabase
    .from('expert_profiles')
    .upsert(profile, { onConflict: 'id' })
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

export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as CompanyProfile;
}

export async function upsertCompanyProfile(profile: Partial<CompanyProfile> & { id: string }) {
  const { error } = await supabase.from('company_profiles').upsert(profile, { onConflict: 'id' });
  if (error) throw new Error(`Failed to save company profile: ${error.message}`);
}

export async function uploadResume(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const filePath = `${userId}/resume.${extension}`;

  // Remove existing resume first
  const { data: existingFiles } = await supabase.storage
    .from('resumes')
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToRemove = existingFiles.map((file) => `${userId}/${file.name}`);
    await supabase.storage.from('resumes').remove(filesToRemove);
  }

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Resume upload failed: ${uploadError.message}`);
  }

  await upsertExpertProfile({
    id: userId,
    resume_path: filePath,
    resume_file_name: file.name,
  });

  return filePath;
}

export async function deleteResume(userId: string) {
  const { data: files } = await supabase.storage
    .from('resumes')
    .list(userId);

  if (files && files.length > 0) {
    await supabase.storage
      .from('resumes')
      .remove(files.map((file) => `${userId}/${file.name}`));
  }

  await upsertExpertProfile({
    id: userId,
    resume_path: null,
    resume_file_name: null,
  });
}

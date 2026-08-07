/**
 * Get all expert profiles with their public profile information.
 *
 * IMPORTANT:
 * This query relies on a foreign-key relationship:
 *
 * expert_profiles.id -> profiles.id
 *
 * Both tables use the user's Supabase Auth UUID as their ID.
 */
export async function getExperts(): Promise<ExpertWithProfile[]> {
  const { data, error } = await supabase
    .from('expert_profiles')
    .select(`
      *,
      profile:profiles!expert_profiles_id_fkey (
        id,
        full_name,
        account_type,
        country,
        created_at
      )
    `)
    .order('created_at', {
      ascending: false,
    });
  console.log('GET EXPERTS RAW:', {
    data,
    error,
  });
  if (error) {
    console.error('GET EXPERTS ERROR:', error);
    throw new Error(
      `Failed to load experts: ${error.message}`
    );
  }
  return (data || []).map((expert) => ({
    ...expert,
    profile: expert.profile || null,
  })) as ExpertWithProfile[];
}

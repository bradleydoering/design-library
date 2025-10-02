import { createClient } from '@supabase/supabase-js';

// Service role client for admin operations (bypasses RLS)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface ContractorProfileData {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  role?: 'contractor' | 'admin' | 'manager';
  status?: 'active' | 'inactive' | 'pending';
}

/**
 * Creates a contractor profile using service role (bypasses RLS)
 * This is used during signup to ensure profile creation always succeeds
 */
export async function createContractorProfile(profileData: ContractorProfileData) {
  try {
    console.log('Creating contractor profile with service role:', profileData.email);

    const { data, error } = await supabaseServiceRole
      .from('contractor_profiles')
      .insert({
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name,
        company_name: profileData.company_name || null,
        role: profileData.role || 'contractor',
        status: profileData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Service role profile creation error:', error);
      throw new Error(`Failed to create contractor profile: ${error.message}`);
    }

    console.log('Contractor profile created successfully:', data.email);
    return { data, error: null };
  } catch (err) {
    console.error('Contractor profile creation failed:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error creating profile')
    };
  }
}

/**
 * Updates contractor profile status (e.g., pending -> active after email verification)
 */
export async function updateContractorProfileStatus(userId: string, status: 'active' | 'inactive' | 'pending') {
  try {
    const { data, error } = await supabaseServiceRole
      .from('contractor_profiles')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile status update error:', error);
      throw new Error(`Failed to update profile status: ${error.message}`);
    }

    console.log(`Profile status updated to ${status} for user:`, userId);
    return { data, error: null };
  } catch (err) {
    console.error('Profile status update failed:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error updating profile status')
    };
  }
}

/**
 * Get contractor profile by user ID using service role
 */
export async function getContractorProfile(userId: string) {
  try {
    const { data, error } = await supabaseServiceRole
      .from('contractor_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Get profile error:', error);
      throw new Error(`Failed to get contractor profile: ${error.message}`);
    }

    return { data, error: error?.code === 'PGRST116' ? null : error };
  } catch (err) {
    console.error('Get contractor profile failed:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error getting profile')
    };
  }
}
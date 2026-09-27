import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    `)
    .eq("id", userId)
    .single();
}
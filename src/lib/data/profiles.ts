import type { SupabaseClient } from "@supabase/supabase-js";

export async function getProfileSummary(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("profiles")
    .select("first_name, last_name, role")
    .eq("id", userId)
    .single();
}

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
}
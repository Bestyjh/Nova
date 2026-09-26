import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminResources(
  supabase: SupabaseClient
) {
  return supabase
    .from("resources")
    .select(`
      id,
      course_id,
      title,
      description,
      resource_type,
      url,
      position,
      published,
      created_by,
      created_at,
      updated_at
    `)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
}

export async function getAdminResourceById(
  supabase: SupabaseClient,
  resourceId: string
) {
  return supabase
    .from("resources")
    .select(`
      id,
      course_id,
      title,
      description,
      resource_type,
      url,
      position,
      published,
      created_by,
      created_at,
      updated_at
    `)
    .eq("id", resourceId)
    .single();
}

export async function getLearnerResources(
  supabase: SupabaseClient
) {
  /*
   * Do not duplicate enrollment authorization here.
   *
   * The resources RLS policy is authoritative:
   * - only published resources
   * - general resources are visible
   * - course resources require an active/completed enrollment
   */
  return supabase
    .from("resources")
    .select(`
      id,
      course_id,
      title,
      description,
      resource_type,
      url,
      position,
      published,
      created_at
    `)
    .eq("published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
}
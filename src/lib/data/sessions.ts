import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminSessions(
  supabase: SupabaseClient
) {
  return supabase
    .from("sessions")
    .select(`
      id,
      course_id,
      title,
      description,
      session_type,
      starts_at,
      ends_at,
      timezone,
      location,
      meeting_url,
      published,
      created_by,
      created_at,
      updated_at,
      courses (
        id,
        title,
        slug
      )
    `)
    .order("starts_at", { ascending: true });
}

export async function getAdminSessionById(
  supabase: SupabaseClient,
  sessionId: string
) {
  return supabase
    .from("sessions")
    .select(`
      id,
      course_id,
      title,
      description,
      session_type,
      starts_at,
      ends_at,
      timezone,
      location,
      meeting_url,
      published,
      created_by,
      created_at,
      updated_at
    `)
    .eq("id", sessionId)
    .single();
}

export async function getLearnerSessions(
  supabase: SupabaseClient
) {
  /*
   * Session visibility is enforced by RLS:
   * - session must be published
   * - general sessions are available
   * - course sessions require active/completed enrollment
   */
  return supabase
    .from("sessions")
    .select(`
      id,
      course_id,
      title,
      description,
      session_type,
      starts_at,
      ends_at,
      timezone,
      location,
      meeting_url,
      published,
      created_at,
      courses (
        id,
        title,
        slug
      )
    `)
    .eq("published", true)
    .or(
      `ends_at.gte.${new Date().toISOString()},and(ends_at.is.null,starts_at.gte.${new Date().toISOString()})`
    )
    .order("starts_at", { ascending: true });
}

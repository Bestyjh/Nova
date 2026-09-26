import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserEnrollmentsWithCurriculum(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("enrollments")
    .select(`
      id,
      status,
      enrolled_at,
      courses (
        id,
        title,
        slug,
        summary,
        modules (
          id,
          position,
          lessons (
            id,
            position,
            published
          )
        )
      )
    `)
    .eq("user_id", userId);
}

export async function getAllEnrollments(
  supabase: SupabaseClient
) {
  return supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      course_id,
      status,
      enrolled_at
    `)
    .order("enrolled_at", {
      ascending: false,
    });
}

export async function getEnrollmentById(
  supabase: SupabaseClient,
  enrollmentId: string
) {
  return supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      course_id,
      status,
      enrolled_at
    `)
    .eq("id", enrollmentId)
    .maybeSingle();
}

export async function getLearnerEnrollmentsWithCurriculum(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("enrollments")
    .select(`
      id,
      status,
      enrolled_at,
      course_id,
      courses (
        id,
        title,
        slug,
        modules (
          id,
          lessons (
            id,
            published
          )
        )
      )
    `)
    .eq("user_id", userId);
}

export async function getEnrollmentPairs(
  supabase: SupabaseClient
) {
  return supabase
    .from("enrollments")
    .select("user_id, course_id");
}
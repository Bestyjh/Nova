import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminCourseCurriculum(
  supabase: SupabaseClient,
  courseId: string
) {
  return supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      summary,
      published,
      modules (
        id,
        title,
        position,
        lessons (
          id,
          title,
          position,
          kind,
          published
        )
      )
    `)
    .eq("id", courseId)
    .single();
}

export async function getPublishedCourseBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  return supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      summary,
      modules (
        id,
        title,
        position,
        lessons (
          id,
          title,
          position,
          kind
        )
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();
}
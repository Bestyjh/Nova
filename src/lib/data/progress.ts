import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCompletedLessonIds(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true);
}

export async function getCompletedLessonProgressWithDates(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      completed,
      completed_at
    `)
    .eq("user_id", userId)
    .eq("completed", true);
}

export async function getCompletedLessonIdsForLessons(
  supabase: SupabaseClient,
  userId: string,
  lessonIds: string[]
) {
  if (lessonIds.length === 0) {
    return {
      data: [] as { lesson_id: string }[],
      error: null,
    };
  }

  return supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .eq("completed", true);
}
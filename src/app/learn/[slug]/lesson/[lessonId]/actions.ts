"use server";

import { createClient } from "@/lib/supabase/server";

type CompleteLessonResult = {
  success: boolean;
  courseCompleted: boolean;
  error?: string;
};

export async function completeLesson(
  lessonId: string,
  courseSlug: string
): Promise<CompleteLessonResult> {
  const supabase = await createClient();

  // Authenticate learner.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return {
      success: false,
      courseCompleted: false,
      error: "You must be logged in to complete a lesson.",
    };
  }

  // Load the course.
  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select("id, slug")
      .eq("slug", courseSlug)
      .eq("published", true)
      .single();

  if (courseError || !course) {
    return {
      success: false,
      courseCompleted: false,
      error: "Course not found.",
    };
  }

  // Verify learner has access to this course.
  const { data: enrollment, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select("id, status")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .in("status", ["active", "completed"])
      .maybeSingle();

  if (enrollmentError || !enrollment) {
    return {
      success: false,
      courseCompleted: false,
      error: "You are not enrolled in this course.",
    };
  }

  // Verify this lesson belongs to this course.
  const { data: lesson, error: lessonError } =
    await supabase
      .from("lessons")
      .select(`
        id,
        modules!inner (
          course_id
        )
      `)
      .eq("id", lessonId)
      .eq("published", true)
      .eq("modules.course_id", course.id)
      .maybeSingle();

  if (lessonError || !lesson) {
    return {
      success: false,
      courseCompleted: false,
      error: "Lesson not found in this course.",
    };
  }

  // Record lesson completion.
  const { error: progressError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      }
    );

  if (progressError) {
    return {
      success: false,
      courseCompleted: false,
      error: progressError.message,
    };
  }

  /*
   * Ask PostgreSQL whether this learner has now
   * completed every published lesson.
   *
   * The database function performs the authoritative
   * verification and updates the enrollment only when
   * the learner is genuinely eligible.
   */
  const {
    data: completionData,
    error: completionError,
  } = await supabase.rpc(
    "complete_course_if_eligible",
    {
      p_course_id: course.id,
    }
  );

  if (completionError) {
    return {
      success: false,
      courseCompleted: false,
      error: completionError.message,
    };
  }

  const completionResult =
    Array.isArray(completionData)
      ? completionData[0]
      : completionData;

  const courseCompleted =
    completionResult?.completed === true;

  return {
    success: true,
    courseCompleted,
  };
}
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPublishedAssessmentForLesson(
  supabase: SupabaseClient,
  lessonId: string
) {
  return supabase
    .from("assessments")
    .select(`
      id,
      lesson_id,
      title,
      description,
      passing_score,
      max_attempts
    `)
    .eq("lesson_id", lessonId)
    .eq("published", true)
    .maybeSingle();
}

export async function getPublishedAssessmentQuestions(
  supabase: SupabaseClient,
  assessmentId: string
) {
  return supabase
    .from("learner_assessment_questions")
    .select(`
      id,
      assessment_id,
      question_text,
      position,
      options,
      points
    `)
    .eq("assessment_id", assessmentId)
    .order("position", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    });
}

export async function getLearnerAssessmentAttempts(
  supabase: SupabaseClient,
  assessmentId: string,
  userId: string
) {
  return supabase
    .from("assessment_attempts")
    .select(`
      id,
      assessment_id,
      score,
      passed,
      completed_at
    `)
    .eq("assessment_id", assessmentId)
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", {
      ascending: false,
    });
}
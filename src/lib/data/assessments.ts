import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAdminAssessments(
  supabase: SupabaseClient
) {
  return supabase
    .from("assessments")
    .select(`
      id,
      lesson_id,
      title,
      description,
      passing_score,
      max_attempts,
      published,
      created_at,
      updated_at,
      lessons (
        id,
        title,
        module_id
      )
    `)
    .order("created_at", {
      ascending: false,
    });
}

export async function getAdminAssessmentById(
  supabase: SupabaseClient,
  assessmentId: string
) {
  return supabase
    .from("assessments")
    .select(`
      id,
      lesson_id,
      title,
      description,
      passing_score,
      max_attempts,
      published,
      created_at,
      updated_at,
      lessons (
        id,
        title,
        module_id
      )
    `)
    .eq("id", assessmentId)
    .single();
}

export async function getAssessmentQuestions(
  supabase: SupabaseClient,
  assessmentId: string
) {
  return supabase
    .from("assessment_questions")
    .select(`
      id,
      assessment_id,
      question_text,
      position,
      options,
      correct_answer,
      points,
      created_at,
      updated_at
    `)
    .eq("assessment_id", assessmentId)
    .order("position", {
      ascending: true,
    });
}

export async function getAssessmentQuestionById(
  supabase: SupabaseClient,
  questionId: string
) {
  return supabase
    .from("assessment_questions")
    .select(`
      id,
      assessment_id,
      question_text,
      position,
      options,
      correct_answer,
      points,
      created_at,
      updated_at
    `)
    .eq("id", questionId)
    .single();
}
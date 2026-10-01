"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function createAssessment(
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const lessonId = String(
    formData.get("lesson_id") ?? ""
  ).trim();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const passingScoreValue = Number(
    formData.get("passing_score") ?? 70
  );

  const maxAttemptsRaw = String(
    formData.get("max_attempts") ?? ""
  ).trim();

  if (!lessonId) {
    throw new Error(
      "A lesson is required."
    );
  }

  if (!title) {
    throw new Error(
      "Assessment title is required."
    );
  }

  if (
    !Number.isFinite(passingScoreValue) ||
    passingScoreValue < 0 ||
    passingScoreValue > 100
  ) {
    throw new Error(
      "Passing score must be between 0 and 100."
    );
  }

  const passingScore =
    Math.round(passingScoreValue);

  let maxAttempts: number | null = null;

  if (maxAttemptsRaw) {
    const parsed =
      Number(maxAttemptsRaw);

    if (
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      throw new Error(
        "Maximum attempts must be a positive whole number."
      );
    }

    maxAttempts = parsed;
  }

  const { data: lesson, error: lessonError } =
    await supabase
      .from("lessons")
      .select("id")
      .eq("id", lessonId)
      .single();

  if (lessonError || !lesson) {
    throw new Error(
      "Selected lesson does not exist."
    );
  }

  const { data: assessment, error } =
    await supabase
      .from("assessments")
      .insert({
  lesson_id: lessonId,
  title,
  description:
    description || null,
  passing_score: passingScore,
  max_attempts: maxAttempts,
  published: false,
})
      .select("id")
      .single();

  if (error || !assessment) {
    console.error(
      "Unable to create assessment:",
      error
    );

    throw new Error(
      "Unable to create assessment."
    );
  }

  revalidatePath("/admin/assessments");

  redirect(
    `/admin/assessments/${assessment.id}`
  );
}
export async function createAssessmentQuestion(
  assessmentId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const questionText = String(
    formData.get("question_text") ?? ""
  ).trim();

  const optionA = String(
    formData.get("option_a") ?? ""
  ).trim();

  const optionB = String(
    formData.get("option_b") ?? ""
  ).trim();

  const optionC = String(
    formData.get("option_c") ?? ""
  ).trim();

  const optionD = String(
    formData.get("option_d") ?? ""
  ).trim();

  const correctAnswer = String(
    formData.get("correct_answer") ?? ""
  ).trim();

  const positionValue = Number(
    formData.get("position") ?? 0
  );

  const pointsValue = Number(
    formData.get("points") ?? 1
  );

  if (!questionText) {
    throw new Error(
      "Question text is required."
    );
  }

  const options = [
    optionA,
    optionB,
    optionC,
    optionD,
  ];

  if (options.some((option) => !option)) {
    throw new Error(
      "All four answer options are required."
    );
  }

  if (
    !options.includes(correctAnswer)
  ) {
    throw new Error(
      "Correct answer must match one of the answer options."
    );
  }

  const position =
    Number.isFinite(positionValue) &&
    positionValue >= 0
      ? Math.floor(positionValue)
      : 0;

  if (
    !Number.isInteger(pointsValue) ||
    pointsValue <= 0
  ) {
    throw new Error(
      "Points must be a positive whole number."
    );
  }

  const { data: assessment, error: assessmentError } =
    await supabase
      .from("assessments")
      .select("id")
      .eq("id", assessmentId)
      .single();

  if (assessmentError || !assessment) {
    throw new Error(
      "Assessment does not exist."
    );
  }

  const { error } = await supabase
    .from("assessment_questions")
    .insert({
      assessment_id: assessmentId,
      question_text: questionText,
      position,
      options,
      correct_answer: correctAnswer,
      points: pointsValue,
    });

  if (error) {
    console.error(
      "Unable to create assessment question:",
      error
    );

    throw new Error(
      "Unable to create assessment question."
    );
  }

  revalidatePath(
    `/admin/assessments/${assessmentId}`
  );

  redirect(
    `/admin/assessments/${assessmentId}`
  );
}
export async function updateAssessmentQuestion(
  assessmentId: string,
  questionId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const questionText = String(
    formData.get("question_text") ?? ""
  ).trim();

  const optionA = String(
    formData.get("option_a") ?? ""
  ).trim();

  const optionB = String(
    formData.get("option_b") ?? ""
  ).trim();

  const optionC = String(
    formData.get("option_c") ?? ""
  ).trim();

  const optionD = String(
    formData.get("option_d") ?? ""
  ).trim();

  const correctAnswer = String(
    formData.get("correct_answer") ?? ""
  ).trim();

  const positionValue = Number(
    formData.get("position") ?? 0
  );

  const pointsValue = Number(
    formData.get("points") ?? 1
  );

  if (!questionText) {
    throw new Error(
      "Question text is required."
    );
  }

  const options = [
    optionA,
    optionB,
    optionC,
    optionD,
  ];

  if (options.some((option) => !option)) {
    throw new Error(
      "All four answer options are required."
    );
  }

  if (!options.includes(correctAnswer)) {
    throw new Error(
      "Correct answer must match one of the answer options."
    );
  }

  const position =
    Number.isFinite(positionValue) &&
    positionValue >= 0
      ? Math.floor(positionValue)
      : 0;

  if (
    !Number.isInteger(pointsValue) ||
    pointsValue <= 0
  ) {
    throw new Error(
      "Points must be a positive whole number."
    );
  }

    const {
    data: updatedQuestion,
    error,
  } = await supabase
    .from("assessment_questions")
    .update({
      question_text: questionText,
      options,
      correct_answer: correctAnswer,
      position,
      points: pointsValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questionId)
    .eq("assessment_id", assessmentId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to update assessment question:",
      error
    );

    throw new Error(
      "Unable to update assessment question."
    );
  }

  if (!updatedQuestion) {
    throw new Error(
      "Assessment question not found or no longer belongs to this assessment."
    );
  }

  revalidatePath(
    `/admin/assessments/${assessmentId}`
  );

  revalidatePath(
    `/admin/assessments/${assessmentId}/questions/${questionId}/edit`
  );

  redirect(
    `/admin/assessments/${assessmentId}`
  );
}
export async function deleteAssessmentQuestion(
  assessmentId: string,
  questionId: string
) {
  const { supabase } = await requireAdmin();

   const {
    data: deletedQuestion,
    error,
  } = await supabase
    .from("assessment_questions")
    .delete()
    .eq("id", questionId)
    .eq("assessment_id", assessmentId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to delete assessment question:",
      error
    );

    throw new Error(
      "Unable to delete assessment question."
    );
  }

  if (!deletedQuestion) {
    throw new Error(
      "Assessment question not found or no longer belongs to this assessment."
    );
  }

  revalidatePath(
    `/admin/assessments/${assessmentId}`
  );

  redirect(
    `/admin/assessments/${assessmentId}`
  );
}
export async function updateAssessment(
  assessmentId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const lessonId = String(
    formData.get("lesson_id") ?? ""
  ).trim();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const passingScoreValue = Number(
    formData.get("passing_score") ?? 70
  );

  const maxAttemptsRaw = String(
    formData.get("max_attempts") ?? ""
  ).trim();

  const published =
    formData.get("published") === "on";

  if (!lessonId) {
    throw new Error(
      "A lesson is required."
    );
  }

  if (!title) {
    throw new Error(
      "Assessment title is required."
    );
  }

  if (
    !Number.isFinite(passingScoreValue) ||
    passingScoreValue < 0 ||
    passingScoreValue > 100
  ) {
    throw new Error(
      "Passing score must be between 0 and 100."
    );
  }

  const passingScore =
    Math.round(passingScoreValue);

  let maxAttempts: number | null = null;

  if (maxAttemptsRaw) {
    const parsed =
      Number(maxAttemptsRaw);

    if (
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      throw new Error(
        "Maximum attempts must be a positive whole number."
      );
    }

    maxAttempts = parsed;
  }

  const { data: lesson, error: lessonError } =
    await supabase
      .from("lessons")
      .select("id")
      .eq("id", lessonId)
      .single();

  if (lessonError || !lesson) {
    throw new Error(
      "Selected lesson does not exist."
    );
  }

   /*
   * A published assessment must contain at least
   * one question and must be the only published
   * assessment assigned to its lesson.
   */
  if (published) {
    const {
      count,
      error: questionError,
    } = await supabase
      .from("assessment_questions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("assessment_id", assessmentId);

    if (questionError) {
      console.error(
        "Unable to verify assessment questions:",
        questionError
      );

      throw new Error(
        "Unable to verify assessment questions."
      );
    }

    if (!count || count < 1) {
      throw new Error(
        "Add at least one question before publishing this assessment."
      );
    }

    const {
      data: existingPublishedAssessment,
      error: publishedAssessmentError,
    } = await supabase
      .from("assessments")
      .select("id")
      .eq("lesson_id", lessonId)
      .eq("published", true)
      .neq("id", assessmentId)
      .maybeSingle();

    if (publishedAssessmentError) {
      console.error(
        "Unable to verify published assessment:",
        publishedAssessmentError
      );

      throw new Error(
        "Unable to verify whether this lesson already has a published assessment."
      );
    }

    if (existingPublishedAssessment) {
      redirect(
        `/admin/assessments/${assessmentId}/edit?error=${encodeURIComponent(
          "This lesson already has a published assessment. Unpublish it before publishing another assessment."
        )}`
      );
    }
  }

  const {
    data: updatedAssessment,
    error,
  } = await supabase
    .from("assessments")
    .update({
      lesson_id: lessonId,
      title,
      description: description || null,
      passing_score: passingScore,
      max_attempts: maxAttempts,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessmentId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      redirect(
        `/admin/assessments/${assessmentId}/edit?error=${encodeURIComponent(
          "This lesson already has a published assessment. Unpublish it before publishing another assessment."
        )}`
      );
    }

    console.error(
      "Unable to update assessment:",
      error
    );

    throw new Error(
      "Unable to update assessment."
    );
  }

  if (!updatedAssessment) {
    throw new Error(
      "Assessment not found or no longer available."
    );
  }
  revalidatePath("/admin/assessments");

  revalidatePath(
    `/admin/assessments/${assessmentId}`
  );

  revalidatePath("/learn");

  redirect(
    `/admin/assessments/${assessmentId}`
  );
}
export async function deleteAssessment(
  assessmentId: string
) {
  const { supabase } = await requireAdmin();

  const { data: assessment, error: lookupError } =
    await supabase
      .from("assessments")
      .select("id, lesson_id")
      .eq("id", assessmentId)
      .maybeSingle();

  if (lookupError || !assessment) {
    throw new Error("Assessment not found.");
  }

  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", assessmentId);

 if (error) {
  if (error.code === "23505") {
    throw new Error(
      "This lesson already has a published assessment. Unpublish it before publishing another assessment."
    );
  }

  console.error(
    "Unable to update assessment:",
    error
  );

  throw new Error(
    "Unable to update assessment."
  );
}

  revalidatePath("/admin/assessments");
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect("/admin/assessments");
}
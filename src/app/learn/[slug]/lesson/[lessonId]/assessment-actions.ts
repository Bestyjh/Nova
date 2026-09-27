"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function submitAssessment(
  assessmentId: string,
  courseSlug: string,
  lessonId: string,
  questionIds: string[],
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const answers: Record<string, string> = {};

  for (const questionId of questionIds) {
    const answer = String(
      formData.get(`question_${questionId}`) ?? ""
    ).trim();

    if (!answer) {
      throw new Error(
        "Please answer every question before submitting."
      );
    }

    answers[questionId] = answer;
  }

  const { error } = await supabase.rpc(
    "submit_assessment",
    {
      p_assessment_id: assessmentId,
      p_answers: answers,
    }
  );

  if (error) {
    console.error(
      "Unable to submit assessment:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to submit assessment."
    );
  }

  const lessonPath =
    `/learn/${courseSlug}/lesson/${lessonId}`;

  revalidatePath(lessonPath);

  redirect(`${lessonPath}?assessment=submitted`);
}
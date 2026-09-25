"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return supabase;
}

export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  formData: FormData
) {
  const supabase = await requireAdmin();

  const title =
    formData.get("title")?.toString().trim() ?? "";

  const kind =
    formData.get("kind")?.toString().trim() ?? "article";

  const content =
    formData.get("content")?.toString().trim() ?? "";

  const position = Number(
    formData.get("position")?.toString()
  );

  const published =
    formData.get("published") === "on";

  if (!title) {
    throw new Error("Lesson title is required.");
  }

  if (!["article", "resource"].includes(kind)) {
    throw new Error("Invalid lesson type.");
  }

  if (
    !Number.isInteger(position) ||
    position < 1
  ) {
    throw new Error(
      "Lesson position must be a positive whole number."
    );
  }

  // Verify module belongs to course.
  const { data: moduleRecord } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!moduleRecord) {
    throw new Error("Module not found.");
  }

  // Verify lesson belongs to module.
  const { data: lessonRecord } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (!lessonRecord) {
    throw new Error("Lesson not found.");
  }

  const { error: updateError } = await supabase
    .from("lessons")
    .update({
      title,
      kind,
      content: content || null,
      position,
      published,
    })
    .eq("id", lessonId)
    .eq("module_id", moduleId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect(`/admin/courses/${courseId}`);
}
export async function createLesson(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  const supabase = await requireAdmin();

  const title =
    formData.get("title")?.toString().trim() ?? "";

  const kind =
    formData.get("kind")?.toString().trim() ?? "article";

  const content =
    formData.get("content")?.toString().trim() ?? "";

  const published =
    formData.get("published") === "on";

  if (!title) {
    throw new Error("Lesson title is required.");
  }

  if (!["article", "resource"].includes(kind)) {
    throw new Error("Invalid lesson type.");
  }

  // Verify that the module belongs to this course.
  const { data: moduleRecord } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!moduleRecord) {
    throw new Error("Module not found.");
  }

  // Determine the next lesson position.
  const { data: existingLessons, error: positionError } =
    await supabase
      .from("lessons")
      .select("position")
      .eq("module_id", moduleId)
      .order("position", {
        ascending: false,
      })
      .limit(1);

  if (positionError) {
    throw new Error(positionError.message);
  }

  const highestPosition =
    existingLessons?.[0]?.position ?? 0;

  const structuredContent = content
    ? {
        version: 1,
        blocks: content
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
          .map((text) => ({
            type: "paragraph",
            text,
          })),
      }
    : null;

  const { error: insertError } = await supabase
    .from("lessons")
    .insert({
      module_id: moduleId,
      title,
      kind,
      content: structuredContent,
      position: highestPosition + 1,
      published,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect(`/admin/courses/${courseId}`);
}
export async function deleteLesson(
  courseId: string,
  moduleId: string,
  lessonId: string
) {
  const supabase = await requireAdmin();

  // Verify that the module belongs to the course.
  const { data: moduleRecord } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!moduleRecord) {
    throw new Error("Module not found.");
  }

  // Verify that the lesson belongs to the module.
  const { data: lessonRecord } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (!lessonRecord) {
    throw new Error("Lesson not found.");
  }

  // Remove learner progress for this lesson first.
  const { error: progressError } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("lesson_id", lessonId);

  if (progressError) {
    throw new Error(progressError.message);
  }

  const { error: deleteError } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("module_id", moduleId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect(`/admin/courses/${courseId}`);
}
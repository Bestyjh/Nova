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

export async function createModule(
  courseId: string,
  formData: FormData
) {
  const supabase = await requireAdmin();

  const title =
    formData.get("title")?.toString().trim() ?? "";

  if (!title) {
    throw new Error("Module title is required.");
  }

  // Find the current highest module position.
  const { data: existingModules, error: loadError } =
    await supabase
      .from("modules")
      .select("position")
      .eq("course_id", courseId)
      .order("position", {
        ascending: false,
      })
      .limit(1);

  if (loadError) {
    throw new Error(loadError.message);
  }

  const highestPosition =
    existingModules?.[0]?.position ?? 0;

  const { error: insertError } = await supabase
    .from("modules")
    .insert({
      course_id: courseId,
      title,
      position: highestPosition + 1,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);

  redirect(`/admin/courses/${courseId}`);
}

export async function updateModule(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  const supabase = await requireAdmin();

  const title =
    formData.get("title")?.toString().trim() ?? "";

  const positionValue =
    formData.get("position")?.toString() ?? "";

  const position = Number(positionValue);

  if (!title) {
    throw new Error("Module title is required.");
  }

  if (
    !Number.isInteger(position) ||
    position < 1
  ) {
    throw new Error(
      "Module position must be a positive whole number."
    );
  }

  // Ensure the module belongs to this course.
  const { data: moduleRecord } = await supabase
    .from("modules")
    .select("id")
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!moduleRecord) {
    throw new Error("Module not found.");
  }

  const { error: updateError } = await supabase
    .from("modules")
    .update({
      title,
      position,
    })
    .eq("id", moduleId)
    .eq("course_id", courseId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learn");

  redirect(`/admin/courses/${courseId}`);
}
export async function deleteModule(
  courseId: string,
  moduleId: string
) {
  const supabase = await requireAdmin();

  // Verify that this module belongs to this course.
  const { data: moduleRecord, error: moduleError } =
    await supabase
      .from("modules")
      .select(`
        id,
        lessons (
          id
        )
      `)
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .maybeSingle();

  if (moduleError || !moduleRecord) {
    throw new Error("Module not found.");
  }

  // Safety rule:
  // Never delete a module that contains lessons.
  if (
    moduleRecord.lessons &&
    moduleRecord.lessons.length > 0
  ) {
    throw new Error(
      "This module contains lessons and cannot be deleted."
    );
  }

  const { error: deleteError } = await supabase
    .from("modules")
    .delete()
    .eq("id", moduleId)
    .eq("course_id", courseId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidatePath("/learn");

  redirect(`/admin/courses/${courseId}`);
}
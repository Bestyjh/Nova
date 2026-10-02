"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function createCourse(
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const title =
    formData.get("title")?.toString().trim() ?? "";

  const slug =
    formData.get("slug")?.toString().trim() ?? "";

  const summary =
    formData.get("summary")?.toString().trim() ?? "";

  const published =
    formData.get("published") === "on";

  if (!title) {
    throw new Error("Course title is required.");
  }

  if (!slug) {
    throw new Error("Course slug is required.");
  }

  const normalizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedSlug) {
    throw new Error(
      "Please enter a valid course slug."
    );
  }

  const {
    data: existingCourse,
    error: existingCourseError,
  } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (existingCourseError) {
    throw new Error(existingCourseError.message);
  }

  if (existingCourse) {
    throw new Error(
      "A course with this slug already exists."
    );
  }

  const {
    data: course,
    error: insertError,
  } = await supabase
    .from("courses")
    .insert({
      title,
      slug: normalizedSlug,
      summary: summary || null,
      published,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  if (!course) {
    throw new Error(
      "Course was created but could not be loaded."
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect(`/admin/courses/${course.id}`);
}
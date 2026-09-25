"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateCourse(
  courseId: string,
  formData: FormData
) {
  const supabase = await createClient();

  // Authenticate.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  // Authorize.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

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

  // Keep URLs predictable.
  const normalizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedSlug) {
    throw new Error("Please enter a valid course slug.");
  }

  const { error: updateError } = await supabase
    .from("courses")
    .update({
      title,
      slug: normalizedSlug,
      summary: summary || null,
      published,
    })
    .eq("id", courseId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/learn/${normalizedSlug}`);
  revalidatePath("/learn");
  revalidatePath("/dashboard");

  redirect(`/admin/courses/${courseId}`);
}
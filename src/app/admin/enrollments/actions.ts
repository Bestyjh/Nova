"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function createEnrollment(
  formData: FormData
) {
  const { supabase } = await requireAdmin();

  const userId =
    formData.get("user_id")?.toString() ?? "";

  const courseId =
    formData.get("course_id")?.toString() ?? "";

  if (!userId || !courseId) {
    throw new Error(
      "Learner and course are required."
    );
  }

  // Only learner accounts can be enrolled through
  // the Admin enrollment form.
  const { data: learner } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (!learner || learner.role !== "learner") {
    throw new Error("Learner not found.");
  }

  // Only published courses can receive new
  // learner enrollments.
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("published", true)
    .maybeSingle();

  if (!course) {
    throw new Error("Course not found.");
  }

  // Check first so the admin receives a meaningful
  // error rather than only a database constraint error.
  const { data: existingEnrollment } =
    await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

  if (existingEnrollment) {
    throw new Error(
      "This learner is already enrolled in this course."
    );
  }

  const { error: insertError } = await supabase
    .from("enrollments")
    .insert({
      user_id: userId,
      course_id: courseId,
      status: "active",
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/learners");
  revalidatePath(`/admin/learners/${userId}`);
  revalidatePath("/dashboard");
  revalidatePath("/learn");

  redirect("/admin/enrollments");
}

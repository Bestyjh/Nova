"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";

type EnrollmentActionResult = {
  success: boolean;
  error?: string;
};

export async function cancelEnrollment(
  enrollmentId: string
): Promise<EnrollmentActionResult> {
  const { supabase } = await requireAdmin();

  const { data: enrollment, error: lookupError } =
    await supabase
      .from("enrollments")
      .select("id, user_id, status")
      .eq("id", enrollmentId)
      .maybeSingle();

  if (lookupError) {
    return {
      success: false,
      error: lookupError.message,
    };
  }

  if (!enrollment) {
    return {
      success: false,
      error: "Enrollment not found.",
    };
  }

  if (enrollment.status !== "active") {
    return {
      success: false,
      error:
        "Only active enrollments can be cancelled.",
    };
  }

  const { error: updateError } = await supabase
    .from("enrollments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      completed_at: null,
    })
    .eq("id", enrollmentId)
    .eq("status", "active");

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enrollments");
  revalidatePath(
    `/admin/enrollments/${enrollmentId}`
  );
  revalidatePath("/admin/learners");
  revalidatePath(
    `/admin/learners/${enrollment.user_id}`
  );

  return {
    success: true,
  };
}

export async function reactivateEnrollment(
  enrollmentId: string
): Promise<EnrollmentActionResult> {
  const { supabase } = await requireAdmin();

  const { data: enrollment, error: lookupError } =
    await supabase
      .from("enrollments")
      .select("id, user_id, status")
      .eq("id", enrollmentId)
      .maybeSingle();

  if (lookupError) {
    return {
      success: false,
      error: lookupError.message,
    };
  }

  if (!enrollment) {
    return {
      success: false,
      error: "Enrollment not found.",
    };
  }

  if (enrollment.status !== "cancelled") {
    return {
      success: false,
      error:
        "Only cancelled enrollments can be reactivated.",
    };
  }

  const { error: updateError } = await supabase
    .from("enrollments")
    .update({
      status: "active",
      cancelled_at: null,
      completed_at: null,
    })
    .eq("id", enrollmentId)
    .eq("status", "cancelled");

  if (updateError) {
    return {
      success: false,
      error: updateError.message,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/enrollments");
  revalidatePath(
    `/admin/enrollments/${enrollmentId}`
  );
  revalidatePath("/admin/learners");
  revalidatePath(
    `/admin/learners/${enrollment.user_id}`
  );

  return {
    success: true,
  };
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function createSession(
  formData: FormData
) {
  const { supabase, userId } =
    await requireAdmin();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const sessionType = String(
    formData.get("session_type") ?? ""
  ).trim();

  const startsAt = String(
    formData.get("starts_at") ?? ""
  ).trim();

  const endsAt = String(
    formData.get("ends_at") ?? ""
  ).trim();

  const location = String(
    formData.get("location") ?? ""
  ).trim();

  const meetingUrl = String(
    formData.get("meeting_url") ?? ""
  ).trim();

  const courseId = String(
    formData.get("course_id") ?? ""
  ).trim();

  const published =
    formData.get("published") === "on";

  if (!title) {
    throw new Error(
      "Session title is required."
    );
  }

  if (!startsAt) {
    throw new Error(
      "Session start date and time are required."
    );
  }

  const allowedTypes = [
    "online",
    "in_person",
    "hybrid",
  ];

  if (!allowedTypes.includes(sessionType)) {
    throw new Error(
      "Invalid session type."
    );
  }

  const startDate = new Date(startsAt);

  if (Number.isNaN(startDate.getTime())) {
    throw new Error(
      "Invalid session start date."
    );
  }

  let endDate: Date | null = null;

  if (endsAt) {
    endDate = new Date(endsAt);

    if (Number.isNaN(endDate.getTime())) {
      throw new Error(
        "Invalid session end date."
      );
    }

    if (endDate <= startDate) {
      throw new Error(
        "Session end time must be after the start time."
      );
    }
  }

  const { error } = await supabase
    .from("sessions")
    .insert({
      title,
      description: description || null,
      session_type: sessionType,
      starts_at: startDate.toISOString(),
      ends_at: endDate
        ? endDate.toISOString()
        : null,
      location: location || null,
      meeting_url: meetingUrl || null,
      course_id: courseId || null,
      published,
      created_by: userId,
    });

  if (error) {
    console.error(
      "Unable to create session:",
      error
    );

    throw new Error(
      "Unable to create session."
    );
  }

  revalidatePath("/admin/sessions");
  revalidatePath("/sessions");

  redirect("/admin/sessions");
}
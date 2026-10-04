"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fromZonedTime } from "date-fns-tz";

import { requireAdmin } from "@/lib/auth/require-admin";

function isValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone,
    }).format();

    return true;
  } catch {
    return false;
  }
}

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

  const timezone = String(
    formData.get("timezone") ?? ""
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

  if (!timezone || !isValidTimeZone(timezone)) {
    throw new Error(
      "A valid session timezone is required."
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

  const startDate = fromZonedTime(
    startsAt,
    timezone
  );

  if (Number.isNaN(startDate.getTime())) {
    throw new Error(
      "Invalid session start date."
    );
  }

  let endDate: Date | null = null;

  if (endsAt) {
    endDate = fromZonedTime(
      endsAt,
      timezone
    );

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
      timezone,
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
export async function updateSession(
  sessionId: string,
  formData: FormData
) {
  const { supabase } = await requireAdmin();

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

  const timezone = String(
    formData.get("timezone") ?? ""
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

  if (!timezone || !isValidTimeZone(timezone)) {
    throw new Error(
      "A valid session timezone is required."
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

  const startDate = fromZonedTime(
    startsAt,
    timezone
  );

  if (Number.isNaN(startDate.getTime())) {
    throw new Error(
      "Invalid session start date."
    );
  }

  let endDate: Date | null = null;

  if (endsAt) {
      endDate = fromZonedTime(
      endsAt,
      timezone
    );

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
    .update({
      title,
      description: description || null,
      session_type: sessionType,
      starts_at: startDate.toISOString(),
      ends_at: endDate
        ? endDate.toISOString()
        : null,
      timezone,
      location: location || null,
      meeting_url: meetingUrl || null,
      course_id: courseId || null,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error(
      "Unable to update session:",
      error
    );

    throw new Error(
      "Unable to update session."
    );
  }

  revalidatePath("/admin/sessions");
  revalidatePath(
    `/admin/sessions/${sessionId}/edit`
  );
  revalidatePath("/sessions");

  redirect("/admin/sessions");
}

export async function deleteSession(
  sessionId: string
) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error(
      "Unable to delete session:",
      error
    );

    throw new Error(
      "Unable to delete session."
    );
  }

  revalidatePath("/admin/sessions");
  revalidatePath("/sessions");

  redirect("/admin/sessions");
}
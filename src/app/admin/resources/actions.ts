"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function createResource(
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

  const resourceType = String(
    formData.get("resource_type") ?? ""
  ).trim();

  const url = String(
    formData.get("url") ?? ""
  ).trim();

  const courseId = String(
    formData.get("course_id") ?? ""
  ).trim();

  const positionValue = Number(
    formData.get("position") ?? 0
  );

  const published =
    formData.get("published") === "on";

  if (!title) {
    throw new Error(
      "Resource title is required."
    );
  }

  if (!url) {
    throw new Error(
      "Resource URL is required."
    );
  }

  const allowedTypes = [
    "document",
    "video",
    "website",
    "download",
    "other",
  ];

  if (!allowedTypes.includes(resourceType)) {
    throw new Error(
      "Invalid resource type."
    );
  }

  const position =
    Number.isFinite(positionValue) &&
    positionValue >= 0
      ? Math.floor(positionValue)
      : 0;

  const { error } = await supabase
    .from("resources")
    .insert({
      title,
      description:
        description || null,
      resource_type: resourceType,
      url,
      course_id:
        courseId || null,
      position,
      published,
      created_by: userId,
    });

  if (error) {
    console.error(
      "Unable to create resource:",
      error
    );

    throw new Error(
      "Unable to create resource."
    );
  }

  revalidatePath("/admin/resources");
  revalidatePath("/resources");

  redirect("/admin/resources");
}
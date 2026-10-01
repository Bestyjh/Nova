"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";

export async function updateProfile(
  formData: FormData
) {
  const { supabase, userId } =
    await requireUser();

  const firstName = String(
    formData.get("first_name") ?? ""
  ).trim();

  const lastName = String(
    formData.get("last_name") ?? ""
  ).trim();

  if (!firstName) {
    throw new Error(
      "First name is required."
    );
  }

  if (!lastName) {
    throw new Error(
      "Last name is required."
    );
  }

  const {
    data: updatedProfile,
    error,
  } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to update profile:",
      error
    );

    throw new Error(
      "Unable to update profile."
    );
  }

  if (!updatedProfile) {
    throw new Error(
      "Profile not found or could not be updated."
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/resources");
  revalidatePath("/sessions");

  redirect("/profile");
}
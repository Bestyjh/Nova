import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";

export async function requireAdmin() {
  const { supabase, userId } = await requireUser();

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

  return {
    supabase,
    userId,
    profile,
  };
}

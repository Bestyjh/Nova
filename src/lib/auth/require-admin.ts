import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/require-user";
import { getProfileRole } from "@/lib/data/profiles";

export async function requireAdmin() {
  const { supabase, userId } = await requireUser();

  const { data: profile, error: profileError } =
    await getProfileRole(supabase, userId);

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

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  return {
    supabase,
    userId,
  };
}

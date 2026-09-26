import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserCertificates(
  supabase: SupabaseClient,
  userId: string
) {
  return supabase
    .from("certificates")
    .select(`
      id,
      enrollment_id,
      certificate_number,
      issued_at
    `)
    .eq("user_id", userId);
}

export async function getCertificateByEnrollment(
  supabase: SupabaseClient,
  enrollmentId: string
) {
  return supabase
    .from("certificates")
    .select(`
      id,
      certificate_number,
      issued_at,
      issued_by
    `)
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
}

export async function getAdminCertificateById(
  supabase: SupabaseClient,
  certificateId: string
) {
  return supabase
    .from("certificates")
    .select(`
      id,
      enrollment_id,
      user_id,
      course_id,
      certificate_number,
      issued_at,
      issued_by
    `)
    .eq("id", certificateId)
    .maybeSingle();
}

export async function getLearnerCertificateById(
  supabase: SupabaseClient,
  certificateId: string,
  userId: string
) {
  return supabase
    .from("certificates")
    .select(`
      id,
      enrollment_id,
      user_id,
      course_id,
      certificate_number,
      issued_at
    `)
    .eq("id", certificateId)
    .eq("user_id", userId)
    .maybeSingle();
}
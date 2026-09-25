"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type IssueCertificateResult = {
  success: boolean;
  certificateId?: string;
  certificateNumber?: string;
  alreadyExisted?: boolean;
  error?: string;
};

export async function issueCertificate(
  enrollmentId: string
): Promise<IssueCertificateResult> {
  const supabase = await createClient();

  // Confirm authenticated account.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return {
      success: false,
      error: "Authentication required.",
    };
  }

  /*
   * PostgreSQL performs the authoritative checks:
   * - authenticated user is an admin
   * - enrollment exists
   * - enrollment is completed
   * - completed_at exists
   * - course contains published lessons
   * - every published lesson is completed
   * - certificate does not already need reissuing
   */
  const {
    data: certificateData,
    error: certificateError,
  } = await supabase.rpc("issue_certificate", {
    p_enrollment_id: enrollmentId,
  });

  if (certificateError) {
    return {
      success: false,
      error: certificateError.message,
    };
  }

  const certificate =
    Array.isArray(certificateData)
      ? certificateData[0]
      : certificateData;

  if (!certificate?.certificate_id) {
    return {
      success: false,
      error:
        "Certificate issuance did not return a certificate record.",
    };
  }

  revalidatePath(
    `/admin/completions/${enrollmentId}`
  );

  revalidatePath("/admin/completions");

  return {
    success: true,
    certificateId:
      certificate.certificate_id,
    certificateNumber:
      certificate.certificate_number,
    alreadyExisted:
      certificate.already_existed === true,
  };
}
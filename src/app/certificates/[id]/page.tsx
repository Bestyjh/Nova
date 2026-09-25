import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Award } from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import PrintCertificateButton from "./print-certificate-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LearnerCertificatePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Authenticate learner.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  /*
   * RLS provides the critical ownership check here.
   * A learner can only retrieve certificates where
   * certificates.user_id = auth.uid().
   */
  const {
    data: certificate,
    error: certificateError,
  } = await supabase
    .from("certificates")
    .select(`
      id,
      enrollment_id,
      user_id,
      course_id,
      certificate_number,
      issued_at
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (certificateError || !certificate) {
    notFound();
  }

  const { data: learner } = await supabase
    .from("profiles")
    .select(`
      first_name,
      last_name
    `)
    .eq("id", userId)
    .maybeSingle();

  const { data: course } = await supabase
    .from("courses")
    .select(`
      id,
      title
    `)
    .eq("id", certificate.course_id)
    .maybeSingle();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      completed_at
    `)
    .eq("id", certificate.enrollment_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (
    !learner ||
    !course ||
    !enrollment ||
    enrollment.status !== "completed" ||
    !enrollment.completed_at
  ) {
    notFound();
  }

  const learnerName =
    [
      learner.first_name,
      learner.last_name,
    ]
      .filter(Boolean)
      .join(" ") || "Learner";

  const completionDate = new Date(
    enrollment.completed_at
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const issueDate = new Date(
    certificate.issued_at
  ).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="authPage">
      <PortalHeader />

      <main
        className="dashboardMain learnerCertificatePage"
      >
        <div className="dashboardHeading">
          <div>
            <Link
              href="/dashboard"
              className="courseMeta"
            >
              ← Learner Dashboard
            </Link>

            <p
              className="eyebrow"
              style={{ marginTop: "20px" }}
            >
              NOVA LEARNING
            </p>

            <h1>Your Certificate</h1>

            <p>
              Certificate{" "}
              {certificate.certificate_number}
            </p>
          </div>
        </div>

        <div
          className="certificateActions"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <Link
            href="/dashboard"
            className="button compact"
          >
            ← Back to Dashboard
          </Link>

          <PrintCertificateButton />
        </div>

        <section className="certificateSheet">
          <div className="certificateInner">
            <div className="certificateMark">
              <Award size={44} />
            </div>

            <p className="certificateInstitute">
              NOVA Wellness &amp; Lifestyle
              Institute
            </p>

            <p className="certificateEyebrow">
              CERTIFICATE OF COMPLETION
            </p>

            <h2>
              Certificate of Completion
            </h2>

            <p className="certificatePresented">
              This certificate is presented to
            </p>

            <h1 className="certificateName">
              {learnerName}
            </h1>

            <p className="certificateStatement">
              for successfully completing
            </p>

            <h3 className="certificateCourse">
              {course.title}
            </h3>

            <p className="certificateDate">
              Completed {completionDate}
            </p>

            <div className="certificateBottom">
              <div className="certificateSignature">
                <div className="signatureLine" />

                <strong>
                  Authorized Signature
                </strong>

                <span>
                  NOVA Wellness &amp; Lifestyle
                  Institute
                </span>
              </div>

              <div className="certificateVerification">
                <strong>
                  Certificate Number
                </strong>

                <span>
                  {certificate.certificate_number}
                </span>

                <small>
                  Issued {issueDate}
                </small>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
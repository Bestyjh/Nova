import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Award } from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../../admin-sidebar";
import PrintCertificateButton from "./print-certificate-button";
import { getAdminCertificateById } from "@/lib/data/certificates";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CertificatePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Authenticate.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminId = claimsData?.claims?.sub;

  if (claimsError || !adminId) {
    redirect("/login");
  }

  // Authorize admin.
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Load the permanent certificate record.
  const {
    data: certificate,
    error: certificateError,
  } = await getAdminCertificateById(supabase, id);

  if (certificateError || !certificate) {
    notFound();
  }

  // Load learner.
  const { data: learner } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name
    `)
    .eq("id", certificate.user_id)
    .maybeSingle();

  // Load course.
  const { data: course } = await supabase
    .from("courses")
    .select(`
      id,
      title
    `)
    .eq("id", certificate.course_id)
    .maybeSingle();

  // Load authoritative completion date.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(`
      id,
      status,
      completed_at
    `)
    .eq("id", certificate.enrollment_id)
    .maybeSingle();

  if (!learner || !course || !enrollment) {
    notFound();
  }

  const learnerName =
    [
      learner.first_name,
      learner.last_name,
    ]
      .filter(Boolean)
      .join(" ") || "Learner";

  const completionDate =
    enrollment.completed_at
      ? new Date(
          enrollment.completed_at
        ).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Completion date unavailable";

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

      <main className="dashboardShell">
        <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href={`/admin/completions/${certificate.enrollment_id}`}
                className="courseMeta"
              >
                â† Completion Record
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA CERTIFICATE MANAGEMENT
              </p>

              <h1>Certificate</h1>

              <p>
                Certificate{" "}
                {certificate.certificate_number}
              </p>
            </div>
          </div>

          <section className="certificateSheet">
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
    href={`/admin/completions/${certificate.enrollment_id}`}
    className="button compact"
  >
    â† Back to Completion
  </Link>

  <PrintCertificateButton />
</div>
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
                    {
                      certificate.certificate_number
                    }
                  </span>

                  <small>
                    Issued {issueDate}
                  </small>
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
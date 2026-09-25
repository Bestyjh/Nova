import IssueCertificateButton from "./issue-certificate-button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Circle,
  UserRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "../../admin-sidebar";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CompletionDetailPage({
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

  // Load the completed enrollment.
  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(`
      id,
      user_id,
      course_id,
      status,
      enrolled_at,
      completed_at
    `)
    .eq("id", id)
    .eq("status", "completed")
    .maybeSingle();

  if (enrollmentError || !enrollment) {
    notFound();
  }

  // Load account separately.
  const { data: learner } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      role
    `)
    .eq("id", enrollment.user_id)
    .maybeSingle();

  // Load course curriculum.
  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        modules (
          id,
          title,
          position,
          lessons (
            id,
            title,
            position,
            published
          )
        )
      `)
      .eq("id", enrollment.course_id)
      .maybeSingle();

  if (courseError || !course) {
    notFound();
  }

  // Load completed lesson records.
  const {
    data: progressRows,
    error: progressError,
  } = await supabase
    .from("lesson_progress")
    .select(`
      lesson_id,
      completed,
      completed_at
    `)
    .eq("user_id", enrollment.user_id)
    .eq("completed", true);

  if (progressError) {
    throw new Error(progressError.message);
  }
const {
  data: certificate,
  error: certificateError,
} = await supabase
  .from("certificates")
  .select(`
    id,
    certificate_number,
    issued_at,
    issued_by
  `)
  .eq("enrollment_id", enrollment.id)
  .maybeSingle();

if (certificateError) {
  throw new Error(certificateError.message);
}

  const completedLessonIds = new Set(
    progressRows?.map(
      (row) => row.lesson_id
    ) ?? []
  );

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      ...module,
      lessons: [...(module.lessons ?? [])]
        .filter((lesson) => lesson.published)
        .sort(
          (a, b) =>
            a.position - b.position
        ),
    }));

  const lessons = modules.flatMap(
    (module) => module.lessons
  );

  const totalLessons = lessons.length;

  const completedLessons = lessons.filter(
    (lesson) =>
      completedLessonIds.has(lesson.id)
  ).length;

  const progress =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) *
            100
        );

  /*
   * Certification eligibility is deliberately
   * stricter than enrollment.status alone.
   */
  const certificateEligible =
    enrollment.status === "completed" &&
    enrollment.completed_at !== null &&
    totalLessons > 0 &&
    completedLessons === totalLessons;

  const learnerName = learner
    ? [
        learner.first_name,
        learner.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "Unnamed Account"
    : "Unknown Account";

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href="/admin/completions"
                className="courseMeta"
              >
                ← All Completions
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COMPLETION MANAGEMENT
              </p>

              <h1>{learnerName}</h1>

              <p>{course.title}</p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <UserRound size={24} />

              <strong>
                {learner?.role ?? "Unknown"}
              </strong>

              <span>Account role</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />

              <strong>
                {completedLessons}/{totalLessons}
              </strong>

              <span>Lessons completed</span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />

              <strong>{progress}%</strong>

              <span>Verified progress</span>
            </div>
          </div>

        <section
  className="learningPanel"
  style={{ marginTop: "24px" }}
>
  <span className="courseMeta">
    CERTIFICATE
  </span>

  {certificate ? (
    <>
      <h2>Certificate Issued</h2>

      <div
        style={{
          display: "grid",
          gap: "14px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Award size={28} />

          <p style={{ margin: 0 }}>
            This completion has an issued
            NOVA certificate.
          </p>
        </div>

        <p>
          <strong>
            Certificate Number:
          </strong>{" "}
          {certificate.certificate_number}
        </p>

        <p>
          <strong>Issued:</strong>{" "}
          {new Date(
            certificate.issued_at
          ).toLocaleDateString()}
        </p>
<Link
  href={`/admin/certificates/${certificate.id}`}
  className="button compact"
>
  View Certificate
</Link>
      </div>
    </>
  ) : certificateEligible ? (
    <>
      <h2>Eligible for Certificate</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <Award size={28} />

        <p style={{ margin: 0 }}>
          This completion has a verified
          completion date and all published
          lessons are complete.
        </p>
      </div>

      {enrollment.completed_at && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "18px",
          }}
        >
          <CalendarCheck size={20} />

          <span>
            Completion recorded{" "}
            {new Date(
              enrollment.completed_at
            ).toLocaleDateString()}
          </span>
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <IssueCertificateButton
          enrollmentId={enrollment.id}
        />
      </div>
    </>
  ) : (
    <>
      <h2>Not Yet Eligible</h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <Circle size={28} />

        <p style={{ margin: 0 }}>
          This record does not currently
          satisfy all certificate eligibility
          requirements.
        </p>
      </div>
    </>
  )}
</section>

<section
  className="learningPanel"
  style={{ marginTop: "24px" }}
>
  <span className="courseMeta">
    VERIFIED LEARNING ACTIVITY
  </span>

  <h2>Completed Curriculum</h2>            <div
              style={{
                display: "grid",
                gap: "20px",
                marginTop: "24px",
              }}
            >
              {modules.map((module) => (
                <article
                  className="courseCard"
                  key={module.id}
                >
                  <div className="courseBody">
                    <span className="courseMeta">
                      Module {module.position}
                    </span>

                    <h3>{module.title}</h3>

                    <div className="lessonList">
                      {module.lessons.map(
                        (lesson) => {
                          const completed =
                            completedLessonIds.has(
                              lesson.id
                            );

                          return (
                            <div
                              className="lessonRow"
                              key={lesson.id}
                            >
                              {completed ? (
                                <CheckCircle2
                                  size={20}
                                />
                              ) : (
                                <Circle
                                  size={20}
                                />
                              )}

                              <span>
                                {lesson.title}
                              </span>

                              <span className="courseMeta">
                                {completed
                                  ? "Completed"
                                  : "Not completed"}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
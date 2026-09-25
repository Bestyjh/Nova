import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import PortalHeader from "../../../portal-header";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CompletionPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // Authenticate learner.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  // Load course.
  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("slug", slug)
      .eq("published", true)
      .single();

  if (courseError || !course) {
    notFound();
  }

  // Verify learner has an enrollment.
  const { data: enrollment, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select("id, status, completed_at")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .in("status", ["active", "completed"])
      .maybeSingle();

  if (enrollmentError || !enrollment) {
    redirect(`/learn/${course.slug}`);
  }

  /*
   * Ask PostgreSQL to verify completion.
   *
   * If the enrollment is still active but the learner
   * really has completed every published lesson, the
   * database function will safely finalize it.
   */
  const {
    data: completionData,
    error: completionError,
  } = await supabase.rpc(
    "complete_course_if_eligible",
    {
      p_course_id: course.id,
    }
  );

  if (completionError) {
    console.error(
      "Course completion verification failed:",
      completionError
    );

    redirect(`/learn/${course.slug}`);
  }

  const completionResult =
    Array.isArray(completionData)
      ? completionData[0]
      : completionData;

  if (completionResult?.completed !== true) {
    redirect(`/learn/${course.slug}`);
  }

  const completedAt =
    completionResult.completed_at;

  // Load learner name.
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  const learnerName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") || "NOVA Learner";

  const completionDate = completedAt
    ? new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(completedAt))
    : "Completion recorded";

  return (
    <div className="learnPage">
      <PortalHeader />

      <section className="catalogHero">
        <div className="wrap">
          <div>
            <span
              className="courseMeta"
              style={{ color: "#bce5c3" }}
            >
              NOVA LEARNING
            </span>

            <h1>Course Completed</h1>

            <p>
              Your completion has been recorded by NOVA
              Wellness & Lifestyle Institute.
            </p>
          </div>

          <div className="statCard">
            <strong>100%</strong>
            <span>Course complete</span>
          </div>
        </div>
      </section>

      <section className="catalog">
        <div className="wrap">
          <article className="courseCard">
            <div
              className="courseBody"
              style={{
                textAlign: "center",
                padding: "48px 32px",
              }}
            >
              <CheckCircle2 size={56} />

              <span
                className="courseMeta"
                style={{
                  display: "block",
                  marginTop: "20px",
                }}
              >
                COMPLETION CONFIRMED
              </span>

              <h2>{course.title}</h2>

              <p>
                Congratulations, {learnerName}. You have
                completed this NOVA learning pathway.
              </p>

              <p>
                <strong>Completion date:</strong>{" "}
                {completionDate}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "28px",
                }}
              >
                <Link
                  href={`/learn/${course.slug}`}
                  className="button"
                >
                  Review Course
                </Link>

                <Link
                  href="/dashboard"
                  className="button"
                >
                  Return to Dashboard
                </Link>
              </div>

              <p
                style={{
                  marginTop: "28px",
                  opacity: 0.7,
                }}
              >
                This completion record can be used for
                future certificate functionality.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
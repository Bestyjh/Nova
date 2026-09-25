import AdminSidebar from "../admin-sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  CheckCircle2,
  FlaskConical,
  UsersRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";

export default async function CompletionsPage() {
  const supabase = await createClient();

  // Authentication
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminId = claimsData?.claims?.sub;

  if (claimsError || !adminId) {
    redirect("/login");
  }

  // Admin authorization
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Completed enrollment records
  const {
    data: completedEnrollments,
    error: enrollmentsError,
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
    .eq("status", "completed")
    .order("enrolled_at", {
      ascending: false,
    });

  if (enrollmentsError) {
    throw new Error(
      enrollmentsError.message
    );
  }

  // Profiles are loaded separately because there
  // is currently no Supabase schema relationship
  // between enrollments.user_id and profiles.id.
  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        role
      `);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const { data: courses, error: coursesError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        modules (
          id,
          lessons (
            id,
            published
          )
        )
      `);

  if (coursesError) {
    throw new Error(coursesError.message);
  }

  const { data: progressRows, error: progressError } =
    await supabase
      .from("lesson_progress")
      .select(`
        user_id,
        lesson_id,
        completed
      `)
      .eq("completed", true);

  if (progressError) {
    throw new Error(progressError.message);
  }

  const records =
    completedEnrollments?.map((enrollment) => {
      const profile =
        profiles?.find(
          (profile) =>
            profile.id === enrollment.user_id
        ) ?? null;

      const course =
        courses?.find(
          (course) =>
            course.id === enrollment.course_id
        ) ?? null;

      const publishedLessons =
        course?.modules?.flatMap(
          (module) =>
            module.lessons?.filter(
              (lesson) => lesson.published
            ) ?? []
        ) ?? [];

      const completedLessonIds = new Set(
        progressRows
          ?.filter(
            (row) =>
              row.user_id === enrollment.user_id
          )
          .map((row) => row.lesson_id) ?? []
      );

      const completedLessons =
        publishedLessons.filter((lesson) =>
          completedLessonIds.has(lesson.id)
        ).length;

      const totalLessons =
        publishedLessons.length;

      const progress =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons /
                totalLessons) *
                100
            );

      const name = profile
        ? [
            profile.first_name,
            profile.last_name,
          ]
            .filter(Boolean)
            .join(" ") || "Unnamed Account"
        : "Unknown Account";

      return {
        enrollment,
        profile,
        course,
        name,
        completedLessons,
        totalLessons,
        progress,
      };
    }) ?? [];

  const learnerCompletions = records.filter(
    (record) =>
      record.profile?.role === "learner"
  );

  const adminCompletions = records.filter(
    (record) =>
      record.profile?.role === "admin"
  );

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
      <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA ADMINISTRATION
              </p>

              <h1>Completions</h1>

              <p>
                Review completed learning
                pathways and verified learner
                progress.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <Award size={24} />

              <strong>
                {records.length}
              </strong>

              <span>
                Completed enrollments
              </span>
            </div>

            <div className="statCard">
              <UsersRound size={24} />

              <strong>
                {learnerCompletions.length}
              </strong>

              <span>
                Learner completions
              </span>
            </div>

            <div className="statCard">
              <FlaskConical size={24} />

              <strong>
                {adminCompletions.length}
              </strong>

              <span>
                Admin / test completions
              </span>
            </div>
          </div>

          <section className="learningPanel">
            <div className="catalogTop">
              <div>
                <span className="courseMeta">
                  COMPLETION MANAGEMENT
                </span>

                <h2>
                  Course Completions
                </h2>
              </div>
            </div>

            {records.length === 0 ? (
              <div
                className="emptyLearning"
                style={{
                  marginTop: "24px",
                }}
              >
                <h3>
                  No completed courses
                </h3>

                <p>
                  Completed learner pathways
                  will appear here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                {records.map((record) => (
                  <article
                    className="courseCard"
                    key={
                      record.enrollment.id
                    }
                  >
                    <div className="courseBody">
                      <div className="catalogTop">
                        <div>
                          <span className="courseMeta">
                            {record.profile?.role ??
                              "unknown"}{" "}
                            · completed
                          </span>

                          <h3>
                            {record.name}
                          </h3>

                          <p>
                            {record.course?.title ??
                              "Unknown Course"}
                          </p>

                          <p>
                            {
                              record.completedLessons
                            }{" "}
                            of{" "}
                            {
                              record.totalLessons
                            }{" "}
                            lessons completed
                          </p>

                          <strong>
                            {record.progress}%
<p className="courseMeta">
  Completed{" "}
  {record.enrollment.completed_at
    ? new Date(
        record.enrollment.completed_at
      ).toLocaleDateString()
    : "Date unavailable"}
</p>
                          </strong>
                        </div>

                        <Link
  href={`/admin/completions/${record.enrollment.id}`}
  className="button compact"
>
  View Completion
</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

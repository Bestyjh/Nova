import AdminSidebar from "../../admin-sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import { getLearnerEnrollmentsWithCurriculum } from "@/lib/data/enrollments";
import { getCompletedLessonIds } from "@/lib/data/progress";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LearnerPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminId = claimsData?.claims?.sub;

  if (claimsError || !adminId) {
    redirect("/login");
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: learner, error: learnerError } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        role
      `)
      .eq("id", id)
      .maybeSingle();

  if (learnerError || !learner) {
    notFound();
  }

  const { data: enrollments, error: enrollmentError } =
    await getLearnerEnrollmentsWithCurriculum(
      supabase,
      learner.id
    );

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const { data: lessonProgress } =
    await getCompletedLessonIds(
      supabase,
      learner.id
    );

  const completedLessonIds = new Set(
    lessonProgress?.map(
      (progress) => progress.lesson_id
    ) ?? []
  );

  const learningRecords =
    enrollments?.map((enrollment) => {
      const course = Array.isArray(enrollment.courses)
        ? enrollment.courses[0]
        : enrollment.courses;

      if (!course) {
        return null;
      }

      const modules = course.modules ?? [];

      const lessons = modules.flatMap(
        (module) =>
          module.lessons?.filter(
            (lesson) => lesson.published
          ) ?? []
      );

      const totalLessons = lessons.length;

      const completedLessons =
        lessons.filter((lesson) =>
          completedLessonIds.has(lesson.id)
        ).length;

      const progress =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons / totalLessons) * 100
            );

      return {
        enrollment,
        course,
        totalLessons,
        completedLessons,
        progress,
      };
    }).filter(
      (
        record
      ): record is NonNullable<typeof record> =>
        record !== null
    ) ?? [];

  const activeCount = learningRecords.filter(
    (record) =>
      record.enrollment.status === "active"
  ).length;

  const completedCount = learningRecords.filter(
    (record) =>
      record.enrollment.status === "completed"
  ).length;

  const learnerName =
    [learner.first_name, learner.last_name]
      .filter(Boolean)
      .join(" ") || "Unnamed Learner";

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
       <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href="/admin/learners"
                className="courseMeta"
              >
                Ã¢â€ Â All Learners
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA LEARNER MANAGEMENT
              </p>

              <h1>{learnerName}</h1>

              <p>
                Learning activity and course
                progress.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <UserRound size={24} />
              <strong>
                {learningRecords.length}
              </strong>
              <span>Total enrollments</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />
              <strong>{activeCount}</strong>
              <span>Active courses</span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />
              <strong>{completedCount}</strong>
              <span>Completed courses</span>
            </div>
          </div>

          <section className="learningPanel">
            <span className="courseMeta">
              LEARNING ACTIVITY
            </span>

            <h2>Courses</h2>

            {learningRecords.length === 0 ? (
              <div
                className="emptyLearning"
                style={{ marginTop: "24px" }}
              >
                <h3>No enrollments</h3>

                <p>
                  This learner has not been
                  enrolled in a NOVA course.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "18px",
                  marginTop: "24px",
                }}
              >
                {learningRecords.map(
                  (record) => (
                    <article
                      className="courseCard"
                      key={record.enrollment.id}
                    >
                      <div className="courseBody">
                        <span className="courseMeta">
                          {record.enrollment.status}
                        </span>

                        <h3>
                          {record.course.title}
                        </h3>

                        <p>
                          {record.completedLessons} of{" "}
                          {record.totalLessons} lessons
                          completed
                        </p>

                        <strong>
                          {record.progress}%
                        </strong>

                        <div
                          style={{
                            marginTop: "18px",
                          }}
                        >
                          <Link
                            href={`/admin/courses/${record.course.id}`}
                            className="button compact"
                          >
                            View Course
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

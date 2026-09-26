import AdminSidebar from "../../admin-sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  UserRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { getEnrollmentById } from "@/lib/data/enrollments";
import { getCompletedLessonProgressWithDates } from "@/lib/data/progress";
import { requireAdmin } from "@/lib/auth/require-admin";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EnrollmentPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  // Enrollment
  const { data: enrollment, error: enrollmentError } =
    await getEnrollmentById(supabase, id);

  if (enrollmentError || !enrollment) {
    notFound();
  }

  // Learner/account
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

  // Course and curriculum
  const { data: course } = await supabase
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

  if (!course) {
    notFound();
  }

  // Completed lessons for this account.
  const { data: progressRows } =
    await getCompletedLessonProgressWithDates(
      supabase,
      enrollment.user_id
    );

  const completedLessonIds = new Set(
    progressRows?.map((row) => row.lesson_id) ?? []
  );

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      ...module,
      lessons: [...(module.lessons ?? [])]
        .filter((lesson) => lesson.published)
        .sort((a, b) => a.position - b.position),
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
          (completedLessons / totalLessons) * 100
        );

  const learnerName = learner
    ? [learner.first_name, learner.last_name]
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
                href="/admin/enrollments"
                className="courseMeta"
              >
                ÃƒÂ¢Ã¢â‚¬Â Ã‚Â All Enrollments
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA ENROLLMENT MANAGEMENT
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

              <span>Course progress</span>
            </div>
          </div>

          <section className="learningPanel">
            <span className="courseMeta">
              ENROLLMENT
            </span>

            <h2>Enrollment Details</h2>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              <p>
                <strong>Status:</strong>{" "}
                {enrollment.status}
              </p>

              <p>
                <strong>Course:</strong>{" "}
                {course.title}
              </p>

              <p>
                <strong>Account:</strong>{" "}
                {learnerName}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {learner?.role ?? "Unknown"}
              </p>

              <p>
                <strong>Enrolled:</strong>{" "}
                {new Date(
                  enrollment.enrolled_at
                ).toLocaleDateString()}
              </p>
            </div>
          </section>

          <section
            className="learningPanel"
            style={{ marginTop: "24px" }}
          >
            <span className="courseMeta">
              PROGRESS REVIEW
            </span>

            <h2>Lessons</h2>

            <div
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
                                <Circle size={20} />
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

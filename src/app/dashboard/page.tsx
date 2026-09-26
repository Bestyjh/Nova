import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  User,
} from "lucide-react";

import PortalHeader from "../portal-header";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileSummary } from "@/lib/data/profiles";
import { getUserEnrollmentsWithCurriculum } from "@/lib/data/enrollments";
import { getCompletedLessonIds } from "@/lib/data/progress";
import { getUserCertificates } from "@/lib/data/certificates";

export default async function Dashboard() {
  const { supabase, userId } = await requireUser();

  // Load learner profile.
  const { data: profile } =
    await getProfileSummary(supabase, userId);

  const firstName = profile?.first_name || "Learner";

  // Load enrollments together with course modules and lessons.
  const { data: enrollments } =
    await getUserEnrollmentsWithCurriculum(
      supabase,
      userId
    );

 const learningEnrollments =
  enrollments?.filter(
    (enrollment) =>
      enrollment.status === "active" ||
      enrollment.status === "completed"
  ) ?? [];

  // Load this learner's completed lessons.
  const { data: lessonProgress } =
    await getCompletedLessonIds(supabase, userId);

  const completedLessonIds = new Set(
    lessonProgress?.map((item) => item.lesson_id) ?? []
  );
// Load certificates issued to this learner.
// RLS ensures the authenticated learner can only
// read certificate records belonging to them.
const {
  data: certificates,
  error: certificatesError,
} = await getUserCertificates(supabase, userId);

if (certificatesError) {
  throw new Error(certificatesError.message);
}

const certificateByEnrollment = new Map(
  (certificates ?? []).map((certificate) => [
    certificate.enrollment_id,
    certificate,
  ])
);

  // Calculate course progress.
 const coursesWithProgress = learningEnrollments
  .map((enrollment) => {
    const course = Array.isArray(enrollment.courses)
      ? enrollment.courses[0]
      : enrollment.courses;

    if (!course) {
      return null;
    }

    const lessons =
      course.modules?.flatMap(
        (module) =>
          module.lessons?.filter(
            (lesson: {
              id: string;
              position: number;
              published: boolean;
            }) => lesson.published
          ) ?? []
      ) ?? [];

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

    return {
  enrollmentId: enrollment.id,
  course,
  totalLessons,
  completedLessons,
  progress,
  certificate:
    certificateByEnrollment.get(
      enrollment.id
    ) ?? null,
};
  })
  .filter(
    (
      item
    ): item is NonNullable<typeof item> =>
      item !== null
  );

  const completedCourses =
    coursesWithProgress.filter(
      (item) =>
        item &&
        item.totalLessons > 0 &&
        item.progress === 100
    ).length;

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <aside className="dashboardSidebar">
          <h3>Learner Portal</h3>

          <nav>
            <Link href="/dashboard">
              Overview
            </Link>

            <Link href="/learn">
              My Learning
            </Link>

            <span>Resources</span>
            <span>Sessions</span>
            <span>Profile</span>
          </nav>
        </aside>

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA LEARNING
              </p>

              <h1>
                Welcome, {firstName}
              </h1>

              <p>
                Your learning, resources and program
                activity in one place.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <BookOpen size={24} />

              <strong>
  {enrollments?.filter(
    (enrollment) => enrollment.status === "active"
  ).length ?? 0}
</strong>

              <span>
                Active learning pathways
              </span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />

              <strong>
                {completedCourses}
              </strong>

              <span>
                Completed courses
              </span>
            </div>

            <div className="statCard">
              <User size={24} />

              <strong>
                {profile?.role === "admin"
                  ? "Admin"
                  : "Learner"}
              </strong>

              <span>
                Account role
              </span>
            </div>
          </div>

          <section className="learningPanel">
            <h2>My Learning</h2>

            {coursesWithProgress.length === 0 ? (
              <div className="emptyLearning">
                <h3>
                  No active courses yet
                </h3>

                <p>
                  When you enroll in a NOVA
                  learning program, it will
                  appear here.
                </p>

                <Link
                  href="/learn"
                  className="button"
                >
                  Explore Learning
                </Link>
              </div>
            ) : (
              <div className="courseGrid">
                {coursesWithProgress.map(
                  (item) => {
                    if (!item) return null;

                   const {
  enrollmentId,
  course,
  completedLessons,
  totalLessons,
  progress,
  certificate,
} = item;

                    return (
                      <article
                        className="courseCard"
                        key={enrollmentId}
                      >
                        <div className="courseBody">
                          <span className="courseMeta">
                            NOVA Learning
                          </span>

                          <h3>
                            {course.title}
                          </h3>

                          <p>
                            {course.summary}
                          </p>

                          <div
                            style={{
                              marginTop: "20px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                gap: "16px",
                                marginBottom: "8px",
                              }}
                            >
                              <span>
                                {completedLessons} of{" "}
                                {totalLessons} lessons
                                completed
                              </span>

                              <strong>
                                {progress}%
                              </strong>
                            </div>

                            <div
                              style={{
                                width: "100%",
                                height: "10px",
                                background:
                                  "#e8ece9",
                                borderRadius: "999px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${progress}%`,
                                  height: "100%",
                                  background:
                                    "#1c9654",
                                  borderRadius:
                                    "999px",
                                  transition:
                                    "width 0.3s ease",
                                }}
                              />
                            </div>
                          </div>

                        <div
  style={{
    marginTop: "24px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  <Link
    href={`/learn/${course.slug}`}
    className="button"
  >
    {progress === 100
      ? "Review Course"
      : progress > 0
        ? "Continue Learning"
        : "Start Learning"}
  </Link>

  {certificate && (
    <Link
      href={`/certificates/${certificate.id}`}
      className="button compact"
    >
      View Certificate
    </Link>
  )}
</div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

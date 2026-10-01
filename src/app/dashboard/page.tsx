import DashboardClient from "./dashboard-client";

import { requireUser } from "@/lib/auth/require-user";
import { getProfileSummary } from "@/lib/data/profiles";
import { getUserEnrollmentsWithCurriculum } from "@/lib/data/enrollments";
import { getCompletedLessonIds } from "@/lib/data/progress";
import { getUserCertificates } from "@/lib/data/certificates";

export default async function Dashboard() {
  const { supabase, userId } =
    await requireUser();

  /*
   * Load the authenticated learner profile.
   */
  const { data: profile } =
    await getProfileSummary(
      supabase,
      userId
    );

  const firstName =
    profile?.first_name || "Learner";

  /*
   * Load learner enrollments together with
   * their course curriculum.
   */
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

  /*
   * Load completed lesson progress.
   */
  const { data: lessonProgress } =
    await getCompletedLessonIds(
      supabase,
      userId
    );

  const completedLessonIds = new Set(
    lessonProgress?.map(
      (item) => item.lesson_id
    ) ?? []
  );

  /*
   * Load certificates issued to this learner.
   * RLS restricts certificate visibility to
   * the authenticated learner.
   */
  const {
    data: certificates,
    error: certificatesError,
  } = await getUserCertificates(
    supabase,
    userId
  );

  if (certificatesError) {
    throw new Error(
      certificatesError.message
    );
  }

  const certificateByEnrollment =
    new Map(
      (certificates ?? []).map(
        (certificate) => [
          certificate.enrollment_id,
          certificate,
        ]
      )
    );

  /*
   * Convert the database curriculum into the
   * small serializable data model required by
   * the interactive dashboard.
   */
  const courses = learningEnrollments
    .map((enrollment) => {
      const course = Array.isArray(
        enrollment.courses
      )
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

      const totalLessons =
        lessons.length;

      const completedLessons =
        lessons.filter((lesson) =>
          completedLessonIds.has(
            lesson.id
          )
        ).length;

      const progress =
        totalLessons === 0
          ? 0
          : Math.round(
              (completedLessons /
                totalLessons) *
                100
            );

      const completionDate =
        enrollment.status ===
          "completed" &&
        enrollment.completed_at
          ? new Intl.DateTimeFormat(
              "en-CA",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ).format(
              new Date(
                enrollment.completed_at
              )
            )
          : null;

      const certificate =
        certificateByEnrollment.get(
          enrollment.id
        );

      return {
        enrollmentId: enrollment.id,
        enrollmentStatus:
          enrollment.status,
        title: course.title,
        slug: course.slug,
        summary:
          course.summary ?? null,
        completedLessons,
        totalLessons,
        progress,
        completionDate,
        certificateId:
          certificate?.id ?? null,
      };
    })
    .filter(
      (
        course
      ): course is NonNullable<
        typeof course
      > => course !== null
    );

  const activeCount =
    learningEnrollments.filter(
      (enrollment) =>
        enrollment.status === "active"
    ).length;

  const completedCourses =
    learningEnrollments.filter(
      (enrollment) =>
        enrollment.status ===
        "completed"
    ).length;

  return (
    <DashboardClient
      firstName={firstName}
      role={profile?.role ?? null}
      activeCount={activeCount}
      completedCourses={
        completedCourses
      }
      courses={courses}
    />
  );
}
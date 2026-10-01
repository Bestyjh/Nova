import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";

import LearnerPortalShell from "../../learner-portal-shell";
import styles from "../../learner-portal.module.css";

import { requireUser } from "@/lib/auth/require-user";
import { getPublishedCourseBySlug } from "@/lib/data/courses";
import { getProfileSummary } from "@/lib/data/profiles";
import { getCompletedLessonIdsForLessons } from "@/lib/data/progress";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const { supabase, userId } =
    await requireUser();

  const [
    { data: profile, error: profileError },
    { data: course, error: courseError },
  ] = await Promise.all([
    getProfileSummary(supabase, userId),
    getPublishedCourseBySlug(supabase, slug),
  ]);

  if (profileError) {
    throw new Error(
      "Unable to load learner profile."
    );
  }

  if (courseError || !course) {
    notFound();
  }

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      ...module,
      lessons: [...(module.lessons ?? [])].sort(
        (a, b) => a.position - b.position
      ),
    }));

  const orderedLessons = modules.flatMap(
    (module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      }))
  );

  const lessonIds = orderedLessons.map(
    (lesson) => lesson.id
  );

  const [
    { data: progressRows, error: progressError },
    { data: enrollment, error: enrollmentError },
  ] = await Promise.all([
    getCompletedLessonIdsForLessons(
      supabase,
      userId,
      lessonIds
    ),

    supabase
      .from("enrollments")
      .select("id, status, completed_at")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .in("status", ["active", "completed"])
      .maybeSingle(),
  ]);

  if (progressError) {
    throw new Error(
      "Unable to load course progress."
    );
  }

  if (enrollmentError) {
    throw new Error(
      "Unable to load course enrollment."
    );
  }

  const completedLessonIds = new Set(
    progressRows?.map(
      (item) => item.lesson_id
    ) ?? []
  );

  const totalLessons = orderedLessons.length;

  const completedLessons =
    orderedLessons.filter((lesson) =>
      completedLessonIds.has(lesson.id)
    ).length;

  const progress =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) * 100
        );

  const isEnrolled = Boolean(enrollment);

  const firstIncompleteIndex =
    orderedLessons.findIndex(
      (lesson) =>
        !completedLessonIds.has(lesson.id)
    );

  const continueLesson =
    isEnrolled && firstIncompleteIndex >= 0
      ? orderedLessons[firstIncompleteIndex]
      : null;

  const courseCompleted =
    totalLessons > 0 &&
    completedLessons === totalLessons;

  return (
    <LearnerPortalShell
      firstName={
        profile?.first_name || "Learner"
      }
      role={profile?.role ?? null}
    >
      <section className={styles.courseWorkspace}>
        <div className={styles.courseBreadcrumb}>
          <Link href="/learn">
            My Learning
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <span>{course.title}</span>
        </div>

        <header className={styles.courseHero}>
          <div className={styles.courseHeroCopy}>
            <span className={styles.courseMeta}>
              NOVA LEARNING
            </span>

            <h1>{course.title}</h1>

            <p>
              {course.summary ||
                "A structured NOVA learning pathway."}
            </p>

            <div
              className={styles.courseHeroActions}
            >
              {continueLesson ? (
                <Link
                  href={`/learn/${course.slug}/lesson/${continueLesson.id}`}
                  className={styles.primaryButton}
                >
                  <PlayCircle
                    size={17}
                    aria-hidden="true"
                  />

                  {completedLessons > 0
                    ? "Continue Learning"
                    : "Start Learning"}
                </Link>
              ) : courseCompleted ? (
                <Link
                  href={`/learn/${course.slug}/completion`}
                  className={styles.primaryButton}
                >
                  <Award
                    size={17}
                    aria-hidden="true"
                  />
                  View Completion
                </Link>
              ) : (
                <span
                  className={
                    styles.enrollmentNotice
                  }
                >
                  <LockKeyhole
                    size={16}
                    aria-hidden="true"
                  />
                  Enrollment required to begin
                </span>
              )}

              <Link
                href="/dashboard"
                className={styles.secondaryButton}
              >
                Back to Overview
              </Link>
            </div>
          </div>

          <aside
            className={styles.courseProgressCard}
          >
            <div
              className={styles.courseProgressTop}
            >
              <span>Course progress</span>
              <strong>{progress}%</strong>
            </div>

            <div
              className={
                styles.courseProgressTrack
              }
              aria-label={`${progress}% course progress`}
            >
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <p>
              {completedLessons} of {totalLessons}{" "}
              {totalLessons === 1
                ? "lesson"
                : "lessons"}{" "}
              completed
            </p>

            <div
              className={styles.courseProgressMeta}
            >
              <BookOpen
                size={17}
                aria-hidden="true"
              />

              <span>
                {modules.length}{" "}
                {modules.length === 1
                  ? "module"
                  : "modules"}
              </span>
            </div>
          </aside>
        </header>

        <section
          className={styles.courseContentSection}
        >
          <div className={styles.sectionHeading}>
            <div>
              <h2>Course Content</h2>

              <p>
                Work through each module in order
                and track your progress as you go.
              </p>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen
                size={30}
                aria-hidden="true"
              />

              <h3>
                Course content coming soon
              </h3>

              <p>
                NOVA has not published lessons for
                this learning pathway yet.
              </p>
            </div>
          ) : (
            <div className={styles.moduleList}>
              {modules.map(
                (module, moduleIndex) => {
                  const moduleLessons =
                    module.lessons;

                  const moduleCompleted =
                    moduleLessons.filter(
                      (lesson) =>
                        completedLessonIds.has(
                          lesson.id
                        )
                    ).length;

                  return (
                    <article
                      className={
                        styles.modulePanel
                      }
                      key={module.id}
                    >
                      <div
                        className={
                          styles.moduleHeader
                        }
                      >
                        <div
                          className={
                            styles.moduleNumber
                          }
                        >
                          {moduleIndex + 1}
                        </div>

                        <div
                          className={
                            styles.moduleHeadingCopy
                          }
                        >
                          <span>
                            Module{" "}
                            {moduleIndex + 1}
                          </span>

                          <h3>
                            {module.title}
                          </h3>
                        </div>

                        <div
                          className={
                            styles.moduleProgress
                          }
                        >
                          <strong>
                            {moduleCompleted}/
                            {moduleLessons.length}
                          </strong>

                          <span>completed</span>
                        </div>
                      </div>

                      <div
                        className={
                          styles.moduleLessons
                        }
                      >
                        {moduleLessons.map(
                          (lesson) => {
                            const lessonIndex =
                              orderedLessons.findIndex(
                                (item) =>
                                  item.id ===
                                  lesson.id
                              );

                            const completed =
                              completedLessonIds.has(
                                lesson.id
                              );

                            const available =
                              isEnrolled &&
                              (completed ||
                                lessonIndex ===
                                  firstIncompleteIndex);

                            const lessonContent = (
                              <>
                                <span
                                  className={
                                    completed
                                      ? styles.lessonStatusComplete
                                      : available
                                        ? styles.lessonStatusCurrent
                                        : styles.lessonStatusLocked
                                  }
                                >
                                  {completed ? (
                                    <CheckCircle2
                                      size={20}
                                      aria-hidden="true"
                                    />
                                  ) : available ? (
                                    <Circle
                                      size={20}
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <LockKeyhole
                                      size={18}
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>

                                <span
                                  className={
                                    styles.lessonCopy
                                  }
                                >
                                  <strong>
                                    {lesson.title}
                                  </strong>

                                  <small>
                                    {completed
                                      ? "Completed"
                                      : available
                                        ? "Ready to continue"
                                        : isEnrolled
                                          ? "Complete the previous lesson first"
                                          : "Enrollment required"}
                                  </small>
                                </span>

                                {available && (
                                  <ChevronRight
                                    className={
                                      styles.lessonChevron
                                    }
                                    size={18}
                                    aria-hidden="true"
                                  />
                                )}
                              </>
                            );

                            return available ? (
                              <Link
                                key={lesson.id}
                                href={`/learn/${course.slug}/lesson/${lesson.id}`}
                                className={
                                  styles.lessonItem
                                }
                              >
                                {lessonContent}
                              </Link>
                            ) : (
                              <div
                                key={lesson.id}
                                className={`${styles.lessonItem} ${styles.lessonItemDisabled}`}
                                aria-disabled="true"
                              >
                                {lessonContent}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </section>
    </LearnerPortalShell>
  );
}
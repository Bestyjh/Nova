import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

import LearnerPortalShell from "../../../../learner-portal-shell";
import styles from "../../../../learner-portal.module.css";

import { createClient } from "@/lib/supabase/server";
import { getProfileSummary } from "@/lib/data/profiles";

import CompleteLessonButton from "./complete-lesson-button";
import LessonContent from "../../../lesson-content";

import {
  getPublishedAssessmentForLesson,
  getPublishedAssessmentQuestions,
  getLearnerAssessmentAttempts,
} from "@/lib/data/learner-assessments";

import { submitAssessment } from "./assessment-actions";

type PageProps = {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
};

type CourseLesson = {
  id: string;
  title: string;
  position: number;
  modulePosition: number;
};

export default async function LessonPage({
  params,
}: PageProps) {
  const { slug, lessonId } = await params;

  const supabase = await createClient();

  // Authenticate learner.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }
const {
  data: profile,
  error: profileError,
} = await getProfileSummary(
  supabase,
  userId
);

if (profileError) {
  throw new Error(
    "Unable to load learner profile."
  );
}
  // Load course and its complete lesson structure.
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
      .eq("slug", slug)
      .eq("published", true)
      .single();

  if (courseError || !course) {
    notFound();
  }

  // Require active enrollment.
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", course.id)
   .in("status", ["active", "completed"])
.maybeSingle();

  if (!enrollment) {
    redirect(`/learn/${course.slug}`);
  }

  // Load current lesson.
  const { data: lesson, error: lessonError } =
    await supabase
      .from("lessons")
      .select(`
        id,
        title,
        kind,
        content,
        published,
        modules!inner (
          id,
          title,
          position,
          course_id
        )
      `)
      .eq("id", lessonId)
      .eq("published", true)
      .eq("modules.course_id", course.id)
      .single();

  if (lessonError || !lesson) {
    notFound();
  }

  // Create one ordered lesson sequence across all modules.
  const orderedLessons: CourseLesson[] =
    (course.modules ?? [])
      .sort((a, b) => a.position - b.position)
      .flatMap((module) =>
        (module.lessons ?? [])
          .filter((item) => item.published)
          .sort((a, b) => a.position - b.position)
          .map((item) => ({
            id: item.id,
            title: item.title,
            position: item.position,
            modulePosition: module.position,
          }))
      );

  const currentIndex = orderedLessons.findIndex(
    (item) => item.id === lesson.id
  );

  if (currentIndex === -1) {
    notFound();
  }

  const previousLesson =
    currentIndex > 0
      ? orderedLessons[currentIndex - 1]
      : null;

  const nextLesson =
    currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

  // Load all learner completion records for this course.
  const lessonIds = orderedLessons.map(
    (item) => item.id
  );

  const { data: progressRecords } =
    lessonIds.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", userId)
          .in("lesson_id", lessonIds)
          .eq("completed", true)
      : { data: [] };

  const completedLessonIds = new Set(
    progressRecords?.map(
      (item) => item.lesson_id
    ) ?? []
  );

  const completed =
    completedLessonIds.has(lesson.id);

   // Require learners to complete all previous lessons
// before accessing a later lesson.
const previousLessonIds = orderedLessons
  .slice(0, currentIndex)
  .map((item) => item.id);

const previousLessonsCompleted =
  previousLessonIds.every((id) =>
    completedLessonIds.has(id)
  );

if (!previousLessonsCompleted) {
  const firstIncompletePreviousLesson =
    orderedLessons
      .slice(0, currentIndex)
      .find(
        (item) =>
          !completedLessonIds.has(item.id)
      );

  if (firstIncompletePreviousLesson) {
    redirect(
      `/learn/${course.slug}/lesson/${firstIncompletePreviousLesson.id}`
    );
  }

  redirect(`/learn/${course.slug}`);
} 

  const totalLessons = orderedLessons.length;
  const completedLessons =
    completedLessonIds.size;

  const courseProgress =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) * 100
        );

   const moduleData = Array.isArray(lesson.modules)
    ? lesson.modules[0]
    : lesson.modules;
const currentModuleIndex =
  (course.modules ?? [])
    .sort((a, b) => a.position - b.position)
    .findIndex(
      (module) => module.id === moduleData?.id
    );

const moduleNumber =
  currentModuleIndex >= 0
    ? currentModuleIndex + 1
    : null;
  // Load the published assessment attached to this lesson.
  const {
    data: assessment,
    error: assessmentError,
  } = await getPublishedAssessmentForLesson(
    supabase,
    lesson.id
  );

  if (assessmentError) {
    console.error(
      "Unable to load lesson assessment:",
      assessmentError
    );
  }

  let assessmentAttempts: {
    id: string;
    assessment_id: string;
    score: number | null;
    passed: boolean | null;
    completed_at: string | null;
  }[] = [];

  if (assessment) {
    const {
      data: attempts,
      error: attemptsError,
    } = await getLearnerAssessmentAttempts(
      supabase,
      assessment.id,
      userId
    );

    if (attemptsError) {
      console.error(
        "Unable to load assessment attempts:",
        attemptsError
      );
    } else {
      assessmentAttempts = attempts ?? [];
    }
  }

    const assessmentAttemptCount =
    assessmentAttempts.length;

  const latestAssessmentAttempt =
    assessmentAttempts[0] ?? null;

  const assessmentPassed =
    !assessment ||
    assessmentAttempts.some(
      (attempt) => attempt.passed === true
    );

  const assessmentAttemptsRemaining =
    assessment?.max_attempts == null
      ? null
      : Math.max(
          assessment.max_attempts -
            assessmentAttemptCount,
          0
        );

  let assessmentQuestions: {
    id: string;
    assessment_id: string;
    question_text: string;
    position: number;
    options: unknown;
    points: number;
  }[] = [];

  if (assessment) {
    const {
      data: questions,
      error: questionsError,
    } =
      await getPublishedAssessmentQuestions(
        supabase,
        assessment.id
      );

    if (questionsError) {
      console.error(
        "Unable to load assessment questions:",
        questionsError
      );
    } else {
      assessmentQuestions = questions ?? [];
    }
  }

  const questionIds =
    assessmentQuestions.map(
      (question) => question.id
    );

  const submitAssessmentAction =
    assessment
      ? submitAssessment.bind(
          null,
          assessment.id,
          course.slug,
          lesson.id,
          questionIds
        )
      : null;

  return (
    <LearnerPortalShell
      firstName={
        profile?.first_name || "Learner"
      }
      role={profile?.role ?? null}
    >
      <section className={styles.lessonWorkspace}>
        <div className={styles.courseBreadcrumb}>
          <Link href="/learn">
            My Learning
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <Link href={`/learn/${course.slug}`}>
            {course.title}
          </Link>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <span>{lesson.title}</span>
        </div>

        <header className={styles.lessonHero}>
          <div className={styles.lessonHeroCopy}>
            <span className={styles.courseMeta}>
              {moduleNumber
                ? `MODULE ${moduleNumber}`
                : "NOVA LEARNING"}
            </span>

            <h1>{lesson.title}</h1>

            <p>
              {moduleData?.title ??
                "NOVA Learning"}
            </p>

            <div className={styles.lessonMetaRow}>
              <span>
                <BookOpen
                  size={16}
                  aria-hidden="true"
                />

                Lesson {currentIndex + 1} of{" "}
                {totalLessons}
              </span>

              <span>
                {completed ? (
                  <>
                    <CheckCircle2
                      size={16}
                      aria-hidden="true"
                    />
                    Completed
                  </>
                ) : (
                  <>
                    <BookOpen
                      size={16}
                      aria-hidden="true"
                    />
                    In progress
                  </>
                )}
              </span>

              {assessment && (
                <span>
                  <ClipboardCheck
                    size={16}
                    aria-hidden="true"
                  />
                  Assessment required
                </span>
              )}
            </div>
          </div>

          <aside
            className={styles.lessonProgressCard}
          >
            <div
              className={styles.courseProgressTop}
            >
              <span>Course progress</span>
              <strong>{courseProgress}%</strong>
            </div>

            <div
              className={styles.courseProgressTrack}
              aria-label={`${courseProgress}% course progress`}
            >
              <span
                style={{
                  width: `${courseProgress}%`,
                }}
              />
            </div>

            <p>
              {completedLessons} of {totalLessons}{" "}
              lessons completed
            </p>

            <Link
              href={`/learn/${course.slug}`}
              className={styles.lessonCourseLink}
            >
              Course overview
              <ChevronRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </aside>
        </header>

        <div className={styles.lessonLayout}>
          <main className={styles.lessonMainColumn}>
            <article
              className={styles.lessonContentCard}
            >
              <div
                className={
                  styles.lessonContentHeader
                }
              >
                <div>
                  <span className={styles.courseMeta}>
                    {String(
                      lesson.kind || "lesson"
                    ).toUpperCase()}
                  </span>

                  <h2>Lesson Content</h2>
                </div>

                {completed && (
                  <span
                    className={
                      styles.lessonCompleteBadge
                    }
                  >
                    <CheckCircle2
                      size={16}
                      aria-hidden="true"
                    />
                    Completed
                  </span>
                )}
              </div>

              <div
                className={styles.lessonContentBody}
              >
                <LessonContent
                  content={lesson.content}
                />
              </div>
            </article>

            {assessment && (
              <section
                className={styles.assessmentPanel}
              >
                <div
                  className={
                    styles.assessmentHeading
                  }
                >
                  <div
                    className={
                      styles.assessmentIcon
                    }
                  >
                    <ClipboardCheck
                      size={22}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <span
                      className={styles.courseMeta}
                    >
                      ASSESSMENT
                    </span>

                    <h2>{assessment.title}</h2>

                    {assessment.description && (
                      <p>
                        {assessment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={styles.assessmentStats}
                >
                  <div>
                    <strong>
                      {assessment.passing_score}%
                    </strong>
                    <span>Passing score</span>
                  </div>

                  <div>
                    <strong>
                      {assessmentAttemptCount}
                    </strong>
                    <span>
                      {assessmentAttemptCount === 1
                        ? "Attempt made"
                        : "Attempts made"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      {assessmentAttemptsRemaining ===
                      null
                        ? "∞"
                        : assessmentAttemptsRemaining}
                    </strong>
                    <span>
                      Attempts remaining
                    </span>
                  </div>
                </div>

                {latestAssessmentAttempt && (
                  <div
                    className={
                      latestAssessmentAttempt.passed
                        ? styles.assessmentResultPassed
                        : styles.assessmentResultPending
                    }
                  >
                    <strong>
                      Latest score:{" "}
                      {
                        latestAssessmentAttempt.score
                      }
                      %
                    </strong>

                    <span>
                      {latestAssessmentAttempt.passed
                        ? "Assessment passed"
                        : "Passing score not yet reached"}
                    </span>
                  </div>
                )}

                <div
                  className={styles.assessmentBody}
                >
                  {assessmentPassed ? (
                    <div
                      className={
                        styles.assessmentSuccess
                      }
                    >
                      <CheckCircle2
                        size={24}
                        aria-hidden="true"
                      />

                      <div>
                        <strong>
                          Assessment Passed
                        </strong>

                        <p>
                          You have successfully
                          completed this assessment.
                        </p>
                      </div>
                    </div>
                  ) : assessmentAttemptsRemaining ===
                    0 ? (
                    <div
                      className={
                        styles.assessmentNotice
                      }
                    >
                      <strong>
                        No attempts remaining
                      </strong>

                      <p>
                        You have used all available
                        attempts for this assessment.
                      </p>
                    </div>
                  ) : assessmentQuestions.length ===
                    0 ? (
                    <div
                      className={
                        styles.assessmentNotice
                      }
                    >
                      <strong>
                        Assessment unavailable
                      </strong>

                      <p>
                        No assessment questions are
                        currently available.
                      </p>
                    </div>
                  ) : submitAssessmentAction ? (
                    <form
                      action={
                        submitAssessmentAction
                      }
                    >
                      <div
                        className={
                          styles.assessmentQuestions
                        }
                      >
                        {assessmentQuestions.map(
                          (question, index) => {
                            const options =
                              Array.isArray(
                                question.options
                              )
                                ? question.options.filter(
                                    (
                                      option
                                    ): option is string =>
                                      typeof option ===
                                      "string"
                                  )
                                : [];

                            return (
                              <fieldset
                                key={question.id}
                                className={
                                  styles.assessmentQuestion
                                }
                              >
                                <legend>
                                  Question{" "}
                                  {index + 1}
                                </legend>

                                <p>
                                  {
                                    question.question_text
                                  }
                                </p>

                                <div
                                  className={
                                    styles.assessmentOptions
                                  }
                                >
                                  {options.map(
                                    (option) => (
                                      <label
                                        key={option}
                                        className={
                                          styles.assessmentOption
                                        }
                                      >
                                        <input
                                          type="radio"
                                          name={`question_${question.id}`}
                                          value={
                                            option
                                          }
                                          required
                                        />

                                        <span>
                                          {option}
                                        </span>
                                      </label>
                                    )
                                  )}
                                </div>
                              </fieldset>
                            );
                          }
                        )}

                        <button
                          type="submit"
                          className={
                            styles.primaryButton
                          }
                        >
                          <ClipboardCheck
                            size={17}
                            aria-hidden="true"
                          />
                          Submit Assessment
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </section>
            )}

            <section
              className={styles.lessonCompletionPanel}
            >
              <div>
                <span className={styles.courseMeta}>
                  LESSON PROGRESS
                </span>

                <h2>
                  {completed
                    ? "Lesson completed"
                    : assessment &&
                        !assessmentPassed
                      ? "Complete the assessment first"
                      : "Ready to complete this lesson?"}
                </h2>

                <p>
                  {completed
                    ? "Your progress has been saved."
                    : assessment &&
                        !assessmentPassed
                      ? "You must pass the assessment before this lesson can be marked complete."
                      : "Mark this lesson complete when you are ready to continue."}
                </p>
              </div>

              <CompleteLessonButton
                lessonId={lesson.id}
                courseSlug={course.slug}
                completed={completed}
                initialCourseCompleted={
                  enrollment.status === "completed"
                }
                nextLessonId={
                  nextLesson?.id ?? null
                }
                canComplete={
                  assessmentPassed
                }
              />
            </section>

                       <nav
              className={styles.lessonNavigation}
              aria-label="Lesson navigation"
            >
              {previousLesson && (
                <Link
                  href={`/learn/${course.slug}/lesson/${previousLesson.id}`}
                  className={
                    styles.lessonNavigationCard
                  }
                >
                  <ArrowLeft
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    <small>
                      Previous lesson
                    </small>
                    <strong>
                      {previousLesson.title}
                    </strong>
                  </span>
                </Link>
              )}

              {nextLesson ? (
                <Link
                  href={`/learn/${course.slug}/lesson/${nextLesson.id}`}
                  className={`${styles.lessonNavigationCard} ${styles.lessonNavigationNext}`}
                >
                  <span>
                    <small>Next lesson</small>
                    <strong>
                      {nextLesson.title}
                    </strong>
                  </span>

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              ) : !completed ? (
                <Link
                  href={`/learn/${course.slug}`}
                  className={`${styles.lessonNavigationCard} ${styles.lessonNavigationNext}`}
                >
                  <span>
                    <small>
                      Course overview
                    </small>
                    <strong>
                      Return to course
                    </strong>
                  </span>

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              ) : null}
            </nav>
          </main>
        </div>
      </section>
    </LearnerPortalShell>
  );
}
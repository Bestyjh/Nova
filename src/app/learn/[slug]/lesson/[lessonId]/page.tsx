import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import PortalHeader from "../../../../portal-header";
import { createClient } from "@/lib/supabase/server";
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
    <div className="learnPage">
      <PortalHeader />

      <section className="catalogHero">
        <div className="wrap">
          <div>
            <span
              className="courseMeta"
              style={{ color: "#bce5c3" }}
            >
              {course.title}
            </span>

            <h1>{lesson.title}</h1>

            <p>
              {moduleData?.title ?? "NOVA Learning"}
            </p>
          </div>

          <div className="statCard">
            <strong>{courseProgress}%</strong>

            <span>
              {completedLessons} of {totalLessons} lessons
              completed
            </span>
          </div>
        </div>
      </section>

      <section className="catalog">
        <div className="wrap">
          <div className="catalogTop">
            <div>
              <span className="courseMeta">
                Lesson {currentIndex + 1} of{" "}
                {totalLessons}
              </span>

              <h2>{lesson.title}</h2>
            </div>

            <Link
              href={`/learn/${course.slug}`}
              className="button compact"
            >
              Course Overview
            </Link>
          </div>

          <article className="courseCard">
            <div className="courseBody">
              <span className="courseMeta">
                {lesson.kind}
              </span>

              {completed && (
                <p>
                  <CheckCircle2
                    size={18}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "8px",
                    }}
                  />

                  <strong>
                    Lesson completed
                  </strong>
                </p>
              )}

     <h3>Lesson Content</h3>

<LessonContent content={lesson.content} />

<CompleteLessonButton
  lessonId={lesson.id}
  courseSlug={course.slug}
  completed={completed}
  nextLessonId={nextLesson?.id ?? null}
  canComplete={assessmentPassed}
/>
            </div>
          </article>

            {assessment && (
              <section
                className="learningPanel"
                style={{ marginTop: "24px" }}
              >
                <span className="courseMeta">
                  ASSESSMENT
                </span>

                <h2>{assessment.title}</h2>

                {assessment.description && (
                  <p>{assessment.description}</p>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginTop: "20px",
                  }}
                >
                  <div className="statCard">
                    <strong>
                      {assessment.passing_score}%
                    </strong>
                    <span>Passing Score</span>
                  </div>

                  <div className="statCard">
                    <strong>
                      {assessmentAttemptCount}
                    </strong>
                    <span>
                      {assessmentAttemptCount === 1
                        ? "Attempt"
                        : "Attempts"}
                    </span>
                  </div>

                  <div className="statCard">
                    <strong>
                      {assessmentAttemptsRemaining === null
                        ? "Unlimited"
                        : assessmentAttemptsRemaining}
                    </strong>
                    <span>Attempts Remaining</span>
                  </div>
                </div>

                {latestAssessmentAttempt && (
                  <div style={{ marginTop: "20px" }}>
                    <p>
                      <strong>Latest Score:</strong>{" "}
                      {latestAssessmentAttempt.score}%
                    </p>

                    <p>
                      <strong>Result:</strong>{" "}
                      {latestAssessmentAttempt.passed
                        ? "Passed"
                        : "Not Passed"}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: "20px" }}>
                {assessmentPassed ? (
  <div>
    <p>
      <strong>✓ Assessment Passed</strong>
    </p>

    <p>
      You have successfully completed this
      assessment.
    </p>
  </div>
) : assessmentAttemptsRemaining === 0 ? (
  <p>
    You have used all available attempts for
    this assessment.
  </p>
) : assessmentQuestions.length === 0 ? (
  <p>
    No assessment questions are currently
    available.
  </p>
) : submitAssessmentAction ? (
  <form action={submitAssessmentAction}>
    <div
      style={{
        display: "grid",
        gap: "24px",
      }}
    >
      {assessmentQuestions.map(
        (question, index) => {
          const options = Array.isArray(
            question.options
          )
            ? question.options.filter(
                (
                  option
                ): option is string =>
                  typeof option === "string"
              )
            : [];

          return (
            <fieldset
              key={question.id}
              style={{
                border: "1px solid #e2e8e5",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <legend>
                <strong>
                  Question {index + 1}
                </strong>
              </legend>

              <p>
                {question.question_text}
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                {options.map((option) => (
                  <label
                    key={option}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="radio"
                      name={`question_${question.id}`}
                      value={option}
                      required
                    />

                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }
      )}

      <button
        type="submit"
        className="button"
      >
        Submit Assessment
      </button>
    </div>
  </form>
) : null}
                </div>
              </section>
            )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "stretch",
              gap: "20px",
              marginTop: "32px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 280px" }}>
              {previousLesson ? (
                <Link
                  href={`/learn/${course.slug}/lesson/${previousLesson.id}`}
                  className="courseCard"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                  }}
                >
                  <div className="courseBody">
                    <span className="courseMeta">
                      <ArrowLeft
                        size={16}
                        style={{
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Previous Lesson
                    </span>

                    <h3>
                      {previousLesson.title}
                    </h3>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/learn/${course.slug}`}
                  className="courseCard"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                  }}
                >
                  <div className="courseBody">
                    <span className="courseMeta">
                      <ArrowLeft
                        size={16}
                        style={{
                          verticalAlign: "middle",
                        }}
                      />{" "}
                      Course Overview
                    </span>

                    <h3>
                      Back to course
                    </h3>
                  </div>
                </Link>
              )}
            </div>

            <div style={{ flex: "1 1 280px" }}>
              {nextLesson ? (
                <Link
                  href={`/learn/${course.slug}/lesson/${nextLesson.id}`}
                  className="courseCard"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                  }}
                >
                  <div className="courseBody">
                    <span className="courseMeta">
                      Next Lesson{" "}
                      <ArrowRight
                        size={16}
                        style={{
                          verticalAlign: "middle",
                        }}
                      />
                    </span>

                    <h3>
                      {nextLesson.title}
                    </h3>
                  </div>
                </Link>
              ) : (
                <Link
                  href={`/learn/${course.slug}`}
                  className="courseCard"
                  style={{
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                  }}
                >
                  <div className="courseBody">
                    <span className="courseMeta">
                      Course Complete
                    </span>

                    <h3>
                      Return to Course{" "}
                      <ArrowRight
                        size={18}
                        style={{
                          verticalAlign: "middle",
                        }}
                      />
                    </h3>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import PortalHeader from "../../../../portal-header";
import { createClient } from "@/lib/supabase/server";
import { getCompletedLessonIdsForLessons } from "@/lib/data/progress";
import CompleteLessonButton from "./complete-lesson-button";

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
    await getCompletedLessonIdsForLessons(
      supabase,
      userId,
      lessonIds
    );

  const completedLessonIds = new Set(
    progressRecords?.map(
      (item) => item.lesson_id
    ) ?? []
  );

  const completed =
    completedLessonIds.has(lesson.id);

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

{lesson.content ? (
  <div
    style={{
      whiteSpace: "pre-wrap",
      lineHeight: 1.7,
    }}
  >
    {typeof lesson.content === "string"
      ? lesson.content.replace(/<br\s*\/?>/gi, "\n")
      : JSON.stringify(lesson.content)}
  </div>
) : (
  <p>No lesson content has been added yet.</p>
)}

<CompleteLessonButton
  lessonId={lesson.id}
  courseSlug={course.slug}
  completed={completed}
  nextLessonId={nextLesson?.id ?? null}

/>
            </div>
          </article>

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
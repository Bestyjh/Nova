import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Circle,
} from "lucide-react";

import PortalHeader from "../../portal-header";
import { createClient } from "@/lib/supabase/server";
import { getPublishedCourseBySlug } from "@/lib/data/courses";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  const { data: course, error } =
    await getPublishedCourseBySlug(supabase, slug);

  if (error || !course) {
    notFound();
  }

  let completedLessonIds = new Set<string>();

  if (userId) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("completed", true);

    completedLessonIds = new Set(
      progress?.map((item) => item.lesson_id) ?? []
    );
  }

  const modules = [...(course.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((module) => ({
      ...module,

      lessons: [...(module.lessons ?? [])].sort(
        (a, b) => a.position - b.position
      ),
    }));

  const totalLessons = modules.reduce(
    (total, module) =>
      total + module.lessons.length,
    0
  );

  const completedLessons = modules.reduce(
    (total, module) =>
      total +
      module.lessons.filter((lesson) =>
        completedLessonIds.has(lesson.id)
      ).length,
    0
  );

  const progress =
    totalLessons === 0
      ? 0
      : Math.round(
          (completedLessons / totalLessons) * 100
        );

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
              NOVA Learning
            </span>

            <h1>{course.title}</h1>

            <p>{course.summary}</p>
          </div>

          <div className="statCard">
  <strong>{progress}%</strong>

  <span>
    {progress === 100
      ? "Course completed"
      : "Course progress"}
  </span>

  {progress === 100 && userId && (
    <Link
      href={`/learn/${course.slug}/completion`}
      className="button compact"
      style={{ marginTop: "16px" }}
    >
      View Completion
    </Link>
  )}
</div>
        </div>
      </section>

      <section className="catalog">
        <div className="wrap">
          <div className="catalogTop">
            <div>
              <span className="courseMeta">
                Course Content
              </span>

              <h2>Modules & Lessons</h2>
            </div>

            {userId && (
              <Link
                href="/dashboard"
                className="button compact"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="courseGrid">
            {modules.map((module) => (
              <article
                className="courseCard"
                key={module.id}
              >
                <div className="courseVisual">
                  <BookOpen />
                </div>

                <div className="courseBody">
                  <span className="courseMeta">
                    Module {module.position}
                  </span>

                  <h3>{module.title}</h3>

                  <div className="lessonList">
                    {module.lessons.map((lesson) => {
                      const completed =
                        completedLessonIds.has(
                          lesson.id
                        );

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${course.slug}/lesson/${lesson.id}`}
                          className="lessonRow"
                        >
                          {completed ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <Circle size={20} />
                          )}

                          <span>{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
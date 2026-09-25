import AdminSidebar from "../../admin-sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  FileText,
  Layers3,
  Plus,
} from "lucide-react";

import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminCoursePage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  // Load course curriculum.
  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        summary,
        published,
        modules (
          id,
          title,
          position,
          lessons (
            id,
            title,
            position,
            kind,
            published
          )
        )
      `)
      .eq("id", id)
      .single();

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

  const totalLessons = modules.reduce(
    (total, module) =>
      total + module.lessons.length,
    0
  );

  const publishedLessons = modules.reduce(
    (total, module) =>
      total +
      module.lessons.filter(
        (lesson) => lesson.published
      ).length,
    0
  );

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
      <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href="/admin/courses"
                className="courseMeta"
              >
                <ArrowLeft
                  size={16}
                  style={{
                    verticalAlign: "middle",
                  }}
                />{" "}
                All Courses
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>{course.title}</h1>

              <p>{course.summary}</p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <Layers3 size={24} />

              <strong>{modules.length}</strong>

              <span>Modules</span>
            </div>

            <div className="statCard">
              <FileText size={24} />

              <strong>{totalLessons}</strong>

              <span>Lessons</span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />

              <strong>
                {publishedLessons}
              </strong>

              <span>Published lessons</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />

              <strong>
                {course.published
                  ? "Published"
                  : "Draft"}
              </strong>

              <span>Course status</span>
            </div>
          </div>

          <section className="learningPanel">
            <div className="catalogTop">
              <div>
                <span className="courseMeta">
                  COURSE DETAILS
                </span>

                <h2>Course Information</h2>
              </div>

              <Link
  href={`/admin/courses/${course.id}/edit`}
  className="button compact"
>
  Edit Course
</Link>
            </div>

            <div
              style={{
                display: "grid",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              <div>
                <strong>Title</strong>
                <p>{course.title}</p>
              </div>

              <div>
                <strong>Slug</strong>
                <p>{course.slug}</p>
              </div>

              <div>
                <strong>Summary</strong>
                <p>
                  {course.summary ||
                    "No summary provided."}
                </p>
              </div>

              <div>
                <strong>Status</strong>
                <p>
                  {course.published
                    ? "Published"
                    : "Draft"}
                </p>
              </div>
            </div>
          </section>

                   <section
            className="learningPanel"
            style={{ marginTop: "24px" }}
          >
            <div className="catalogTop">
              <div>
                <span className="courseMeta">
                  CURRICULUM
                </span>

                <h2>Modules & Lessons</h2>
              </div>

              <Link
                href={`/admin/courses/${course.id}/modules/new`}
                className="button compact"
              >
                <Plus
                  size={16}
                  style={{
                    verticalAlign: "middle",
                  }}
                />{" "}
                Add Module
              </Link>
            </div>

            {modules.length === 0 ? (
              <div
                className="emptyLearning"
                style={{ marginTop: "24px" }}
              >
                <h3>No modules yet</h3>

                <p>
                  Add the first module to begin
                  building this course.
                </p>
              </div>
            ) : (
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
                      <div className="catalogTop">
                        <div>
                          <span className="courseMeta">
                            MODULE {module.position}
                          </span>

                          <h3>{module.title}</h3>
                        </div>

                        <Link
                          href={`/admin/courses/${course.id}/modules/${module.id}/edit`}
                          className="courseMeta"
                        >
                          Edit Module
                        </Link>
                      </div>

                      <div
                        className="lessonList"
                        style={{
                          marginTop: "20px",
                        }}
                      >
                        {module.lessons.length === 0 ? (
                          <p>
                            No lessons in this module yet.
                          </p>
                        ) : (
                          module.lessons.map((lesson) => (
                            <div
                              className="lessonRow"
                              key={lesson.id}
                            >
                              {lesson.published ? (
                                <CheckCircle2 size={20} />
                              ) : (
                                <Circle size={20} />
                              )}

                              <div
                                style={{
                                  flex: 1,
                                }}
                              >
                                <strong>
                                  {lesson.title}
                                </strong>

                                <div className="courseMeta">
                                  {lesson.kind} Â·{" "}
                                  {lesson.published
                                    ? "Published"
                                    : "Draft"}
                                </div>
                              </div>

                              <Link
                                href={`/admin/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}/edit`}
                                className="courseMeta"
                              >
                                Edit Lesson
                              </Link>
                            </div>
                          ))
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "20px",
                        }}
                      >
                      <Link
  href={`/admin/courses/${course.id}/modules/${module.id}/lessons/new`}
  className="button compact"
>
  <Plus
    size={16}
    style={{
      verticalAlign: "middle",
    }}
  />{" "}
  Add Lesson
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


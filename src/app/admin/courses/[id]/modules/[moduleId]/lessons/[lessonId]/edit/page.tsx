import AdminSidebar from "../../../../../../../admin-sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import {
  deleteLesson,
  updateLesson,
} from "../../../../../lesson-actions";

type PageProps = {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
};

export default async function EditLessonPage({
  params,
}: PageProps) {
  const { id, moduleId, lessonId } = await params;

  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!course) {
    notFound();
  }

  const { data: moduleRecord } = await supabase
    .from("modules")
    .select("id, title")
    .eq("id", moduleId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!moduleRecord) {
    notFound();
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      kind,
      content,
      position,
      published
    `)
    .eq("id", lessonId)
    .eq("module_id", moduleRecord.id)
    .maybeSingle();

  if (!lesson) {
    notFound();
  }
const contentText =
  typeof lesson.content === "string"
    ? lesson.content.replace(/<br\s*\/?>/gi, "\n\n")
    : lesson.content &&
        typeof lesson.content === "object" &&
        !Array.isArray(lesson.content) &&
        "blocks" in lesson.content &&
        Array.isArray(
          (lesson.content as {
            blocks?: unknown[];
          }).blocks
        )
      ? (
          lesson.content as {
            blocks: Array<{
              type?: string;
              text?: string;
            }>;
          }
        ).blocks
          .filter(
            (block) =>
              block.type === "paragraph" &&
              block.text
          )
          .map((block) => block.text)
          .join("\n\n")
      : "";
  const updateLessonAction =
    updateLesson.bind(
      null,
      course.id,
      moduleRecord.id,
      lesson.id
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
                href={`/admin/courses/${course.id}`}
                className="courseMeta"
              >
                ← Back to Course
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Edit Lesson</h1>

              <p>
                {moduleRecord.title} · {course.title}
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <form action={updateLessonAction}>
              <div
                style={{
                  display: "grid",
                  gap: "22px",
                }}
              >
                <div>
                  <label htmlFor="title">
                    <strong>Lesson title</strong>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={lesson.title}
                    className="authInput"
                  />
                </div>

                <div>
                  <label htmlFor="kind">
                    <strong>Lesson type</strong>
                  </label>

                  <select
                    id="kind"
                    name="kind"
                    defaultValue={lesson.kind}
                    className="authInput"
                  >
                    <option value="article">
                      Article
                    </option>

                    <option value="resource">
                      Resource
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="content">
                    <strong>Lesson content</strong>
                  </label>

                  <textarea
                    id="content"
                    name="content"
                    rows={14}
                    defaultValue={contentText}
                    className="authInput"
                    placeholder="Enter NOVA-approved lesson content..."
                  />
                </div>

                <div>
                  <label htmlFor="position">
                    <strong>Position</strong>
                  </label>

                  <input
                    id="position"
                    name="position"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={lesson.position}
                    className="authInput"
                  />
                </div>

                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={lesson.published}
                  />

                  <strong>Published</strong>
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="submit"
                    className="button"
                  >
                    Save Lesson
                  </button>

                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="button compact"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
<div
  style={{
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #ddd",
  }}
>
  <h3>Delete Lesson</h3>

  <p>
    Permanently delete this lesson from the course.
    Any learner progress associated with this lesson
    will also be removed.
  </p>

  <form
    action={deleteLesson.bind(
      null,
      course.id,
      moduleRecord.id,
      lesson.id
    )}
  >
    <button
      type="submit"
      className="button"
    >
      Delete Lesson
    </button>
  </form>
</div>
          </section>
        </section>
      </main>
    </div>
  );
}

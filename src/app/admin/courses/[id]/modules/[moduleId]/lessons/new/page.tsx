import AdminSidebar from "../../../../../../admin-sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";

import PortalHeader from "@/app/portal-header";
import { createLesson } from "../../../../lesson-actions";
import { requireAdmin } from "@/lib/auth/require-admin";

type PageProps = {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
};

export default async function NewLessonPage({
  params,
}: PageProps) {
  const { id, moduleId } = await params;

  const { supabase } = await requireAdmin();

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

  const createLessonAction =
    createLesson.bind(
      null,
      course.id,
      moduleRecord.id
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
                â† Back to Course
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Add Lesson</h1>

              <p>
                {moduleRecord.title} Â· {course.title}
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <form action={createLessonAction}>
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
                    className="authInput"
                    placeholder="Enter lesson title"
                  />
                </div>

                <div>
                  <label htmlFor="kind">
                    <strong>Lesson type</strong>
                  </label>

                  <select
                    id="kind"
                    name="kind"
                    defaultValue="article"
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
                    className="authInput"
                    placeholder="Enter NOVA-approved lesson content..."
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
                  />

                  <strong>Published</strong>
                </label>

                <p>
                  The lesson will automatically be
                  placed after the existing lessons
                  in this module.
                </p>

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
                    Add Lesson
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
          </section>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";

import AdminSidebar from "../../admin-sidebar";
import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAssessment } from "../actions";

export default async function NewAssessmentPage() {
  const { supabase } = await requireAdmin();

  const { data: lessons, error } =
    await supabase
      .from("lessons")
      .select(`
        id,
        title,
        position,
        modules (
          id,
          title,
          course_id,
          courses (
            id,
            title
          )
        )
      `)
      .order("title", {
        ascending: true,
      });

  if (error) {
    console.error(
      "Unable to load lessons:",
      error
    );
  }

  const lessonList = lessons ?? [];

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA ADMINISTRATION
              </p>

              <h1>Add Assessment</h1>

              <p>
                Create a quiz and attach it to
                an existing NOVA lesson.
              </p>
            </div>

            <Link
              href="/admin/assessments"
              className="button compact"
            >
              Back to Assessments
            </Link>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              ASSESSMENT DETAILS
            </p>

            <h2>New Assessment</h2>

            {lessonList.length === 0 ? (
              <div>
                <p>
                  No lessons are available.
                  Create a lesson before adding
                  an assessment.
                </p>

                <Link
                  href="/admin/courses"
                  className="button"
                >
                  Go to Courses
                </Link>
              </div>
            ) : (
              <form
                action={createAssessment}
                className="formGrid"
              >
                <div className="field">
                  <label htmlFor="lesson_id">
                    Lesson
                  </label>

                  <select
                    id="lesson_id"
                    name="lesson_id"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a lesson
                    </option>

                    {lessonList.map((lesson) => {
                      const moduleRecord =
                        Array.isArray(
                          lesson.modules
                        )
                          ? lesson.modules[0]
                          : null;

                      const courseRecord =
                        moduleRecord &&
                        Array.isArray(
                          moduleRecord.courses
                        )
                          ? moduleRecord
                              .courses[0]
                          : null;

                      const label = [
                        courseRecord?.title,
                        moduleRecord?.title,
                        lesson.title,
                      ]
                        .filter(Boolean)
                        .join(" → ");

                      return (
                        <option
                          key={lesson.id}
                          value={lesson.id}
                        >
                          {label ||
                            lesson.title}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="title">
                    Assessment Title
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Lesson Knowledge Check"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Explain what this assessment covers."
                  />
                </div>

                <div className="field">
                  <label htmlFor="passing_score">
                    Passing Score (%)
                  </label>

                  <input
                    id="passing_score"
                    name="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue="70"
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="max_attempts">
                    Maximum Attempts
                  </label>

                  <input
                    id="max_attempts"
                    name="max_attempts"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Leave blank for unlimited"
                  />

                  <small>
                    Leave blank to allow
                    unlimited attempts.
                  </small>
                </div>

                <label>
                  <input
                    type="checkbox"
                    name="published"
                  />{" "}
                  Publish this assessment
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
                    Create Assessment
                  </button>

                  <Link
                    href="/admin/assessments"
                    className="button compact"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
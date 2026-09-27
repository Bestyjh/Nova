import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../admin-sidebar";
import PortalHeader from "../../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminAssessmentById } from "@/lib/data/assessments";
import { updateAssessment } from "../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAssessmentPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  const { data: assessment, error } =
    await getAdminAssessmentById(
      supabase,
      id
    );

  if (error || !assessment) {
    notFound();
  }

  const { data: lessons, error: lessonsError } =
    await supabase
      .from("lessons")
      .select(`
        id,
        title,
        modules (
          id,
          title,
          courses (
            id,
            title
          )
        )
      `)
      .order("title", {
        ascending: true,
      });

  if (lessonsError) {
    console.error(
      "Unable to load lessons:",
      lessonsError
    );
  }

  const lessonList = lessons ?? [];

  const updateAssessmentAction =
    updateAssessment.bind(
      null,
      assessment.id
    );

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

              <h1>Edit Assessment</h1>

              <p>
                Update assessment settings and
                learner availability.
              </p>
            </div>

            <Link
              href={`/admin/assessments/${assessment.id}`}
              className="button compact"
            >
              Back to Assessment
            </Link>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              ASSESSMENT DETAILS
            </p>

            <h2>{assessment.title}</h2>

            <form
              action={updateAssessmentAction}
              className="formGrid"
            >
              <div className="field">
                <label htmlFor="lesson_id">
                  Lesson
                </label>

                <select
                  id="lesson_id"
                  name="lesson_id"
                  defaultValue={
                    assessment.lesson_id
                  }
                  required
                >
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
                        {label || lesson.title}
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
                  defaultValue={
                    assessment.title
                  }
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
                  defaultValue={
                    assessment.description ??
                    ""
                  }
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
                  defaultValue={
                    assessment.passing_score
                  }
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
                  defaultValue={
                    assessment.max_attempts ??
                    ""
                  }
                  placeholder="Leave blank for unlimited"
                />

                <small>
                  Leave blank for unlimited
                  attempts.
                </small>
              </div>

              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={
                    assessment.published
                  }
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
                  Save Changes
                </button>

                <Link
                  href={`/admin/assessments/${assessment.id}`}
                  className="button compact"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
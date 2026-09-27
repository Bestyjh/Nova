import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../../admin-sidebar";
import PortalHeader from "../../../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminAssessmentById } from "@/lib/data/assessments";
import { createAssessmentQuestion } from "../../../actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewQuestionPage({
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

  const createQuestionAction =
    createAssessmentQuestion.bind(
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

              <h1>Add Question</h1>

              <p>
                Add a multiple-choice question
                to {assessment.title}.
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
              QUESTION DETAILS
            </p>

            <h2>New Question</h2>

            <form
              action={createQuestionAction}
              className="formGrid"
            >
              <div className="field">
                <label htmlFor="question_text">
                  Question
                </label>

                <textarea
                  id="question_text"
                  name="question_text"
                  rows={4}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="option_a">
                  Option A
                </label>

                <input
                  id="option_a"
                  name="option_a"
                  type="text"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="option_b">
                  Option B
                </label>

                <input
                  id="option_b"
                  name="option_b"
                  type="text"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="option_c">
                  Option C
                </label>

                <input
                  id="option_c"
                  name="option_c"
                  type="text"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="option_d">
                  Option D
                </label>

                <input
                  id="option_d"
                  name="option_d"
                  type="text"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="correct_answer">
                  Correct Answer
                </label>

                <input
                  id="correct_answer"
                  name="correct_answer"
                  type="text"
                  placeholder="Enter the exact text of the correct option"
                  required
                />

                <small>
                  This must exactly match one
                  of the four options above.
                </small>
              </div>

              <div className="field">
                <label htmlFor="position">
                  Display Position
                </label>

                <input
                  id="position"
                  name="position"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue="0"
                />
              </div>

              <div className="field">
                <label htmlFor="points">
                  Points
                </label>

                <input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="1"
                  required
                />
              </div>

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
                  Add Question
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
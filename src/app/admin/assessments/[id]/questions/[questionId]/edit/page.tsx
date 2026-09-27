import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../../../admin-sidebar";
import PortalHeader from "../../../../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getAdminAssessmentById,
  getAssessmentQuestionById,
} from "@/lib/data/assessments";
import {
  deleteAssessmentQuestion,
  updateAssessmentQuestion,
} from "../../../../actions";

import DeleteQuestionButton from "./delete-question-button";

type PageProps = {
  params: Promise<{
    id: string;
    questionId: string;
  }>;
};

export default async function EditQuestionPage({
  params,
}: PageProps) {
  const { id, questionId } = await params;

  const { supabase } = await requireAdmin();

  const [
    assessmentResult,
    questionResult,
  ] = await Promise.all([
    getAdminAssessmentById(
      supabase,
      id
    ),
    getAssessmentQuestionById(
      supabase,
      questionId
    ),
  ]);

  const {
    data: assessment,
    error: assessmentError,
  } = assessmentResult;

  const {
    data: question,
    error: questionError,
  } = questionResult;

  if (
    assessmentError ||
    !assessment ||
    questionError ||
    !question ||
    question.assessment_id !== assessment.id
  ) {
    notFound();
  }

  const options = Array.isArray(
    question.options
  )
    ? question.options.map((option) =>
        String(option)
      )
    : [];

  const updateQuestionAction =
    updateAssessmentQuestion.bind(
      null,
      assessment.id,
      question.id
    );

const deleteQuestionAction =
  deleteAssessmentQuestion.bind(
    null,
    assessment.id,
    question.id
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

              <h1>Edit Question</h1>

              <p>
                Update this question for{" "}
                {assessment.title}.
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

            <h2>
              {question.question_text}
            </h2>

            <form
              action={updateQuestionAction}
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
                  defaultValue={
                    question.question_text
                  }
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
                  defaultValue={options[0] ?? ""}
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
                  defaultValue={options[1] ?? ""}
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
                  defaultValue={options[2] ?? ""}
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
                  defaultValue={options[3] ?? ""}
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
                  defaultValue={
                    question.correct_answer
                  }
                  required
                />

                <small>
                  This must exactly match one
                  of the four options.
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
                  defaultValue={
                    question.position
                  }
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
                  defaultValue={
                    question.points
                  }
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
            <div
  style={{
    marginTop: "40px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8e5",
  }}
>
  <h3>Delete Question</h3>

  <p>
    Permanently remove this question from the
    assessment. This action cannot be undone.
  </p>

  <div style={{ marginTop: "16px" }}>
    <DeleteQuestionButton
      action={deleteQuestionAction}
    />
  </div>
</div>
          </section>
        </section>
      </main>
    </div>
  );
}
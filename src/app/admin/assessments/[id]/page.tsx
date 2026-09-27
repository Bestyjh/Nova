import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../admin-sidebar";
import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getAdminAssessmentById,
  getAssessmentQuestions,
} from "@/lib/data/assessments";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  const [
    assessmentResult,
    questionsResult,
  ] = await Promise.all([
    getAdminAssessmentById(
      supabase,
      id
    ),
    getAssessmentQuestions(
      supabase,
      id
    ),
  ]);

  const {
    data: assessment,
    error: assessmentError,
  } = assessmentResult;

  if (assessmentError || !assessment) {
    notFound();
  }

  const {
    data: questions,
    error: questionsError,
  } = questionsResult;

  if (questionsError) {
    console.error(
      "Unable to load assessment questions:",
      questionsError
    );
  }

  const questionList = questions ?? [];

  const lessonTitle =
    Array.isArray(assessment.lessons)
      ? assessment.lessons[0]?.title
      : null;

  const totalPoints =
    questionList.reduce(
      (total, question) =>
        total + question.points,
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
              <p className="eyebrow">
                NOVA ADMINISTRATION
              </p>

              <h1>{assessment.title}</h1>

              <p>
                Manage this assessment and its
                questions.
              </p>
            </div>

<div
  style={{
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  }}
>
  <Link
    href={`/admin/assessments/${assessment.id}/edit`}
    className="button"
  >
    Edit Assessment
  </Link>

  <Link
    href="/admin/assessments"
    className="button compact"
  >
    Back to Assessments
  </Link>
</div>
</div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            <div className="statCard">
              <strong>
                {questionList.length}
              </strong>
              <span>Questions</span>
            </div>

            <div className="statCard">
              <strong>{totalPoints}</strong>
              <span>Total Points</span>
            </div>

            <div className="statCard">
              <strong>
                {assessment.passing_score}%
              </strong>
              <span>Passing Score</span>
            </div>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              ASSESSMENT DETAILS
            </p>

            <h2>Configuration</h2>

            <p>
              <strong>Lesson:</strong>{" "}
              {lessonTitle ?? "Unknown Lesson"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {assessment.published
                ? "Published"
                : "Draft"}
            </p>

            <p>
              <strong>Maximum Attempts:</strong>{" "}
              {assessment.max_attempts ??
                "Unlimited"}
            </p>

            {assessment.description && (
              <p>{assessment.description}</p>
            )}
          </section>

          <section
            className="learningPanel"
            style={{ marginTop: "24px" }}
          >
            <div className="dashboardHeading">
              <div>
                <p className="eyebrow">
                  QUESTIONS
                </p>

                <h2>Assessment Questions</h2>
              </div>

              <Link
                href={`/admin/assessments/${assessment.id}/questions/new`}
                className="button"
              >
                Add Question
              </Link>
            </div>

            {questionList.length === 0 ? (
              <div>
                <h3>No questions yet</h3>

                <p>
                  Add the first question before
                  publishing this assessment.
                </p>
              </div>
            ) : (
              <div className="courseGrid">
                {questionList.map(
                  (question, index) => (
                    <article
                      className="courseCard"
                      key={question.id}
                    >
                      <div className="courseBody">
                        <span className="courseMeta">
                          QUESTION {index + 1}
                        </span>

                        <h3>
                          {question.question_text}
                        </h3>

                        <p>
                          <strong>Points:</strong>{" "}
                          {question.points}
                        </p>

<p>
  <strong>
    Correct Answer:
  </strong>{" "}
  {question.correct_answer}
</p>

<Link
  href={`/admin/assessments/${assessment.id}/questions/${question.id}/edit`}
  className="button compact"
>
  Edit Question
</Link>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
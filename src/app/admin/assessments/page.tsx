import Link from "next/link";

import AdminSidebar from "../admin-sidebar";
import PortalHeader from "../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminAssessments } from "@/lib/data/assessments";

export default async function AdminAssessmentsPage() {
  const { supabase } = await requireAdmin();

  const { data: assessments, error } =
    await getAdminAssessments(supabase);

  if (error) {
    console.error(
      "Unable to load assessments:",
      error
    );
  }

  const assessmentList = assessments ?? [];

  const publishedCount =
    assessmentList.filter(
      (assessment) => assessment.published
    ).length;

  const draftCount =
    assessmentList.length - publishedCount;

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

              <h1>Assessments</h1>

              <p>
                Create and manage quizzes for
                NOVA learning lessons.
              </p>
            </div>

            <Link
              href="/admin/assessments/new"
              className="button"
            >
              Add Assessment
            </Link>
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
                {assessmentList.length}
              </strong>
              <span>Total Assessments</span>
            </div>

            <div className="statCard">
              <strong>
                {publishedCount}
              </strong>
              <span>Published</span>
            </div>

            <div className="statCard">
              <strong>{draftCount}</strong>
              <span>Drafts</span>
            </div>
          </div>

          {assessmentList.length === 0 ? (
            <section className="learningPanel">
              <h2>No assessments yet</h2>

              <p>
                Create the first NOVA assessment
                and attach it to a lesson.
              </p>

              <Link
                href="/admin/assessments/new"
                className="button"
              >
                Add Assessment
              </Link>
            </section>
          ) : (
            <div className="courseGrid">
              {assessmentList.map(
                (assessment) => {
                  const lessonTitle =
                    Array.isArray(
                      assessment.lessons
                    )
                      ? assessment.lessons[0]
                          ?.title
                      : null;

                  return (
                    <article
                      className="courseCard"
                      key={assessment.id}
                    >
                      <div className="courseBody">
                        <span className="courseMeta">
                          {assessment.published
                            ? "PUBLISHED"
                            : "DRAFT"}
                        </span>

                        <h3>
                          {assessment.title}
                        </h3>

                        <p>
                          {assessment.description ||
                            "No assessment description yet."}
                        </p>

                        <p>
                          <strong>Lesson:</strong>{" "}
                          {lessonTitle ??
                            "Unknown Lesson"}
                        </p>

                        <p>
                          <strong>
                            Passing Score:
                          </strong>{" "}
                          {assessment.passing_score}%
                        </p>

                        <p>
                          <strong>
                            Maximum Attempts:
                          </strong>{" "}
                          {assessment.max_attempts ??
                            "Unlimited"}
                        </p>

                        <Link
                          href={`/admin/assessments/${assessment.id}`}
                          className="button"
                        >
                          Manage Assessment
                        </Link>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
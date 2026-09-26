import AdminSidebar from "../admin-sidebar";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  UserRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function LearnersPage() {
  const { supabase } = await requireAdmin();

  // Load registered profiles.
  const { data: profiles, error: profilesError } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        role
      `)
      .order("first_name", {
        ascending: true,
      });

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  // Load enrollment records.
  const { data: enrollments, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        user_id,
        status,
        course_id
      `);

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const learnerProfiles =
    profiles?.filter(
      (profile) => profile.role !== "admin"
    ) ?? [];

  const activeEnrollments =
    enrollments?.filter(
      (enrollment) =>
        enrollment.status === "active"
    ).length ?? 0;

  const completedEnrollments =
    enrollments?.filter(
      (enrollment) =>
        enrollment.status === "completed"
    ).length ?? 0;

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

              <h1>Learners</h1>

              <p>
                View registered learner accounts
                and learning activity.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <UserRound size={24} />

              <strong>
                {learnerProfiles.length}
              </strong>

              <span>Registered learners</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />

              <strong>
                {activeEnrollments}
              </strong>

              <span>Active enrollments</span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />

              <strong>
                {completedEnrollments}
              </strong>

              <span>Completed enrollments</span>
            </div>
          </div>

          <section className="learningPanel">
            <div className="catalogTop">
              <div>
                <span className="courseMeta">
                  LEARNER MANAGEMENT
                </span>

                <h2>Registered Learners</h2>
              </div>
            </div>

            {learnerProfiles.length === 0 ? (
              <div
                className="emptyLearning"
                style={{
                  marginTop: "24px",
                }}
              >
                <h3>No learners yet</h3>

                <p>
                  Registered learner accounts
                  will appear here.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  marginTop: "24px",
                }}
              >
                {learnerProfiles.map(
                  (learner) => {
                    const learnerEnrollments =
                      enrollments?.filter(
                        (enrollment) =>
                          enrollment.user_id ===
                          learner.id
                      ) ?? [];

                    return (
                      <article
                        key={learner.id}
                        className="courseCard"
                      >
                        <div className="courseBody">
                          <div className="catalogTop">
                            <div>
                              <span className="courseMeta">
                                LEARNER
                              </span>

                              <h3>
                                {[
                                  learner.first_name,
                                  learner.last_name,
                                ]
                                  .filter(Boolean)
                                  .join(" ") ||
                                  "Unnamed Learner"}
                              </h3>

                              <p>
                                {
                                  learnerEnrollments.length
                                }{" "}
                                enrollment
                                {learnerEnrollments.length ===
                                1
                                  ? ""
                                  : "s"}
                              </p>
                            </div>

                            <Link
                              href={`/admin/learners/${learner.id}`}
                              className="button compact"
                            >
                              View Learner
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

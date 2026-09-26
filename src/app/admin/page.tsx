import AdminSidebar from "./admin-sidebar";
import Link from "next/link";

import {
  BookOpen,
  CircleCheck,
  GraduationCap,
  Users,
} from "lucide-react";

import PortalHeader from "../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getProfileSummary } from "@/lib/data/profiles";

export default async function AdminPage() {
  const { supabase, userId } = await requireAdmin();

  const { data: profile, error: profileError } =
    await getProfileSummary(supabase, userId);

  if (profileError || !profile) {
    throw new Error(
      profileError?.message ??
        "Unable to load administrator profile."
    );
  }
  // Load dashboard statistics.
  const [
    coursesResult,
    learnersResult,
    activeResult,
    completedResult,
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("profiles")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("role", "learner"),

    supabase
      .from("enrollments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "active"),

    supabase
      .from("enrollments")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "completed"),
  ]);

  const firstName =
    profile.first_name || "Administrator";

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

              <h1>
                Welcome, {firstName}
              </h1>

              <p>
                Manage NOVA Learning courses,
                learners and program activity.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <BookOpen size={24} />

              <strong>
                {coursesResult.count ?? 0}
              </strong>

              <span>Courses</span>
            </div>

            <div className="statCard">
              <Users size={24} />

              <strong>
                {learnersResult.count ?? 0}
              </strong>

              <span>Learners</span>
            </div>

            <div className="statCard">
              <GraduationCap size={24} />

              <strong>
                {activeResult.count ?? 0}
              </strong>

              <span>Active enrollments</span>
            </div>

            <div className="statCard">
              <CircleCheck size={24} />

              <strong>
                {completedResult.count ?? 0}
              </strong>

              <span>Completed enrollments</span>
            </div>
          </div>

          <section className="learningPanel">
            <span className="courseMeta">
              ADMINISTRATION
            </span>

            <h2>Learning Management</h2>

            <p>
              Manage NOVA's learning programs,
              curriculum, learners and completion
              activity.
            </p>

            <div
              className="courseGrid"
              style={{ marginTop: "24px" }}
            >
              <article className="courseCard">
                <div className="courseBody">
                  <BookOpen size={28} />

                  <h3>Courses</h3>

                  <p>
                    Manage courses, modules,
                    lessons and publishing.
                  </p>

                  <Link
                    href="/admin/courses"
                    className="button"
                  >
                    Manage Courses
                  </Link>
                </div>
              </article>

              <article className="courseCard">
                <div className="courseBody">
                  <Users size={28} />

                  <h3>Learners</h3>

                  <p>
                    View NOVA learner accounts
                    and learning activity.
                  </p>

                  <span className="courseMeta">
                   <Link
  href="/admin/learners"
  className="button compact"
>
  Manage Learners
</Link>
                  </span>
                </div>
              </article>

              <article className="courseCard">
                <div className="courseBody">
                  <GraduationCap size={28} />

                  <h3>Enrollments</h3>

                  <p>
                    Monitor active and completed
                    learning pathways.
                  </p>

                  <span className="courseMeta">
                    Coming next
                  </span>
                </div>
              </article>

              <article className="courseCard">
                <div className="courseBody">
                  <CircleCheck size={28} />

                  <h3>Completions</h3>

                  <p>
                    Review completion records
                    and future certificate
                    eligibility.
                  </p>

                  <span className="courseMeta">
                    Coming next
                  </span>
                </div>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

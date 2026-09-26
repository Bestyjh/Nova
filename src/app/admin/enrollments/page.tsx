import AdminSidebar from "../admin-sidebar";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  UsersRound,
} from "lucide-react";

import PortalHeader from "@/app/portal-header";
import { getAllEnrollments } from "@/lib/data/enrollments";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function EnrollmentsPage() {
  const { supabase } = await requireAdmin();

  const { data: enrollments, error: enrollmentsError } =
    await getAllEnrollments(supabase);

if (enrollmentsError) {
  throw new Error(enrollmentsError.message);
}

const { data: profiles, error: profilesError } =
  await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      role
    `);

if (profilesError) {
  throw new Error(profilesError.message);
}

const { data: courses, error: coursesError } =
  await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug
    `);

if (coursesError) {
  throw new Error(coursesError.message);
}

  const records = enrollments ?? [];

  const activeCount = records.filter(
    (record) => record.status === "active"
  ).length;

  const completedCount = records.filter(
    (record) => record.status === "completed"
  ).length;

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

              <h1>Enrollments</h1>

              <p>
                Monitor learner enrollment and
                course status across NOVA Learning.
              </p>
            </div>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <UsersRound size={24} />

              <strong>{records.length}</strong>

              <span>Total enrollments</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />

              <strong>{activeCount}</strong>

              <span>Active enrollments</span>
            </div>

            <div className="statCard">
              <CheckCircle2 size={24} />

              <strong>{completedCount}</strong>

              <span>Completed enrollments</span>
            </div>
          </div>

          <section className="learningPanel">
            <div className="catalogTop">
              <div>
                <span className="courseMeta">
                  ENROLLMENT MANAGEMENT
                </span>

                <h2>Course Enrollments</h2>
              </div>

              <Link
  href="/admin/enrollments/new"
  className="button compact"
>
  Enroll Learner
</Link>
            </div>

            {records.length === 0 ? (
              <div
                className="emptyLearning"
                style={{ marginTop: "24px" }}
              >
                <h3>No enrollments</h3>

                <p>
                  Course enrollments will appear
                  here.
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
      {records.map((record) => {
  const learner =
    profiles?.find(
      (profile) =>
        profile.id === record.user_id
    ) ?? null;

  const course =
    courses?.find(
      (course) =>
        course.id === record.course_id
    ) ?? null;

  const name = learner
    ? [
        learner.first_name,
        learner.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "Unnamed Account"
    : "Unknown Account";

  return (
    <article
      className="courseCard"
      key={record.id}
    >
      <div className="courseBody">
        <div className="catalogTop">
          <div>
            <span className="courseMeta">
              {learner?.role ?? "unknown"}{" "}
              Ã‚Â· {record.status}
            </span>

            <h3>{name}</h3>

            <p>
              {course?.title ??
                "Unknown Course"}
            </p>

            <small>
              Enrolled{" "}
              {new Date(
                record.enrolled_at
              ).toLocaleDateString()}
            </small>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {learner?.id && (
              <Link
                href={`/admin/learners/${learner.id}`}
                className="button compact"
              >
                View Learner
              </Link>
            )}

            <Link
              href={`/admin/enrollments/${record.id}`}
              className="button compact"
            >
              View Enrollment
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
})}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

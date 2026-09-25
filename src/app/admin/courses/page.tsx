import AdminSidebar from "../admin-sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Layers3,
  Users,
} from "lucide-react";

import PortalHeader from "../../portal-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  // Authenticate.
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  // Authorize administrator.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  // Load courses with modules, lessons and enrollments.
  const { data: courses, error: coursesError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        summary,
        published,
        modules (
          id,
          lessons (
            id,
            published
          )
        ),
        enrollments (
          id,
          status
        )
      `)
      .order("title");

  if (coursesError) {
    console.error(
      "Unable to load admin courses:",
      coursesError
    );
  }

  const courseList = courses ?? [];

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

              <h1>Courses</h1>

              <p>
                Manage NOVA Learning programs,
                curriculum and publishing.
              </p>
            </div>
          </div>

          {courseList.length === 0 ? (
            <section className="learningPanel">
              <h2>No courses yet</h2>

              <p>
                NOVA Learning does not currently
                contain any courses.
              </p>
            </section>
          ) : (
            <div className="courseGrid">
              {courseList.map((course) => {
                const modules =
                  course.modules ?? [];

                const moduleCount =
                  modules.length;

                const lessons =
                  modules.flatMap(
                    (module) =>
                      module.lessons ?? []
                  );

                const lessonCount =
                  lessons.length;

                const publishedLessons =
                  lessons.filter(
                    (lesson) =>
                      lesson.published
                  ).length;

                const enrollments =
                  course.enrollments ?? [];

                const activeEnrollments =
                  enrollments.filter(
                    (enrollment) =>
                      enrollment.status ===
                      "active"
                  ).length;

                const completedEnrollments =
                  enrollments.filter(
                    (enrollment) =>
                      enrollment.status ===
                      "completed"
                  ).length;

                return (
                  <article
                    className="courseCard"
                    key={course.id}
                  >
                    <div className="courseVisual">
                      <BookOpen />
                    </div>

                    <div className="courseBody">
                      <span className="courseMeta">
                        {course.published
                          ? "PUBLISHED"
                          : "DRAFT"}
                      </span>

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {course.summary ||
                          "No course summary yet."}
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(2, minmax(0, 1fr))",
                          gap: "12px",
                          margin: "24px 0",
                        }}
                      >
                        <div>
                          <Layers3 size={18} />
                          <strong
                            style={{
                              display: "block",
                            }}
                          >
                            {moduleCount}
                          </strong>
                          <span>
                            Modules
                          </span>
                        </div>

                        <div>
                          <FileText size={18} />
                          <strong
                            style={{
                              display: "block",
                            }}
                          >
                            {lessonCount}
                          </strong>
                          <span>
                            Lessons
                          </span>
                        </div>

                        <div>
                          <Users size={18} />
                          <strong
                            style={{
                              display: "block",
                            }}
                          >
                            {activeEnrollments}
                          </strong>
                          <span>
                            Active
                          </span>
                        </div>

                        <div>
                          <CheckCircle2
                            size={18}
                          />
                          <strong
                            style={{
                              display: "block",
                            }}
                          >
                            {completedEnrollments}
                          </strong>
                          <span>
                            Completed
                          </span>
                        </div>
                      </div>

                      <p className="courseMeta">
                        {publishedLessons} of{" "}
                        {lessonCount} lessons
                        published
                      </p>

                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="button"
                      >
                        Manage Course
                      </Link>

                      <Link
                        href={`/learn/${course.slug}`}
                        className="button compact"
                        style={{
                          marginLeft: "10px",
                        }}
                      >
                        View Course
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

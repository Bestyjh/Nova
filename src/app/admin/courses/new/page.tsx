import Link from "next/link";

import AdminSidebar from "../../admin-sidebar";
import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createCourse } from "../course-actions";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href="/admin/courses"
                className="courseMeta"
              >
                ← Back to Courses
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Add Course</h1>

              <p>
                Create a new NOVA Learning pathway.
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <form action={createCourse}>
              <div
                style={{
                  display: "grid",
                  gap: "22px",
                }}
              >
                <div>
                  <label htmlFor="title">
                    <strong>Course title</strong>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="authInput"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label htmlFor="slug">
                    <strong>Slug</strong>
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    required
                    className="authInput"
                    placeholder="course-name"
                  />
                </div>

                <div>
                  <label htmlFor="summary">
                    <strong>Summary</strong>
                  </label>

                  <textarea
                    id="summary"
                    name="summary"
                    rows={5}
                    className="authInput"
                    placeholder="Briefly describe this course"
                  />
                </div>

                <label
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    name="published"
                  />

                  <strong>
                    Publish immediately
                  </strong>
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
                    Create Course
                  </button>

                  <Link
                    href="/admin/courses"
                    className="button compact"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
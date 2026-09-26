import Link from "next/link";

import AdminSidebar from "../../admin-sidebar";
import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createResource } from "../actions";

export default async function NewResourcePage() {
  const { supabase } = await requireAdmin();

  const { data: courses, error } =
    await supabase
      .from("courses")
      .select("id, title")
      .order("title");

  if (error) {
    console.error(
      "Unable to load courses for resource form:",
      error
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

              <h1>Add Resource</h1>

              <p>
                Add a learning resource for all
                learners or associate it with a
                specific NOVA course.
              </p>
            </div>

            <Link
              href="/admin/resources"
              className="button compact"
            >
              Back to Resources
            </Link>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              RESOURCE DETAILS
            </p>

            <h2>New Learning Resource</h2>

            <form
              action={createResource}
              className="formGrid"
              style={{
                marginTop: "28px",
                maxWidth: "760px",
              }}
            >
              <div className="field">
                <label htmlFor="title">
                  Resource Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="Example: Healthy Eating Guide"
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
                  placeholder="Briefly describe this resource."
                  style={{
                    width: "100%",
                    border: "1px solid #cbdce2",
                    borderRadius: "9px",
                    padding: "13px",
                    font: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div className="formGrid two">
                <div className="field">
                  <label htmlFor="resource_type">
                    Resource Type
                  </label>

                  <select
                    id="resource_type"
                    name="resource_type"
                    required
                    defaultValue="document"
                  >
                    <option value="document">
                      Document
                    </option>

                    <option value="video">
                      Video
                    </option>

                    <option value="website">
                      Website
                    </option>

                    <option value="download">
                      Download
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="course_id">
                    Course
                  </label>

                  <select
                    id="course_id"
                    name="course_id"
                    defaultValue=""
                  >
                    <option value="">
                      General Resource
                    </option>

                    {courseList.map((course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="url">
                  Resource URL
                </label>

                <input
                  id="url"
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com/resource"
                />
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
                  defaultValue="0"
                />
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="published"
                />

                <span>
                  Publish this resource
                  immediately
                </span>
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="submit"
                  className="button"
                >
                  Create Resource
                </button>

                <Link
                  href="/admin/resources"
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
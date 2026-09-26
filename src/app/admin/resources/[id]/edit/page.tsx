import Link from "next/link";
import { notFound } from "next/navigation";

import AdminSidebar from "../../../admin-sidebar";
import PortalHeader from "../../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminResourceById } from "@/lib/data/resources";
import {
  deleteResource,
  updateResource,
} from "../../actions";

import DeleteResourceButton from "./delete-resource-button";
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditResourcePage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  const [
    { data: resource, error: resourceError },
    { data: courses, error: coursesError },
  ] = await Promise.all([
    getAdminResourceById(supabase, id),

    supabase
      .from("courses")
      .select("id, title")
      .order("title"),
  ]);

  if (resourceError || !resource) {
    notFound();
  }

  if (coursesError) {
    console.error(
      "Unable to load courses for resource form:",
      coursesError
    );
  }

  const courseList = courses ?? [];

  const updateResourceAction =
    updateResource.bind(null, resource.id);
const deleteResourceAction =
  deleteResource.bind(null, resource.id);

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

              <h1>Edit Resource</h1>

              <p>
                Update this NOVA learning resource
                and its availability.
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

            <h2>{resource.title}</h2>

            <form
              action={updateResourceAction}
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
                  defaultValue={resource.title}
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
                  defaultValue={
                    resource.description ?? ""
                  }
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
                    defaultValue={
                      resource.resource_type
                    }
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
                    defaultValue={
                      resource.course_id ?? ""
                    }
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
                  defaultValue={resource.url}
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
                  defaultValue={resource.position}
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
                  defaultChecked={resource.published}
                />

                <span>
                  Publish this resource
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
                  Save Changes
                </button>

                <Link
                  href="/admin/resources"
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
  <h3>Delete Resource</h3>

  <p>
    Permanently remove this resource from NOVA
    Learning. This action cannot be undone.
  </p>

  <div style={{ marginTop: "16px" }}>
    <DeleteResourceButton
      action={deleteResourceAction}
    />
  </div>
</div>
          </section>
        </section>
      </main>
    </div>
  );
}
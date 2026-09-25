import AdminSidebar from "../../../admin-sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateCourse } from "./actions";

import PortalHeader from "../../../../portal-header";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCoursePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: claimsData } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id, title, slug, summary, published"
    )
    .eq("id", id)
    .single();

  if (error || !course) {
    notFound();
  }

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
      <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <Link
                href={`/admin/courses/${course.id}`}
                className="courseMeta"
              >
                ← Back to Course
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Edit Course</h1>

              <p>
                Update the course information and
                publishing status.
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <form action={updateCourse.bind(null, course.id)}>
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
                    defaultValue={course.title}
                    required
                    className="authInput"
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
                    defaultValue={course.slug}
                    required
                    className="authInput"
                  />
                </div>

                <div>
                  <label htmlFor="summary">
                    <strong>Summary</strong>
                  </label>

                  <textarea
                    id="summary"
                    name="summary"
                    defaultValue={
                      course.summary ?? ""
                    }
                    rows={5}
                    className="authInput"
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
                    defaultChecked={
                      course.published
                    }
                  />

                  <strong>
                    Published
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
                    Save Changes
                  </button>

                  <Link
                    href={`/admin/courses/${course.id}`}
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

import AdminSidebar from "../../../../../admin-sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";

import PortalHeader from "@/app/portal-header";
import {
  deleteModule,
  updateModule,
} from "../../../module-actions";
import { requireAdmin } from "@/lib/auth/require-admin";
type PageProps = {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
};

export default async function EditModulePage({
  params,
}: PageProps) {
  const { id, moduleId } = await params;

  const { supabase } = await requireAdmin();

  // Load the module and make sure it belongs
  // to the course in the URL.
  const { data: moduleRecord, error: moduleError } =
    await supabase
      .from("modules")
      .select("id, title, position, course_id")
      .eq("id", moduleId)
      .eq("course_id", id)
      .single();

  if (moduleError || !moduleRecord) {
    notFound();
  }

  // Load course information separately.
  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select("id, title")
      .eq("id", id)
      .single();

  if (courseError || !course) {
    notFound();
  }

  const updateModuleAction =
    updateModule.bind(
      null,
      course.id,
      moduleRecord.id
    );

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
                â† Back to Course
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Edit Module</h1>

              <p>{course.title}</p>
            </div>
          </div>

          <section className="learningPanel">
            <h2>{moduleRecord.title}</h2>

            <form action={updateModuleAction}>
              <div
                style={{
                  display: "grid",
                  gap: "22px",
                  marginTop: "24px",
                }}
              >
                <div>
                  <label htmlFor="title">
                    <strong>
                      Module title
                    </strong>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={
                      moduleRecord.title
                    }
                    className="authInput"
                  />
                </div>

                <div>
                  <label htmlFor="position">
                    <strong>
                      Module position
                    </strong>
                  </label>

                  <input
                    id="position"
                    name="position"
                    type="number"
                    min="1"
                    step="1"
                    required
                    defaultValue={
                      moduleRecord.position
                    }
                    className="authInput"
                  />

                  <p
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    Lower numbers appear earlier
                    in the course.
                  </p>
                </div>

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
                    Save Module
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
<div
  style={{
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #ddd",
  }}
>
  <h3>Delete Module</h3>

  <p>
    A module can only be deleted when it contains
    no lessons.
  </p>

  <form
    action={deleteModule.bind(
      null,
      course.id,
      moduleRecord.id
    )}
  >
    <button
      type="submit"
      className="button"
    >
      Delete Empty Module
    </button>
  </form>
</div>
          </section>
        </section>
      </main>
    </div>
  );
}

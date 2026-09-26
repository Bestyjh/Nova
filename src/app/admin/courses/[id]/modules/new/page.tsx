import AdminSidebar from "../../../../admin-sidebar";
import Link from "next/link";
import { notFound } from "next/navigation";

import PortalHeader from "../../../../../portal-header";
import { createModule } from "../../module-actions";
import { requireAdmin } from "@/lib/auth/require-admin";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewModulePage({
  params,
}: PageProps) {
  const { id } = await params;

  const { supabase } = await requireAdmin();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!course) {
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
                â† Back to Course
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA COURSE MANAGEMENT
              </p>

              <h1>Add Module</h1>

              <p>{course.title}</p>
            </div>
          </div>

          <section className="learningPanel">
            <form
              action={createModule.bind(
                null,
                course.id
              )}
            >
              <div
                style={{
                  display: "grid",
                  gap: "22px",
                }}
              >
                <div>
                  <label htmlFor="title">
                    <strong>Module title</strong>
                  </label>

                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="authInput"
                    placeholder="Enter module title"
                  />
                </div>

                <p>
                  The new module will automatically
                  be placed after the existing modules.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    type="submit"
                    className="button"
                  >
                    Add Module
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

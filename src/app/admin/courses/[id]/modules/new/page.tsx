import AdminSidebar from "../../../../admin-sidebar";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import PortalHeader from "../../../../../portal-header";
import { createClient } from "@/lib/supabase/server";
import { createModule } from "../../module-actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NewModulePage({
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
                ← Back to Course
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

import AdminSidebar from "../../admin-sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";

import PortalHeader from "@/app/portal-header";
import { createClient } from "@/lib/supabase/server";
import { getEnrollmentPairs } from "@/lib/data/enrollments";
import { createEnrollment } from "../actions";
import EnrollmentForm from "./enrollment-form";

export default async function NewEnrollmentPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const adminId = claimsData?.claims?.sub;

  if (claimsError || !adminId) {
    redirect("/login");
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: learners, error: learnersError } =
    await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name
      `)
      .eq("role", "learner")
      .order("first_name");

  if (learnersError) {
    throw new Error(learnersError.message);
  }

  const { data: courses, error: coursesError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title
      `)
      .eq("published", true)
      .order("title");

  if (coursesError) {
    throw new Error(coursesError.message);
  }
const {
  data: existingEnrollments,
  error: enrollmentsError,
} = await getEnrollmentPairs(supabase);

if (enrollmentsError) {
  throw new Error(
    enrollmentsError.message
  );
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
                href="/admin/enrollments"
                className="courseMeta"
              >
                â† Back to Enrollments
              </Link>

              <p
                className="eyebrow"
                style={{ marginTop: "20px" }}
              >
                NOVA ENROLLMENT MANAGEMENT
              </p>

              <h1>Enroll Learner</h1>

              <p>
                Assign a learner to a published
                NOVA Learning course.
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <EnrollmentForm
              learners={learners ?? []}
              courses={courses ?? []}
              existingEnrollments={
                existingEnrollments ?? []
              }
              action={createEnrollment}
            />
          </section>
        </section>
      </main>
    </div>
  );
}

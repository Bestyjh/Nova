import AdminSidebar from "../../admin-sidebar";
import Link from "next/link";

import PortalHeader from "@/app/portal-header";
import { getEnrollmentPairs } from "@/lib/data/enrollments";
import { createEnrollment } from "../actions";
import EnrollmentForm from "./enrollment-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function NewEnrollmentPage() {
  const { supabase } = await requireAdmin();

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
                Ã¢â€ Â Back to Enrollments
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

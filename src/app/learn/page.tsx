import LearnClient from "./learn-client";

import { requireUser } from "@/lib/auth/require-user";
import { getProfileSummary } from "@/lib/data/profiles";

export default async function Learn() {
  const { supabase, userId } =
    await requireUser();

  const [
    { data: profile, error: profileError },
    { data: courses, error: coursesError },
  ] = await Promise.all([
    getProfileSummary(supabase, userId),

    supabase
      .from("courses")
      .select("id, slug, title, summary")
      .eq("published", true)
      .order("created_at"),
  ]);

  if (profileError) {
    throw new Error(
      "Unable to load learner profile."
    );
  }

  if (coursesError) {
    throw new Error(
      "Unable to load learning pathways."
    );
  }

  const learningCourses = (courses ?? []).map(
    (course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      summary: course.summary ?? null,
    })
  );

  return (
    <LearnClient
      firstName={
        profile?.first_name || "Learner"
      }
      role={profile?.role ?? null}
      courses={learningCourses}
    />
  );
}
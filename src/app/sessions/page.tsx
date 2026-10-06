import SessionsClient from "./sessions-client";

import { requireUser } from "@/lib/auth/require-user";
import { getProfileSummary } from "@/lib/data/profiles";
import { getLearnerSessions } from "@/lib/data/sessions";

export default async function SessionsPage() {
  const { supabase, userId } =
    await requireUser();

  const [
    { data: profile, error: profileError },
    { data: sessions, error: sessionsError },
  ] = await Promise.all([
    getProfileSummary(supabase, userId),
    getLearnerSessions(supabase),
  ]);

  if (profileError) {
    throw new Error(
      "Unable to load learner profile."
    );
  }

  if (sessionsError) {
    console.error(
      "Unable to load learner sessions:",
      sessionsError
    );
  }

  const sessionList = (sessions ?? []).map(
    (session) => {
  const courseRelation = session.courses as
  | { id: string; title: string; slug: string }[]
  | { id: string; title: string; slug: string }
  | null;

const courseTitle = Array.isArray(courseRelation)
  ? courseRelation[0]?.title ?? null
  : courseRelation?.title ?? null;
      return {
        id: session.id,
        title: session.title,
        description:
          session.description ?? null,
        sessionType: session.session_type,
        startsAt: session.starts_at,
        endsAt: session.ends_at ?? null,
        timezone: session.timezone,
        location: session.location ?? null,
        meetingUrl:
          session.meeting_url ?? null,
        courseTitle,
      };
    }
  );

  return (
    <SessionsClient
      firstName={
        profile?.first_name || "Learner"
      }
      role={profile?.role ?? null}
      sessions={sessionList}
    />
  );
}
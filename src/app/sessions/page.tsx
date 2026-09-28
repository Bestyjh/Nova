import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Monitor,
} from "lucide-react";
import { redirect } from "next/navigation";

import PortalHeader from "../portal-header";
import { createClient } from "@/lib/supabase/server";
import { getLearnerSessions } from "@/lib/data/sessions";

export default async function SessionsPage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { data: sessions, error } =
    await getLearnerSessions(supabase);

  if (error) {
    console.error(
      "Unable to load learner sessions:",
      error
    );
  }

  const sessionList = sessions ?? [];

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <aside className="dashboardSidebar">
          <h3>Learner Portal</h3>

          <nav>
            <Link href="/dashboard">
              Overview
            </Link>

            <Link href="/learn">
              My Learning
            </Link>

            <Link href="/resources">
              Resources
            </Link>

            <Link href="/sessions">
              Sessions
            </Link>

           <Link href="/profile">
  Profile
</Link>
          </nav>
        </aside>

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA LEARNING
              </p>

              <h1>Sessions</h1>

              <p>
                View upcoming NOVA learning
                sessions and program events.
              </p>
            </div>
          </div>

          {sessionList.length === 0 ? (
            <section className="learningPanel">
              <h2>No sessions available</h2>

              <p>
                There are currently no published
                sessions available to you.
              </p>
            </section>
          ) : (
            <div className="courseGrid">
              {sessionList.map((session) => {
                const startsAt = new Date(
                  session.starts_at
                );

                const endsAt = session.ends_at
                  ? new Date(session.ends_at)
                  : null;

                const courseTitle =
                  Array.isArray(session.courses)
                    ? session.courses[0]?.title
                    : null;

                return (
                  <article
                    className="courseCard"
                    key={session.id}
                  >
                    <div className="courseVisual">
                      <CalendarDays />
                    </div>

                    <div className="courseBody">
                      <span className="courseMeta">
                        {courseTitle ??
                          "GENERAL SESSION"}
                      </span>

                      <h3>{session.title}</h3>

                      <p>
                        {session.description ||
                          "NOVA learning session."}
                      </p>

                      <p>
                        <CalendarDays
                          size={17}
                          style={{
                            verticalAlign: "middle",
                            marginRight: "8px",
                          }}
                        />

                        {startsAt.toLocaleString()}

                        {endsAt
                          ? ` – ${endsAt.toLocaleString()}`
                          : ""}
                      </p>

                      {session.session_type ===
                      "online" ? (
                        <p>
                          <Monitor
                            size={17}
                            style={{
                              verticalAlign:
                                "middle",
                              marginRight: "8px",
                            }}
                          />
                          Online
                        </p>
                      ) : (
                        <p>
                          <MapPin
                            size={17}
                            style={{
                              verticalAlign:
                                "middle",
                              marginRight: "8px",
                            }}
                          />

                          {session.location ||
                            (session.session_type ===
                            "hybrid"
                              ? "Hybrid"
                              : "In Person")}
                        </p>
                      )}

                      {session.meeting_url && (
                        <a
                          href={session.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="button compact"
                        >
                          Join Session
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
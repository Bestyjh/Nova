import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Monitor,
} from "lucide-react";

import AdminSidebar from "../admin-sidebar";
import PortalHeader from "../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminSessions } from "@/lib/data/sessions";

export default async function AdminSessionsPage() {
  const { supabase } = await requireAdmin();

  const { data: sessions, error } =
    await getAdminSessions(supabase);

  if (error) {
    console.error(
      "Unable to load admin sessions:",
      error
    );
  }

  const sessionList = sessions ?? [];

  const publishedCount =
    sessionList.filter(
      (session) => session.published
    ).length;

  const draftCount =
    sessionList.length - publishedCount;

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

              <h1>Sessions</h1>

              <p>
                Manage scheduled NOVA learning
                sessions and program events.
              </p>
            </div>

            <Link
              href="/admin/sessions/new"
              className="button"
            >
              Add Session
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            <div className="statCard">
              <strong>{sessionList.length}</strong>
              <span>Total Sessions</span>
            </div>

            <div className="statCard">
              <strong>{publishedCount}</strong>
              <span>Published</span>
            </div>

            <div className="statCard">
              <strong>{draftCount}</strong>
              <span>Drafts</span>
            </div>
          </div>

          {sessionList.length === 0 ? (
            <section className="learningPanel">
              <h2>No sessions yet</h2>

              <p>
                Create the first NOVA learning
                session or program event.
              </p>

              <Link
                href="/admin/sessions/new"
                className="button"
              >
                Add Session
              </Link>
            </section>
          ) : (
            <div className="courseGrid">
              {sessionList.map((session) => {
                const startsAt = new Date(
                  session.starts_at
                );

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
                        {session.published
                          ? "PUBLISHED"
                          : "DRAFT"}
                      </span>

                      <h3>{session.title}</h3>

                      <p>
                        {session.description ||
                          "No session description yet."}
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
                            session.session_type}
                        </p>
                      )}

                      <p className="courseMeta">
  {Array.isArray(session.courses)
    ? session.courses[0]?.title ??
      "General Session"
    : "General Session"}
</p>
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
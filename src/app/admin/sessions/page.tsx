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
                <span>
                  {sessionList.length === 1 ? "Total Session" : "Total Sessions"}
                </span>
              </div>

            <div className="statCard">
              <strong>{publishedCount}</strong>
              <span>Published</span>
            </div>

            <div className="statCard">
              <strong>{draftCount}</strong>
              <span>{draftCount === 1 ? "Draft" : "Drafts"}</span>
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
                        {new Intl.DateTimeFormat("en-CA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: session.timezone,
                          timeZoneName: "short",
                        }).format(new Date(session.starts_at))}
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
                      {(() => {
                        const courseRelation = session.courses as
                          | { id: string; title: string; slug: string }[]
                          | { id: string; title: string; slug: string }
                          | null;

                        const courseTitle = Array.isArray(courseRelation)
                          ? courseRelation[0]?.title
                          : courseRelation?.title;

                        return courseTitle ?? "General Session";
                      })()}
                    </p>
                    <Link
                      href={`/admin/sessions/${session.id}/edit`}
                      className="button"
                    >
                      Edit Session
                    </Link>
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
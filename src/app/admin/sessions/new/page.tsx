import Link from "next/link";

import AdminSidebar from "../../admin-sidebar";
import PortalHeader from "../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createSession } from "../actions";

export default async function NewSessionPage() {
  const { supabase } = await requireAdmin();

  const timezones = Intl.supportedValuesOf(
    "timeZone"
  );

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

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

              <h1>Add Session</h1>

              <p>
                Schedule a NOVA learning session
                or program event.
              </p>
            </div>

            <Link
              href="/admin/sessions"
              className="button compact"
            >
              Back to Sessions
            </Link>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              SESSION DETAILS
            </p>

            <h2>New Session</h2>

            <form
              action={createSession}
              className="formGrid"
            >
              <div className="field">
                <label htmlFor="title">
                  Session Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                />
              </div>

              <div className="field">
                <label htmlFor="session_type">
                  Session Type
                </label>

                <select
                  id="session_type"
                  name="session_type"
                  defaultValue="online"
                  required
                >
                  <option value="online">
                    Online
                  </option>

                  <option value="in_person">
                    In Person
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="course_id">
                  Course
                </label>

                <select
                  id="course_id"
                  name="course_id"
                  defaultValue=""
                >
                  <option value="">
                    General Session
                  </option>

                  {(courses ?? []).map(
                    (course) => (
                      <option
                        key={course.id}
                        value={course.id}
                      >
                        {course.title}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label htmlFor="timezone">
                  Timezone
                </label>

                <select
                  id="timezone"
                  name="timezone"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select timezone
                  </option>

                  {timezones.map((timezone) => (
                    <option
                      key={timezone}
                      value={timezone}
                    >
                      {timezone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="starts_at">
                  Start Date & Time
                </label>

                <input
                  id="starts_at"
                  name="starts_at"
                  type="datetime-local"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="ends_at">
                  End Date & Time
                </label>

                <input
                  id="ends_at"
                  name="ends_at"
                  type="datetime-local"
                />
              </div>

              <div className="field">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Room, building, or address"
                />
              </div>

              <div className="field">
                <label htmlFor="meeting_url">
                  Meeting URL
                </label>

                <input
                  id="meeting_url"
                  name="meeting_url"
                  type="url"
                  placeholder="https://..."
                />
              </div>

              <label>
                <input
                  type="checkbox"
                  name="published"
                />{" "}
                Publish this session
              </label>

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
                  Create Session
                </button>

                <Link
                  href="/admin/sessions"
                  className="button compact"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
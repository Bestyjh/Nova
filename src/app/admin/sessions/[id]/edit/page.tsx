import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";

import AdminSidebar from "../../../admin-sidebar";
import PortalHeader from "../../../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminSessionById } from "@/lib/data/sessions";
import {
  deleteSession,
  updateSession,
} from "../../actions";

import DeleteSessionButton from "./delete-session-button";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function toDateTimeLocal(
  value: string | null,
  timezone: string
) {
  if (!value) {
    return "";
  }

  return formatInTimeZone(
    value,
    timezone,
    "yyyy-MM-dd'T'HH:mm"
  );
}

export default async function EditSessionPage({
  params,
}: PageProps) {
  const { id } = await params;

  const timezones = Intl.supportedValuesOf(
    "timeZone"
  );

  const { supabase } = await requireAdmin();

  const { data: session, error } =
    await getAdminSessionById(
      supabase,
      id
    );

  if (error || !session) {
    notFound();
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .order("title");

  const updateSessionAction =
    updateSession.bind(null, session.id);

    const deleteSessionAction =
  deleteSession.bind(null, session.id);

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

              <h1>Edit Session</h1>

              <p>
                Update this NOVA learning
                session and its availability.
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

            <h2>{session.title}</h2>

            <form
              action={updateSessionAction}
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
                  defaultValue={session.title}
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
                  defaultValue={
                    session.description ?? ""
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="session_type">
                  Session Type
                </label>

                <select
                  id="session_type"
                  name="session_type"
                  defaultValue={
                    session.session_type
                  }
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
                  defaultValue={
                    session.course_id ?? ""
                  }
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
                  defaultValue={session.timezone}
                  required
                >
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
                  defaultValue={toDateTimeLocal(
                    session.starts_at,
                    session.timezone
                  )}
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
                  defaultValue={toDateTimeLocal(
                    session.ends_at,
                    session.timezone
                  )}
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
                  defaultValue={
                    session.location ?? ""
                  }
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
                  defaultValue={
                    session.meeting_url ?? ""
                  }
                />
              </div>

              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={
                    session.published
                  }
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
                  Save Changes
                </button>

                <Link
                  href="/admin/sessions"
                  className="button compact"
                >
                  Cancel
                </Link>
              </div>
            </form>
            <div
  style={{
    marginTop: "40px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8e5",
  }}
>
  <h3>Delete Session</h3>

  <p>
    Permanently remove this session from NOVA
    Learning. This action cannot be undone.
  </p>

  <div style={{ marginTop: "16px" }}>
    <DeleteSessionButton
      action={deleteSessionAction}
    />
  </div>
</div>
          </section>
        </section>
      </main>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  MapPin,
  Monitor,
  Search,
} from "lucide-react";

import LearnerPortalShell from "../learner-portal-shell";
import styles from "../learner-portal.module.css";

type LearnerSession = {
  id: string;
  title: string;
  description: string | null;
  sessionType: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  meetingUrl: string | null;
  courseTitle: string | null;
};

type SessionsClientProps = {
  firstName: string;
  role: string | null;
  sessions: LearnerSession[];
};

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function sessionTypeLabel(type: string) {
  switch (type) {
    case "online":
      return "Online";

    case "hybrid":
      return "Hybrid";

    default:
      return "In Person";
  }
}

export default function SessionsClient({
  firstName,
  role,
  sessions,
}: SessionsClientProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredSessions = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return sessions;
    }

    return sessions.filter((session) => {
      const searchableText = [
        session.title,
        session.description ?? "",
        session.courseTitle ?? "",
        session.location ?? "",
        session.sessionType,
        sessionTypeLabel(session.sessionType),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [sessions, searchQuery]);

  return (
    <LearnerPortalShell
      firstName={firstName}
      role={role}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    >
      <section className={styles.welcomeBlock}>
        <span className={styles.courseMeta}>
          NOVA LEARNING
        </span>

        <h1>Sessions</h1>

        <p>
          View upcoming NOVA learning sessions,
          workshops and program events available
          to you.
        </p>
      </section>

      <section className={styles.learningSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Upcoming Sessions</h2>

            <p>
              Keep track of scheduled learning
              opportunities and join your NOVA
              sessions.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <CalendarDays
              size={34}
              aria-hidden="true"
            />

            <h3>No sessions available</h3>

            <p>
              There are currently no published
              sessions available to you.
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className={styles.emptyState}>
            <Search
              size={34}
              aria-hidden="true"
            />

            <h3>No sessions found</h3>

            <p>
              No sessions match
              &ldquo;{searchQuery}&rdquo;. Try
              another search.
            </p>
          </div>
        ) : (
          <div className={styles.courseList}>
            {filteredSessions.map((session) => (
              <article
                key={session.id}
                className={styles.courseRow}
              >
                <div
                  className={`${styles.courseVisual} ${styles.resourceVisual}`}
                  aria-hidden="true"
                >
                  <CalendarDays size={42} />
                </div>

                <div
                  className={styles.courseContent}
                >
                  <span
                    className={styles.courseMeta}
                  >
                    {session.courseTitle ??
                      "GENERAL SESSION"}
                  </span>

                  <h3>{session.title}</h3>

                  <p>
                    {session.description ||
                      "NOVA learning session."}
                  </p>

                  <div
                    className={
                      styles.sessionDetails
                    }
                  >
                    <span>
                      <CalendarDays
                        size={17}
                        aria-hidden="true"
                      />

                      {formatSessionDate(
                        session.startsAt
                      )}

                      {session.endsAt
                        ? ` – ${formatSessionDate(
                            session.endsAt
                          )}`
                        : ""}
                    </span>

                    <span>
                      {session.sessionType ===
                      "online" ? (
                        <Monitor
                          size={17}
                          aria-hidden="true"
                        />
                      ) : (
                        <MapPin
                          size={17}
                          aria-hidden="true"
                        />
                      )}

                      {session.sessionType ===
                      "online"
                        ? "Online"
                        : session.location ||
                          sessionTypeLabel(
                            session.sessionType
                          )}
                    </span>
                  </div>
                </div>

                {session.meetingUrl ? (
                  <div
                    className={
                      styles.courseActions
                    }
                  >
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        styles.primaryButton
                      }
                    >
                      Join Session

                      <ExternalLink
                        size={16}
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </LearnerPortalShell>
  );
}
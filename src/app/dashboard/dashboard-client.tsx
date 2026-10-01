"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  LayoutDashboard,
  Search,
  UserRound,
} from "lucide-react";

import LogoutButton from "../logout-button";
import styles from "./dashboard.module.css";

type DashboardCourse = {
  enrollmentId: string;
  enrollmentStatus: string;
  title: string;
  slug: string;
  summary: string | null;
  completedLessons: number;
  totalLessons: number;
  progress: number;
  completionDate: string | null;
  certificateId: string | null;
};

type DashboardClientProps = {
  firstName: string;
  role: string | null;
  activeCount: number;
  completedCourses: number;
  courses: DashboardCourse[];
};

export default function DashboardClient({
  firstName,
  role,
  activeCount,
  completedCourses,
  courses,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredCourses = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      return (
        course.title
          .toLowerCase()
          .includes(query) ||
        (course.summary ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [courses, searchQuery]);

  const initials = firstName
    .trim()
    .slice(0, 2)
    .toUpperCase();

  const accountRole =
    role === "admin" ? "Admin" : "Learner";

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.topbar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="NOVA Wellness & Lifestyle Institute"
        >
          <Image
            src="/nova-logo.png"
            alt="NOVA Wellness & Lifestyle Institute"
            width={190}
            height={54}
            priority
          />
        </Link>

        <label className={styles.searchBox}>
          <Search
            size={19}
            aria-hidden="true"
          />

          <span className={styles.srOnly}>
            Search your learning
          </span>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder="Search your learning"
          />
        </label>

        <div className={styles.accountArea}>
          <Link
            href="/profile"
            className={styles.profileLink}
          >
            <span className={styles.avatar}>
              {initials || "NL"}
            </span>

            <span className={styles.profileCopy}>
              <strong>{firstName}</strong>
              <small>{accountRole}</small>
            </span>
          </Link>

          <span
            className={styles.accountDivider}
            aria-hidden="true"
          />

          <div className={styles.logoutWrap}>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          <nav
            className={styles.sidebarNav}
            aria-label="Learner portal"
          >
            <Link
              href="/dashboard"
              className={styles.activeNavItem}
              aria-current="page"
            >
              <LayoutDashboard
                size={19}
                aria-hidden="true"
              />
              Overview
            </Link>

            <Link
              href="/learn"
              className={styles.navItem}
            >
              <BookOpen
                size={19}
                aria-hidden="true"
              />
              My Learning
            </Link>

            <Link
              href="/resources"
              className={styles.navItem}
            >
              <FolderOpen
                size={19}
                aria-hidden="true"
              />
              Resources
            </Link>

            <Link
              href="/sessions"
              className={styles.navItem}
            >
              <CalendarDays
                size={19}
                aria-hidden="true"
              />
              Sessions
            </Link>

            <Link
              href="/profile"
              className={styles.navItem}
            >
              <UserRound
                size={19}
                aria-hidden="true"
              />
              Profile
            </Link>
          </nav>

          <div className={styles.sidebarHelp}>
            <strong>NOVA Learning</strong>
            <p>
              Your learning pathways, resources,
              sessions and achievements in one
              place.
            </p>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={styles.welcomeBlock}>
            <h1>Welcome, {firstName}</h1>

            <p>
              Continue your learning, monitor your
              progress and access your NOVA
              resources.
            </p>
          </section>

          <section
            className={styles.statsGrid}
            aria-label="Learning overview"
          >
            <article className={styles.statCard}>
              <span
                className={`${styles.statIcon} ${styles.statIconBlue}`}
              >
                <BookOpen
                  size={23}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>{activeCount}</strong>
                <h2>Active learning</h2>
                <p>
                  Learning pathways currently in
                  progress.
                </p>
              </div>
            </article>

            <article className={styles.statCard}>
              <span
                className={`${styles.statIcon} ${styles.statIconGreen}`}
              >
                <CheckCircle2
                  size={23}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  {completedCourses}
                </strong>
                <h2>Completed courses</h2>
                <p>
                  NOVA pathways you have
                  successfully completed.
                </p>
              </div>
            </article>

            <article className={styles.statCard}>
              <span
                className={`${styles.statIcon} ${styles.statIconNeutral}`}
              >
                <UserRound
                  size={23}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong
                  className={styles.roleValue}
                >
                  {accountRole}
                </strong>
                <h2>Account role</h2>
                <p>
                  Your current NOVA Learning
                  access level.
                </p>
              </div>
            </article>
          </section>

          <section
            className={styles.learningSection}
          >
            <div className={styles.sectionHeading}>
              <div>
                <h2>My Learning</h2>
                <p>
                  Pick up where you left off or
                  review completed learning.
                </p>
              </div>

              <Link
                href="/learn"
                className={styles.viewAllLink}
              >
                View all learning
                <ChevronRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen
                  size={34}
                  aria-hidden="true"
                />

                <h3>
                  No active courses yet
                </h3>

                <p>
                  When you enroll in a NOVA
                  learning program, it will appear
                  here.
                </p>

                <Link
                  href="/learn"
                  className={styles.primaryButton}
                >
                  Explore Learning
                </Link>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className={styles.emptyState}>
                <Search
                  size={34}
                  aria-hidden="true"
                />

                <h3>No courses found</h3>

                <p>
                  No learning pathways match
                  &ldquo;{searchQuery}&rdquo;.
                  Try another search.
                </p>
              </div>
            ) : (
              <div className={styles.courseList}>
                {filteredCourses.map(
                  (course) => (
                    <article
                      key={course.enrollmentId}
                      className={styles.courseRow}
                    >
                      <div
                        className={
                          styles.courseVisual
                        }
                        aria-hidden="true"
                      >
                        <span
                          className={
                            styles.courseVisualLabel
                          }
                        >
                          NOVA Wellness
                          <br />
                          Learning Pathway
                        </span>
                      </div>

                      <div
                        className={
                          styles.courseContent
                        }
                      >
                        <span
                          className={
                            styles.courseMeta
                          }
                        >
                          {course.enrollmentStatus ===
                          "completed"
                            ? "COMPLETED"
                            : "NOVA LEARNING"}
                        </span>

                        <h3>{course.title}</h3>

                        {course.summary && (
                          <p>
                            {course.summary}
                          </p>
                        )}

                        <div
                          className={
                            styles.progressMeta
                          }
                        >
                          <span>
                            {
                              course.completedLessons
                            }{" "}
                            of{" "}
                            {
                              course.totalLessons
                            }{" "}
                            lessons completed
                          </span>

                          <strong>
                            {course.progress}%
                          </strong>
                        </div>

                        <div
                          className={
                            styles.progressTrack
                          }
                          role="progressbar"
                          aria-label={`${course.title} progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            course.progress
                          }
                        >
                          <span
                            style={{
                              width: `${course.progress}%`,
                            }}
                          />
                        </div>

                        {course.completionDate && (
                          <p
                            className={
                              styles.completionDate
                            }
                          >
                            Completed{" "}
                            {
                              course.completionDate
                            }
                          </p>
                        )}
                      </div>

                      <div
                        className={
                          styles.courseActions
                        }
                      >
                        <Link
                          href={`/learn/${course.slug}`}
                          className={
                            styles.primaryButton
                          }
                        >
                          {course.enrollmentStatus ===
                          "completed"
                            ? "Review Course"
                            : course.progress > 0
                              ? "Continue Learning"
                              : "Start Learning"}

                          <ChevronRight
                            size={16}
                            aria-hidden="true"
                          />
                        </Link>

                        {course.certificateId && (
                          <Link
                            href={`/certificates/${course.certificateId}`}
                            className={
                              styles.certificateButton
                            }
                          >
                            <Award
                              size={16}
                              aria-hidden="true"
                            />
                            View Certificate
                          </Link>
                        )}

                        {course.enrollmentStatus ===
                          "completed" && (
                          <span
                            className={
                              styles.completedStatus
                            }
                          >
                            <CheckCircle2
                              size={15}
                              aria-hidden="true"
                            />
                            Completed
                          </span>
                        )}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
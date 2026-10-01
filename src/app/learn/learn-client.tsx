"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";

import LearnerPortalShell from "../learner-portal-shell";
import styles from "../learner-portal.module.css";

type LearnCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
};

type LearnClientProps = {
  firstName: string;
  role: string | null;
  courses: LearnCourse[];
};

export default function LearnClient({
  firstName,
  role,
  courses,
}: LearnClientProps) {
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
      const searchableText = [
        course.title,
        course.summary ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [courses, searchQuery]);

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

        <h1>My Learning</h1>

        <p>
          Explore NOVA learning pathways and
          continue building practical knowledge
          for healthier living.
        </p>
      </section>

      <section className={styles.learningSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Available Learning</h2>

            <p>
              Browse the learning pathways
              currently available through NOVA.
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen
              size={34}
              aria-hidden="true"
            />

            <h3>No learning pathways yet</h3>

            <p>
              Published NOVA learning pathways
              will appear here when they become
              available.
            </p>
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
              &ldquo;{searchQuery}&rdquo;. Try
              another search.
            </p>
          </div>
        ) : (
          <div className={styles.courseList}>
            {filteredCourses.map((course) => (
              <article
                key={course.id}
                className={styles.courseRow}
              >
                <div
                  className={styles.courseVisual}
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
                  className={styles.courseContent}
                >
                  <span
                    className={styles.courseMeta}
                  >
                    NOVA LEARNING
                  </span>

                  <h3>{course.title}</h3>

                  {course.summary ? (
                    <p>{course.summary}</p>
                  ) : (
                    <p>
                      Explore this NOVA learning
                      pathway.
                    </p>
                  )}
                </div>

                <div
                  className={styles.courseActions}
                >
                  <Link
                    href={`/learn/${course.slug}`}
                    className={
                      styles.primaryButton
                    }
                  >
                    View Course

                    <ChevronRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </LearnerPortalShell>
  );
}
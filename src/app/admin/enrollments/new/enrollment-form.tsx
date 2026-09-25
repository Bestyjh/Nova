"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Learner = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type Course = {
  id: string;
  title: string;
};

type ExistingEnrollment = {
  user_id: string;
  course_id: string;
};

type Props = {
  learners: Learner[];
  courses: Course[];
  existingEnrollments: ExistingEnrollment[];
  action: (formData: FormData) => void | Promise<void>;
};

export default function EnrollmentForm({
  learners,
  courses,
  existingEnrollments,
  action,
}: Props) {
  const [selectedLearner, setSelectedLearner] =
    useState("");

  const availableCourses = useMemo(() => {
    if (!selectedLearner) {
      return courses;
    }

    const enrolledCourseIds = new Set(
      existingEnrollments
        .filter(
          (enrollment) =>
            enrollment.user_id === selectedLearner
        )
        .map(
          (enrollment) =>
            enrollment.course_id
        )
    );

    return courses.filter(
      (course) =>
        !enrolledCourseIds.has(course.id)
    );
  }, [
    selectedLearner,
    courses,
    existingEnrollments,
  ]);

  const hasLearner =
    selectedLearner.length > 0;

  return (
    <form action={action}>
      <div
        style={{
          display: "grid",
          gap: "22px",
        }}
      >
        <div>
          <label htmlFor="user_id">
            <strong>Learner</strong>
          </label>

          <select
            id="user_id"
            name="user_id"
            required
            value={selectedLearner}
            onChange={(event) =>
              setSelectedLearner(
                event.target.value
              )
            }
            className="authInput"
          >
            <option value="" disabled>
              Select learner
            </option>

            {learners.map((learner) => (
              <option
                key={learner.id}
                value={learner.id}
              >
                {[
                  learner.first_name,
                  learner.last_name,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                  "Unnamed Learner"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="course_id">
            <strong>Course</strong>
          </label>

          <select
            id="course_id"
            name="course_id"
            required
            defaultValue=""
            disabled={
              !hasLearner ||
              availableCourses.length === 0
            }
            className="authInput"
          >
            <option value="" disabled>
              {!hasLearner
                ? "Select a learner first"
                : availableCourses.length === 0
                  ? "No available courses"
                  : "Select course"}
            </option>

            {availableCourses.map(
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

        {hasLearner &&
          availableCourses.length === 0 && (
            <p>
              This learner is already enrolled
              in every currently published
              NOVA course.
            </p>
          )}

        <p>
          New enrollments begin with an active
          status. Course completion will be
          determined by learner progress.
        </p>

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
            disabled={
              !hasLearner ||
              availableCourses.length === 0
            }
          >
            Enroll Learner
          </button>

          <Link
            href="/admin/enrollments"
            className="button compact"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}

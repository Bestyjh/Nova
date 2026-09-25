"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { completeLesson } from "./actions";

type Props = {
  lessonId: string;
  courseSlug: string;
  completed: boolean;
  nextLessonId?: string | null;
};

export default function CompleteLessonButton({
  lessonId,
  courseSlug,
  completed,
  nextLessonId,
}: Props) {
  const router = useRouter();

  const [isComplete, setIsComplete] =
    useState(completed);

  const [courseCompleted, setCourseCompleted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function markComplete() {
    setLoading(true);
    setError("");

    const result = await completeLesson(
      lessonId,
      courseSlug
    );

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ??
          "Unable to save your progress."
      );
      return;
    }

    setIsComplete(true);
    setCourseCompleted(result.courseCompleted);

    router.refresh();
  }

  function continueLearning() {
    if (courseCompleted) {
      router.push(
        `/learn/${courseSlug}/completion`
      );
      return;
    }

    if (nextLessonId) {
      router.push(
        `/learn/${courseSlug}/lesson/${nextLessonId}`
      );
      return;
    }

    router.push(`/learn/${courseSlug}`);
  }

  if (isComplete) {
    return (
      <div style={{ marginTop: "24px" }}>
        <p>
          <strong>
            ✓ Lesson completed
          </strong>
        </p>

        <button
          type="button"
          className="button"
          onClick={continueLearning}
        >
          {courseCompleted
            ? "View Course Completion →"
            : nextLessonId
              ? "Continue to Next Lesson →"
              : "Return to Course →"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      {error && (
        <p
          className="authError"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        className="button"
        onClick={markComplete}
        disabled={loading}
      >
        {loading
          ? "Saving Progress…"
          : nextLessonId
            ? "Mark Complete"
            : "Complete Final Lesson"}
      </button>
    </div>
  );
}
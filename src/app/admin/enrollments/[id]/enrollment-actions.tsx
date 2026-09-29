"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  cancelEnrollment,
  reactivateEnrollment,
} from "./actions";

type Props = {
  enrollmentId: string;
  status: string;
};

export default function EnrollmentActions({
  enrollmentId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    const confirmed = window.confirm(
      "Cancel this enrollment? The learner will lose access to this course until the enrollment is reactivated."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    const result =
      await cancelEnrollment(enrollmentId);

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ??
          "Unable to cancel enrollment."
      );
      return;
    }

    router.refresh();
  }

  async function reactivate() {
    const confirmed = window.confirm(
      "Reactivate this enrollment? The learner will regain access to the course and retain existing progress."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    const result =
      await reactivateEnrollment(enrollmentId);

    setLoading(false);

    if (!result.success) {
      setError(
        result.error ??
          "Unable to reactivate enrollment."
      );
      return;
    }

    router.refresh();
  }

  if (status === "completed") {
    return (
      <p>
        This enrollment is completed and cannot
        be cancelled or reactivated here.
      </p>
    );
  }

  return (
    <div
      style={{
        marginTop: "20px",
        display: "grid",
        gap: "12px",
      }}
    >
      {error && (
        <p className="authError" role="alert">
          {error}
        </p>
      )}

      {status === "active" && (
        <button
          type="button"
          className="button"
          onClick={cancel}
          disabled={loading}
        >
          {loading
            ? "Cancelling…"
            : "Cancel Enrollment"}
        </button>
      )}

      {status === "cancelled" && (
        <button
          type="button"
          className="button"
          onClick={reactivate}
          disabled={loading}
        >
          {loading
            ? "Reactivating…"
            : "Reactivate Enrollment"}
        </button>
      )}
    </div>
  );
}
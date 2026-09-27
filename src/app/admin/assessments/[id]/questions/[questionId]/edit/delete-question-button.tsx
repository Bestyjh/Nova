"use client";

import { useState } from "react";

type Props = {
  action: () => void | Promise<void>;
};

export default function DeleteQuestionButton({
  action,
}: Props) {
  const [confirming, setConfirming] =
    useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className="button"
        onClick={() => setConfirming(true)}
      >
        Delete Question
      </button>
    );
  }

  return (
    <div>
      <p>
        Are you sure you want to delete this
        question? This action cannot be undone.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        <form action={action}>
          <button
            type="submit"
            className="button"
          >
            Yes, Delete
          </button>
        </form>

        <button
          type="button"
          className="button compact"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
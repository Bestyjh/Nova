"use client";

import { useState } from "react";

type DeleteResourceButtonProps = {
  action: () => void | Promise<void>;
};

export default function DeleteResourceButton({
  action,
}: DeleteResourceButtonProps) {
  const [confirming, setConfirming] =
    useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        className="button compact"
        onClick={() => setConfirming(true)}
      >
        Delete Resource
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <span>
        Are you sure you want to delete this
        resource?
      </span>

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
  );
}
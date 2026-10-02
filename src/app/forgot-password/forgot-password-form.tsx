"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const email = String(
      form.get("email") || ""
    ).trim();

    const supabase = createClient();

    const redirectTo =
      `${window.location.origin}/auth/confirm?next=/reset-password`;

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        }
      );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <>
        <p>
          If an account exists for that email address,
          a password reset link has been sent.
        </p>

        <p className="authFine">
          <Link href="/login">
            Return to login
          </Link>
        </p>
      </>
    );
  }

  return (
    <form
      className="formGrid"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="email">
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      {error && (
        <p
          className="authError"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="button authSubmit"
        disabled={loading}
      >
        {loading
          ? "Sending…"
          : "Send reset link"}
      </button>

      <p className="authFine">
        <Link href="/login">
          Back to login
        </Link>
      </p>
    </form>
  );
}
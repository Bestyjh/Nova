"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const password = String(
      form.get("password") || ""
    );

    const confirmPassword = String(
      form.get("confirmPassword") || ""
    );

    if (password.length < 8) {
      setLoading(false);
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError(
        "Your password reset link is invalid or has expired. Request a new one."
      );
      return;
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <form
      className="formGrid"
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label htmlFor="password">
          New password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">
          Confirm new password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
          ? "Updating…"
          : "Update password"}
      </button>
    </form>
  );
}
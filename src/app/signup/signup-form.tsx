"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formElement = event.currentTarget;

  setError("");
  setMessage("");

  const form = new FormData(formElement);

    const firstName = String(form.get("firstName") || "").trim();
    const lastName = String(form.get("lastName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (!firstName || !lastName || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo:
            `${window.location.origin}/auth/confirm`,
        },
      });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your address, then log in to NOVA Learning."
    );

    formElement.reset();
  }

  return (
    <form className="formGrid" onSubmit={handleSubmit}>
      <div className="formGrid two">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            placeholder="First name"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="Last name"
            required
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="confirmPassword">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          minLength={8}
          required
        />
      </div>

      {error && (
        <p className="authError" role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className="authSuccess" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        className="button authSubmit"
        disabled={loading}
      >
        {loading
          ? "Creating account…"
          : "Create Learner Account"}
      </button>

      <p className="authFine">
        Already registered? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
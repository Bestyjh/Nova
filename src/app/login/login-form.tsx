"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
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

    const email = String(
      form.get("email") || ""
    ).trim();

    const password = String(
      form.get("password") || ""
    );

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("Unable to verify your account.");
      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setLoading(false);
      setError(
        "Unable to load your account profile."
      );
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
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

      <div className="field">
        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
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
        {loading ? "Logging in…" : "Log In"}
      </button>

      <p className="authFine">
        New to NOVA Learning?{" "}
        <Link href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}
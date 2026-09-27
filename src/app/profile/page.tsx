import Link from "next/link";
import { redirect } from "next/navigation";

import PortalHeader from "../portal-header";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data/profile";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/login");
  }

  const { data: profile, error } =
    await getProfile(
      supabase,
      userId
    );

  if (error || !profile) {
    console.error(
      "Unable to load profile:",
      error
    );

    throw new Error(
      "Unable to load profile."
    );
  }

  const email =
    userData.user.email ?? "";

  const roleLabel =
    profile.role === "admin"
      ? "Administrator"
      : "Learner";

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <aside className="dashboardSidebar">
          <h3>Learner Portal</h3>

          <nav>
            <Link href="/dashboard">
              Overview
            </Link>

            <Link href="/learn">
              My Learning
            </Link>

            <Link href="/resources">
              Resources
            </Link>

            <Link href="/sessions">
              Sessions
            </Link>

            <Link href="/profile">
              Profile
            </Link>
          </nav>
        </aside>

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA LEARNING
              </p>

              <h1>Profile</h1>

              <p>
                Review and update your NOVA
                learner information.
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              PERSONAL INFORMATION
            </p>

            <h2>
              {profile.first_name}{" "}
              {profile.last_name}
            </h2>

            <form
              action={updateProfile}
              className="formGrid"
            >
              <div className="field">
                <label htmlFor="first_name">
                  First Name
                </label>

                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  defaultValue={
                    profile.first_name
                  }
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="last_name">
                  Last Name
                </label>

                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  defaultValue={
                    profile.last_name
                  }
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                />

                <small>
                  Your login email cannot be
                  changed from this page.
                </small>
              </div>

              <div className="field">
                <label htmlFor="role">
                  Account Role
                </label>

                <input
                  id="role"
                  type="text"
                  value={roleLabel}
                  readOnly
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="button"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
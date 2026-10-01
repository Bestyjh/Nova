import {
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import LearnerPortalShell from "../learner-portal-shell";
import styles from "../learner-portal.module.css";

import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/data/profile";
import { updateProfile } from "./actions";

export default async function ProfilePage() {
  const { supabase, userId } =
    await requireUser();

  const [
    { data: userData, error: userError },
    { data: profile, error: profileError },
  ] = await Promise.all([
    supabase.auth.getUser(),
    getProfile(supabase, userId),
  ]);

  if (userError || !userData.user) {
    throw new Error(
      "Unable to load account information."
    );
  }

  if (profileError || !profile) {
    console.error(
      "Unable to load profile:",
      profileError
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

  const fullName = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = [
    profile.first_name,
    profile.last_name,
  ]
    .filter(Boolean)
    .map((name) =>
      name.trim().charAt(0).toUpperCase()
    )
    .join("")
    .slice(0, 2);

  return (
    <LearnerPortalShell
      firstName={
        profile.first_name || "Learner"
      }
      role={profile.role}
    >
      <section className={styles.welcomeBlock}>
        <span className={styles.courseMeta}>
          NOVA LEARNING
        </span>

        <h1>Profile</h1>

        <p>
          Manage your personal information and
          review your NOVA Learning account
          details.
        </p>
      </section>

      <section className={styles.profileLayout}>
        <aside
          className={styles.profileSummaryCard}
        >
          <div
            className={styles.profileAvatarLarge}
            aria-hidden="true"
          >
            {initials || "NL"}
          </div>

          <div
            className={styles.profileSummaryCopy}
          >
            <span className={styles.courseMeta}>
              NOVA LEARNER
            </span>

            <h2>{fullName || "Learner"}</h2>

            <p>{email}</p>
          </div>

          <div
            className={styles.profileAccountMeta}
          >
            <div>
              <UserRound
                size={19}
                aria-hidden="true"
              />

              <span>
                <small>Account</small>
                <strong>{roleLabel}</strong>
              </span>
            </div>

            <div>
              <Mail
                size={19}
                aria-hidden="true"
              />

              <span>
                <small>Email</small>
                <strong>Verified account</strong>
              </span>
            </div>

            <div>
              <ShieldCheck
                size={19}
                aria-hidden="true"
              />

              <span>
                <small>Access</small>
                <strong>NOVA Learning</strong>
              </span>
            </div>
          </div>
        </aside>

        <section
          className={styles.profileFormCard}
        >
          <div
            className={styles.profileFormHeader}
          >
            <span className={styles.courseMeta}>
              PERSONAL INFORMATION
            </span>

            <h2>Profile Details</h2>

            <p>
              Keep your name and account
              information up to date.
            </p>
          </div>

          <form
            action={updateProfile}
            className={styles.profileForm}
          >
            <div
              className={styles.profileFormGrid}
            >
              <div
                className={styles.profileField}
              >
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
                  autoComplete="given-name"
                  required
                />
              </div>

              <div
                className={styles.profileField}
              >
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
                  autoComplete="family-name"
                  required
                />
              </div>

              <div
                className={styles.profileField}
              >
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className={
                    styles.readOnlyInput
                  }
                />

                <small>
                  Your login email cannot be
                  changed from this page.
                </small>
              </div>

              <div
                className={styles.profileField}
              >
                <label htmlFor="role">
                  Account Role
                </label>

                <input
                  id="role"
                  type="text"
                  value={roleLabel}
                  readOnly
                  className={
                    styles.readOnlyInput
                  }
                />

                <small>
                  Account roles are managed by
                  NOVA.
                </small>
              </div>
            </div>

            <div
              className={styles.profileActions}
            >
              <button
                type="submit"
                className={styles.primaryButton}
              >
                <Save
                  size={17}
                  aria-hidden="true"
                />

                Save Changes
              </button>
            </div>
          </form>
        </section>
      </section>
    </LearnerPortalShell>
  );
}
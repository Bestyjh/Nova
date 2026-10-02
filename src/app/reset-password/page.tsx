import PortalHeader from "../portal-header";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="authPage">
      <PortalHeader />

      <div className="authShell">
        <section className="authIntro">
          <h1>Create a new password.</h1>

          <p>
            Choose a new password for your
            NOVA Learning account.
          </p>
        </section>

        <section className="authPanel">
          <div className="authCard">
            <h2>New Password</h2>

            <p>
              Enter and confirm your new password.
            </p>

            <ResetPasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
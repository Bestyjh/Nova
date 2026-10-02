import PortalHeader from "../portal-header";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="authPage">
      <PortalHeader />

      <div className="authShell">
        <section className="authIntro">
          <h1>Reset your password.</h1>

          <p>
            Enter the email address associated with your
            NOVA Learning account.
          </p>
        </section>

        <section className="authPanel">
          <div className="authCard">
            <h2>Forgot Password</h2>

            <p>
              We&apos;ll send you a secure link to choose
              a new password.
            </p>

            <ForgotPasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
import { BookOpen, LockKeyhole } from "lucide-react";
import PortalHeader from "../portal-header";
import LoginForm from "./login-form";

export default function Login() {
  return (
    <div className="authPage">
      <PortalHeader />

      <div className="authShell">
        <section className="authIntro">
          <h1>Welcome back to NOVA Learning.</h1>

          <p>
            Continue your learning, access program resources
            and keep track of your educational progress.
          </p>

          <div className="authPoints">
            <span>
              <BookOpen size={20} />
              Continue enrolled learning
            </span>

            <span>
              <LockKeyhole size={20} />
              Secure member access
            </span>
          </div>
        </section>

        <section className="authPanel">
          <div className="authCard">
            <h2>Log In</h2>

            <p>Enter your NOVA learner account details.</p>

            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
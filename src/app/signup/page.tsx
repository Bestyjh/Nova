import { BookOpen, Check, Users } from "lucide-react";
import PortalHeader from "../portal-header";
import SignupForm from "./signup-form";

export default function Signup() {
  return (
    <div className="authPage">
      <PortalHeader />

      <div className="authShell">
        <section className="authIntro">
          <h1>Start learning with NOVA.</h1>

          <p>
            Create a learner account to enroll in available programs,
            access educational resources and track your learning journey.
          </p>

          <div className="authPoints">
            <span>
              <Check size={20} />
              Structured learning pathways
            </span>

            <span>
              <BookOpen size={20} />
              Educational resources
            </span>

            <span>
              <Users size={20} />
              Program and coaching support
            </span>
          </div>
        </section>

        <section className="authPanel">
          <div className="authCard">
            <div className="demoNotice">
              NOVA Learning accounts are for educational access.
              Do not submit medical or clinical information here.
            </div>

            <h2>Create Account</h2>
            <p>Join NOVA Learning.</p>

            <SignupForm />
          </div>
        </section>
      </div>
    </div>
  );
}
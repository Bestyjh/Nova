import Link from "next/link";
import { BookOpen } from "lucide-react";
import PortalHeader from "../portal-header";
import { createClient } from "@/lib/supabase/server";

export default async function Learn() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, title, summary")
    .eq("published", true)
    .order("created_at");

  return (
    <div className="learnPage">
      <PortalHeader />

      <section className="catalogHero">
        <div className="wrap">
          <div>
            <span
              className="courseMeta"
              style={{ color: "#bce5c3" }}
            >
              NOVA Learning
            </span>

            <h1>Learn. Apply. Thrive.</h1>

            <p>
              Access NOVA educational programs, structured
              learning pathways and program resources.
            </p>
          </div>

          <div className="statCard">
            <strong>{courses?.length ?? 0}</strong>
            <span>Available learning pathways</span>
          </div>
        </div>
      </section>

      <section className="catalog">
        <div className="wrap">
          <div className="catalogTop">
            <div>
              <span className="courseMeta">
                Course Catalog
              </span>

              <h2>Available Learning</h2>
            </div>
          </div>

          <div className="courseGrid">
            {courses?.map((course) => (
              <article
                className="courseCard"
                key={course.id}
              >
                <div className="courseVisual">
                  <BookOpen />
                </div>

                <div className="courseBody">
                  <span className="courseMeta">
                    NOVA Learning
                  </span>

                  <h3>{course.title}</h3>

                  <p>{course.summary}</p>

                  <div className="courseFoot">
                    <span>Structured learning pathway</span>

                    <Link href={`/learn/${course.slug}`}>
                      View Course →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
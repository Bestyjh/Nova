import {
  Download,
  ExternalLink,
  FileText,
  Globe,
  Video,
} from "lucide-react";

import PortalHeader from "../portal-header";
import { requireUser } from "@/lib/auth/require-user";
import { getLearnerResources } from "@/lib/data/resources";

export default async function ResourcesPage() {
  const { supabase } = await requireUser();

  const { data: resources, error } =
    await getLearnerResources(supabase);

  if (error) {
    console.error(
      "Unable to load learner resources:",
      error
    );
  }

  const resourceList = resources ?? [];

  function resourceIcon(type: string) {
    switch (type) {
      case "video":
        return <Video size={24} />;
      case "website":
        return <Globe size={24} />;
      case "download":
        return <Download size={24} />;
      default:
        return <FileText size={24} />;
    }
  }

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <aside className="dashboardSidebar">
          <h3>Learner Portal</h3>

          <nav>
            <a href="/dashboard">
              Overview
            </a>

            <a href="/learn">
              My Learning
            </a>

            <a href="/resources">
              Resources
            </a>

            <span>Sessions</span>
            <span>Profile</span>
          </nav>
        </aside>

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA LEARNING
              </p>

              <h1>Resources</h1>

              <p>
                Access learning materials,
                downloads and supporting
                resources available to you.
              </p>
            </div>
          </div>

          <section className="learningPanel">
            <p className="eyebrow">
              LEARNING LIBRARY
            </p>

            <h2>Available Resources</h2>

            {resourceList.length === 0 ? (
              <div className="emptyLearning">
                <h3>No resources available</h3>

                <p>
                  Resources available to your
                  learning programs will appear
                  here.
                </p>
              </div>
            ) : (
              <div
                className="courseGrid"
                style={{ marginTop: "24px" }}
              >
                {resourceList.map((resource) => (
                  <article
                    className="courseCard"
                    key={resource.id}
                  >
                    <div className="courseBody">
                      <div
                        style={{
                          marginBottom: "16px",
                        }}
                      >
                        {resourceIcon(
                          resource.resource_type
                        )}
                      </div>

                      <span className="courseMeta">
                        {resource.resource_type}
                      </span>

                      <h3>{resource.title}</h3>

                      <p>
                        {resource.description ||
                          "NOVA learning resource."}
                      </p>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="button"
                      >
                        Open Resource{" "}
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
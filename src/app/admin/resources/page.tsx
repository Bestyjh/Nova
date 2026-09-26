import Link from "next/link";
import {
  BookOpen,
  FileText,
  Globe,
} from "lucide-react";

import AdminSidebar from "../admin-sidebar";
import PortalHeader from "../../portal-header";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminResources } from "@/lib/data/resources";

export default async function AdminResourcesPage() {
  const { supabase } = await requireAdmin();

  const { data: resources, error } =
    await getAdminResources(supabase);

  if (error) {
    console.error(
      "Unable to load admin resources:",
      error
    );
  }

  const resourceList = resources ?? [];

  const publishedCount = resourceList.filter(
    (resource) => resource.published
  ).length;

  const draftCount = resourceList.filter(
    (resource) => !resource.published
  ).length;

  const generalCount = resourceList.filter(
    (resource) => resource.course_id === null
  ).length;

  return (
    <div className="authPage">
      <PortalHeader />

      <main className="dashboardShell">
        <AdminSidebar />

        <section className="dashboardMain">
          <div className="dashboardHeading">
            <div>
              <p className="eyebrow">
                NOVA ADMINISTRATION
              </p>

              <h1>Resources</h1>

              <p>
                Manage learning resources,
                downloads and supporting materials
                for NOVA learners.
              </p>
            </div>

            <Link
              href="/admin/resources/new"
              className="button"
            >
              Add Resource
            </Link>
          </div>

          <div className="dashboardStats">
            <div className="statCard">
              <FileText size={24} />

              <strong>
                {resourceList.length}
              </strong>

              <span>Total resources</span>
            </div>

            <div className="statCard">
              <Globe size={24} />

              <strong>
                {publishedCount}
              </strong>

              <span>Published</span>
            </div>

            <div className="statCard">
              <BookOpen size={24} />

              <strong>
                {generalCount}
              </strong>

              <span>General resources</span>
            </div>
          </div>

          <section className="learningPanel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <p className="eyebrow">
                  RESOURCE MANAGEMENT
                </p>

                <h2>Learning Resources</h2>
              </div>

              <span>
                {draftCount}{" "}
                {draftCount === 1
                  ? "draft"
                  : "drafts"}
              </span>
            </div>

            {resourceList.length === 0 ? (
              <div className="emptyLearning">
                <h3>No resources yet</h3>

                <p>
                  Create the first NOVA learning
                  resource for learners.
                </p>

                <Link
                  href="/admin/resources/new"
                  className="button"
                >
                  Add Resource
                </Link>
              </div>
            ) : (
              <div className="courseGrid">
                {resourceList.map((resource) => (
                  <article
                    className="courseCard"
                    key={resource.id}
                  >
                    <div className="courseBody">
                      <span className="courseMeta">
                        {resource.published
                          ? "PUBLISHED"
                          : "DRAFT"}
                      </span>

                      <h3>{resource.title}</h3>

                      <p>
                        {resource.description ||
                          "No resource description yet."}
                      </p>

                      <div
                        style={{
                          margin: "20px 0",
                        }}
                      >
                        <strong>
                          {resource.resource_type}
                        </strong>

                        <p>
                          {resource.course_id
                            ? "Course resource"
                            : "General resource"}
                        </p>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="button compact"
                      >
                        Open Resource
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
"use client";

import { useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Globe,
  Search,
  Video,
} from "lucide-react";

import LearnerPortalShell from "../learner-portal-shell";
import styles from "../learner-portal.module.css";

type LearnerResource = {
  id: string;
  title: string;
  description: string | null;
  resourceType: string;
  url: string;
};

type ResourcesClientProps = {
  firstName: string;
  role: string | null;
  resources: LearnerResource[];
};

function ResourceIcon({
  type,
}: {
  type: string;
}) {
  switch (type) {
    case "video":
      return <Video size={34} aria-hidden="true" />;

    case "website":
      return <Globe size={34} aria-hidden="true" />;

    case "download":
      return <Download size={34} aria-hidden="true" />;

    default:
      return <FileText size={34} aria-hidden="true" />;
  }
}

function resourceTypeLabel(type: string) {
  switch (type) {
    case "video":
      return "Video";

    case "website":
      return "Website";

    case "download":
      return "Download";

    default:
      return "Learning Resource";
  }
}

export default function ResourcesClient({
  firstName,
  role,
  resources,
}: ResourcesClientProps) {
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredResources = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return resources;
    }

    return resources.filter((resource) => {
      const searchableText = [
        resource.title,
        resource.description ?? "",
        resource.resourceType,
        resourceTypeLabel(
          resource.resourceType
        ),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [resources, searchQuery]);

  return (
    <LearnerPortalShell
      firstName={firstName}
      role={role}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
    >
      <section className={styles.welcomeBlock}>
        <span className={styles.courseMeta}>
          NOVA LEARNING
        </span>

        <h1>Resources</h1>

        <p>
          Access learning materials, downloads
          and supporting resources available to
          your NOVA learning programs.
        </p>
      </section>

      <section className={styles.learningSection}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Learning Library</h2>

            <p>
              Find resources that support your
              learning and help you apply what
              you learn.
            </p>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText
              size={34}
              aria-hidden="true"
            />

            <h3>No resources available</h3>

            <p>
              Resources available to your
              learning programs will appear
              here.
            </p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className={styles.emptyState}>
            <Search
              size={34}
              aria-hidden="true"
            />

            <h3>No resources found</h3>

            <p>
              No resources match
              &ldquo;{searchQuery}&rdquo;. Try
              another search.
            </p>
          </div>
        ) : (
          <div className={styles.courseList}>
            {filteredResources.map(
              (resource) => (
                <article
                  key={resource.id}
                  className={styles.courseRow}
                >
                  <div
                  className={`${styles.courseVisual} ${styles.resourceVisual}`}
                  aria-hidden="true"
                >
                    <ResourceIcon
                      type={
                        resource.resourceType
                      }
                    />
                  </div>

                  <div
                    className={
                      styles.courseContent
                    }
                  >
                    <span
                      className={
                        styles.courseMeta
                      }
                    >
                      {resourceTypeLabel(
                        resource.resourceType
                      )}
                    </span>

                    <h3>{resource.title}</h3>

                    <p>
                      {resource.description ||
                        "NOVA learning resource."}
                    </p>
                  </div>

                  <div
                    className={
                      styles.courseActions
                    }
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        styles.primaryButton
                      }
                    >
                      Open Resource

                      <ExternalLink
                        size={16}
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </LearnerPortalShell>
  );
}
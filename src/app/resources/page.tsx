import ResourcesClient from "./resources-client";

import { requireUser } from "@/lib/auth/require-user";
import { getProfileSummary } from "@/lib/data/profiles";
import { getLearnerResources } from "@/lib/data/resources";

export default async function ResourcesPage() {
  const { supabase, userId } =
    await requireUser();

  const [
    { data: profile, error: profileError },
    { data: resources, error: resourcesError },
  ] = await Promise.all([
    getProfileSummary(supabase, userId),
    getLearnerResources(supabase),
  ]);

  if (profileError) {
    throw new Error(
      "Unable to load learner profile."
    );
  }

  if (resourcesError) {
    console.error(
      "Unable to load learner resources:",
      resourcesError
    );
  }

  const resourceList = (resources ?? []).map(
    (resource) => ({
      id: resource.id,
      title: resource.title,
      description:
        resource.description ?? null,
      resourceType:
        resource.resource_type,
      url: resource.url,
    })
  );

  return (
    <ResourcesClient
      firstName={
        profile?.first_name || "Learner"
      }
      role={profile?.role ?? null}
      resources={resourceList}
    />
  );
}
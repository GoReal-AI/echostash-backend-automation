import { ApiClient } from "../clients/api-client.js";
import { ProjectsClient } from "../clients/projects-client.js";
import { PromptsClient } from "../clients/prompts-client.js";
import { uniqueId } from "../utils/index.js";
import type { Project, Prompt, CreateVersionResponse } from "../types/index.js";

/** IDs of resources created during the test run, for cleanup. */
const createdProjectIds: string[] = [];

/**
 * Create a test project and track it for cleanup.
 */
export async function createTestProject(
  api: ApiClient,
  nameSuffix?: string
): Promise<Project> {
  const client = new ProjectsClient(api);
  const project = await client.create({
    name: `Test Project ${nameSuffix || uniqueId()}`,
    description: "Created by automation tests",
  });
  createdProjectIds.push(project.id);
  return project;
}

/**
 * Create a test prompt in the given project.
 */
export async function createTestPrompt(
  api: ApiClient,
  projectId: number | string,
  overrides?: { name?: string }
): Promise<Prompt> {
  const client = new PromptsClient(api);
  return client.create({
    name: overrides?.name || `Test Prompt ${uniqueId()}`,
    projectId,
  });
}

/**
 * Create a new version for the given prompt.
 */
export async function createTestVersion(
  api: ApiClient,
  promptId: number | string,
  content?: string
): Promise<CreateVersionResponse> {
  const client = new PromptsClient(api);
  return client.createVersion(promptId, {
    content: content || `Updated content ${uniqueId()}`,
    changeMessage: "Automated test version",
  });
}

/**
 * Delete a single project (and all its child resources, per API cascade).
 */
export async function cleanupProject(api: ApiClient, projectId: string): Promise<void> {
  const client = new ProjectsClient(api);
  try {
    await client.delete(projectId);
  } catch {
    // Ignore cleanup failures (resource may already be deleted)
  }
}

/**
 * Delete all projects that were tracked during this test session.
 */
export async function cleanupAll(api: ApiClient): Promise<void> {
  const ids = createdProjectIds.splice(0, createdProjectIds.length);
  for (const id of ids) {
    await cleanupProject(api, id);
  }
}

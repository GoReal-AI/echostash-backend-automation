import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData } from "@fixtures/test-data";
import type { Project, Prompt } from "@api-types/index";

describe("Prompts - Visibility", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
    testPrompt = await prompts.create(promptData(testProject.id));
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("PRMT-011: Set visibility to public", () => {
    it("sets prompt visibility to public", async () => {
      const updated = await prompts.updateVisibility(testPrompt.id, { visibility: "public" });
      expect(updated).toBeDefined();
    });
  });

  describe("PRMT-012: Set visibility to private", () => {
    it("sets prompt visibility to private", async () => {
      const updated = await prompts.updateVisibility(testPrompt.id, { visibility: "private" });
      expect(updated).toBeDefined();
    });
  });

  describe("Access Control", () => {
    it("another user cannot access a private prompt", async () => {
      // Ensure private
      await prompts.updateVisibility(testPrompt.id, { visibility: "private" });

      const otherApi = await getGuestClient();
      const otherPrompts = new PromptsClient(otherApi);

      try {
        await otherPrompts.get(testPrompt.id);
        expect.fail("Expected 403 or 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([403, 404]).toContain(error.response?.status);
      }
    });
  });
});

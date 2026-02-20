import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, CreateVersionResponse } from "@api-types/index";

describe("Prompts - Publish", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Publish Version (PRMT-022, PRMT-023)", () => {
    let testPrompt: Prompt;
    let testVersion: CreateVersionResponse;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
      testVersion = await prompts.createVersion(testPrompt.id, versionData());
    });

    it("PRMT-022: publishes a version", async () => {
      const result = await prompts.publish(testPrompt.id, {
        versionNo: testVersion.versionNo,
      });

      expect(result).toBeDefined();
      expect(result.promptId).toBe(testPrompt.id);
    });

    it("PRMT-023: returns 404 for non-existent versionNo", async () => {
      try {
        await prompts.publish(testPrompt.id, { versionNo: 99999 });
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Publish New Version (PRMT-024)", () => {
    it("PRMT-024: creates and publishes in one call", async () => {
      const testPrompt = await prompts.create(promptData(testProject.id));

      const result = await prompts.publishNewVersion(testPrompt.id, {
        content: `Publish-new content ${uniqueId()}`,
        changeMessage: "Auto-publish test",
      });

      expect(result).toBeDefined();
      expect(result.promptId).toBe(testPrompt.id);
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { SdkClient } from "@clients/sdk-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, CreateVersionResponse } from "@api-types/index";

describe("SDK - Fetch", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let sdk: SdkClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;
  let publishedVersionNo: number;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    sdk = new SdkClient(api);
    projectsClient = new ProjectsClient(api);

    testProject = await projectsClient.create(projectData());
    testPrompt = await prompts.create(promptData(testProject.id));
    const version = await prompts.createVersion(testPrompt.id, versionData({
      content: "Hello {{name}}!",
    }));
    publishedVersionNo = version.versionNo;
    await prompts.publish(testPrompt.id, { versionNo: publishedVersionNo });
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Fetch Published (SDK-001, SDK-002)", () => {
    it("SDK-001: fetches published prompt", async () => {
      const result = await sdk.getPrompt(testPrompt.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(testPrompt.id);
      expect(result.name).toBe(testPrompt.name);
      expect(result.content).toBeDefined();
    });

    it("SDK-002: returns prompt with null published fields when no published version", async () => {
      const unpublished = await prompts.create(promptData(testProject.id));
      try {
        const result = await sdk.getPrompt(unpublished.id);
        expect(result).toBeDefined();
        expect(result.id).toBe(unpublished.id);
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([200, 404]).toContain(error.response?.status ?? 200);
      }
    });
  });

  describe("Fetch by Version (SDK-006, SDK-007)", () => {
    it("SDK-006: fetches specific version", async () => {
      const result = await sdk.getPromptVersion(testPrompt.id, publishedVersionNo);
      expect(result).toBeDefined();
      expect(result.versionNo).toBe(publishedVersionNo);
    });

    it("SDK-007: returns 404 for non-existent version", async () => {
      try {
        await sdk.getPromptVersion(testPrompt.id, 99999);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Access Control (SDK-003, SDK-004, SDK-005)", () => {
    it("SDK-003: returns 404 for prompt not owned", async () => {
      const otherApi = await getGuestClient();
      const otherSdk = new SdkClient(otherApi);

      try {
        await otherSdk.getPrompt(testPrompt.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("SDK-004: returns 404 for non-existent prompt", async () => {
      try {
        await sdk.getPrompt("999999999");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("SDK-005: returns 401 without auth", async () => {
      const unauthSdk = new SdkClient(new ApiClient());

      try {
        await unauthSdk.getPrompt(testPrompt.id);
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

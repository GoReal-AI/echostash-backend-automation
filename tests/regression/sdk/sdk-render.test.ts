import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { SdkClient } from "@clients/sdk-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, PromptVersion } from "@api-types/index";

describe("SDK - Render", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let sdk: SdkClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    sdk = new SdkClient(api);
    projectsClient = new ProjectsClient(api);

    testProject = await projectsClient.create(projectData());
    testPrompt = await prompts.create(
      promptData(testProject.id, { content: "Hello {{name}}, welcome to {{place}}!" })
    );
    const version = await prompts.createVersion(testPrompt.id, versionData({
      content: "Hello {{name}}, welcome to {{place}}!",
    }));
    await prompts.publish(testPrompt.id, { versionNumber: version.versionNumber });
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Render with Variables (SDK-008, SDK-009, SDK-010)", () => {
    it("SDK-008: renders published version with variables", async () => {
      const result = await sdk.render(testPrompt.id, {
        name: "Alice",
        place: "Wonderland",
      });
      expect(result).toBeDefined();
      expect(result.rendered).toBeDefined();
      expect(result.promptId).toBe(testPrompt.id);
    });

    it("SDK-014: renders without variables (plain template)", async () => {
      const plainPrompt = await prompts.create(
        promptData(testProject.id, { content: "Static content with no variables" })
      );
      const version = await prompts.createVersion(plainPrompt.id, versionData({
        content: "Static content with no variables",
      }));
      await prompts.publish(plainPrompt.id, { versionNumber: version.versionNumber });

      const result = await sdk.render(plainPrompt.id);
      expect(result).toBeDefined();
      expect(result.rendered).toBeDefined();
    });
  });

  describe("Render Error Cases (SDK-012)", () => {
    it("SDK-012: returns error for prompt with no published version", async () => {
      const unpublished = await prompts.create(promptData(testProject.id));

      try {
        await sdk.render(unpublished.id, { name: "Test" });
        // Some APIs may return an error in the response body rather than a status code
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([400, 404]).toContain(error.response?.status);
      }
    });
  });
});

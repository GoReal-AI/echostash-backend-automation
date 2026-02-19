import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { SdkClient } from "@clients/sdk-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt } from "@api-types/index";

describe("SDK - Batch Render", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let sdk: SdkClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let prompt1: Prompt;
  let prompt2: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    sdk = new SdkClient(api);
    projectsClient = new ProjectsClient(api);

    testProject = await projectsClient.create(projectData());

    // Create and publish two prompts
    prompt1 = await prompts.create(promptData(testProject.id, { content: "Prompt1 {{name}}" }));
    const v1 = await prompts.createVersion(prompt1.id, versionData({ content: "Prompt1 {{name}}" }));
    await prompts.publish(prompt1.id, { versionNumber: v1.versionNumber });

    prompt2 = await prompts.create(promptData(testProject.id, { content: "Prompt2 {{name}}" }));
    const v2 = await prompts.createVersion(prompt2.id, versionData({ content: "Prompt2 {{name}}" }));
    await prompts.publish(prompt2.id, { versionNumber: v2.versionNumber });
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Valid Batch (SDK-016)", () => {
    it("SDK-016: batch renders 2 prompts", async () => {
      const results = await sdk.batchRender([
        { promptId: prompt1.id, variables: { name: "Alice" } },
        { promptId: prompt2.id, variables: { name: "Bob" } },
      ]);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
    });
  });

  describe("Mixed Results (SDK-017)", () => {
    it("SDK-017: batch with one valid and one non-existent prompt", async () => {
      try {
        const results = await sdk.batchRender([
          { promptId: prompt1.id, variables: { name: "Alice" } },
          { promptId: "non-existent-" + uniqueId(), variables: { name: "Ghost" } },
        ]);
        // The batch may still return partial results
        expect(results).toBeDefined();
      } catch (err: unknown) {
        // Some APIs may reject the entire batch
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
      }
    });
  });

  describe("Over Limit (SDK-019)", () => {
    it("SDK-019: rejects batch with more than 50 items", async () => {
      const items = Array.from({ length: 51 }, (_, i) => ({
        promptId: prompt1.id,
        variables: { name: `User${i}` },
      }));

      try {
        await sdk.batchRender(items);
        expect.fail("Expected 400 for exceeding batch limit");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(400);
      }
    });
  });

  describe("Empty Batch (SDK-020)", () => {
    it("SDK-020: rejects batch with empty items array", async () => {
      try {
        await sdk.batchRender([]);
        expect.fail("Expected 400 for empty batch");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(400);
      }
    });
  });
});

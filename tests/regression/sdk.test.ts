import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { SdkClient } from "@clients/sdk-client";
import { KeysClient } from "@clients/keys-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt } from "../../src/types/index.js";

describe("SDK Endpoints", () => {
  let jwtApi: ApiClient;
  let sdkApi: ApiClient;
  let sdkClient: SdkClient;
  let testProject: Project;
  let testPrompt: Prompt;
  let apiKeyId: string;

  beforeAll(async () => {
    jwtApi = await getGuestClient();

    // Create an API key for SDK access
    const keysClient = new KeysClient(jwtApi);
    const apiKey = await keysClient.create(`sdk-test-${uniqueId()}`);
    apiKeyId = apiKey.id;
    sdkApi = new ApiClient({ apiKey: apiKey.key! });
    sdkClient = new SdkClient(sdkApi);

    // Create test data
    const projectsClient = new ProjectsClient(jwtApi);
    testProject = await projectsClient.create(projectData());

    const promptsClient = new PromptsClient(jwtApi);
    testPrompt = await promptsClient.create(
      promptData(testProject.id, {
        content: "Hello {{name}}, welcome to {{place}}!",
      })
    );

    // Create a second version
    await promptsClient.createVersion(testPrompt.id, versionData({ content: "Goodbye {{name}}!" }));
  });

  afterAll(async () => {
    try {
      await new KeysClient(jwtApi).revoke(apiKeyId);
    } catch { /* ignore */ }
    try {
      await new ProjectsClient(jwtApi).delete(testProject.id);
    } catch { /* ignore */ }
  });

  describe("Get Prompt", () => {
    it("fetches a prompt by ID", async () => {
      const result = await sdkClient.getPrompt(testPrompt.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(testPrompt.id);
      expect(result.name).toBe(testPrompt.name);
      expect(result.content).toBeDefined();
    });

    it("returns 404 for non-existent prompt", async () => {
      try {
        await sdkClient.getPrompt("non-existent-id-000");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Get Prompt Version", () => {
    it("fetches a specific version of a prompt", async () => {
      const result = await sdkClient.getPromptVersion(testPrompt.id, 1);
      expect(result).toBeDefined();
      expect(result.id).toBe(testPrompt.id);
    });
  });

  describe("Render", () => {
    it("renders a prompt with variables", async () => {
      const result = await sdkClient.render(testPrompt.id, {
        name: "Alice",
        place: "Wonderland",
      });
      expect(result).toBeDefined();
      expect(result.rendered).toBeDefined();
      expect(result.rendered).toContain("Alice");
      expect(result.rendered).toContain("Wonderland");
      expect(result.promptId).toBe(testPrompt.id);
    });

    it("renders a prompt without variables (raw content)", async () => {
      const result = await sdkClient.render(testPrompt.id);
      expect(result).toBeDefined();
      expect(result.rendered).toBeDefined();
    });
  });

  describe("Batch Render", () => {
    it("renders multiple prompts in a single request", async () => {
      const results = await sdkClient.batchRender([
        { promptId: testPrompt.id, variables: { name: "Alice", place: "Wonderland" } },
        { promptId: testPrompt.id, variables: { name: "Bob", place: "Earth" } },
      ]);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results[0].rendered).toContain("Alice");
      expect(results[1].rendered).toContain("Bob");
    });

    it("returns error for non-existent prompt in batch", async () => {
      try {
        await sdkClient.batchRender([
          { promptId: "non-existent-id", variables: {} },
        ]);
        expect.fail("Expected error for non-existent prompt");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });
});

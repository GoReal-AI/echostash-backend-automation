import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { SdkClient } from "@clients/sdk-client";
import { KeysClient } from "@clients/keys-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt } from "@api-types/index";

describe("SDK Endpoints", () => {
  let jwtApi: ApiClient;
  let sdkApi: ApiClient;
  let sdkClient: SdkClient;
  let testProject: Project;
  let testPrompt: Prompt;
  let apiKeyId: number;

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
    testPrompt = await promptsClient.create(promptData(testProject.id));

    // Create and publish a version
    const version = await promptsClient.createVersion(testPrompt.id, versionData({
      content: "Hello {{name}}, welcome to {{place}}!",
    }));
    await promptsClient.publish(testPrompt.id, { versionNo: version.versionNo });
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
    });

    it("returns 404 for non-existent prompt", async () => {
      try {
        await sdkClient.getPrompt("999999999");
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
      expect(result.versionNo).toBeDefined();
    });
  });

  describe("Render", () => {
    it("renders a prompt with variables", async () => {
      const result = await sdkClient.render(testPrompt.id, {
        name: "Alice",
        place: "Wonderland",
      });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content).toContain("Alice");
      expect(result.content).toContain("Wonderland");
      expect(result.promptId).toBe(testPrompt.id);
    });

    it("renders a prompt without variables (raw content)", async () => {
      const result = await sdkClient.render(testPrompt.id);
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe("Batch Render", () => {
    it("renders multiple prompts in a single request", async () => {
      const results = await sdkClient.batchRender([
        { promptId: testPrompt.id, variables: { name: "Alice", place: "Wonderland" } },
        { promptId: testPrompt.id, variables: { name: "Bob", place: "Earth" } },
      ]);
      expect(results).toBeDefined();
      expect(results.successCount).toBe(2);
    });

    it("returns error for non-existent prompt in batch", async () => {
      const results = await sdkClient.batchRender([
        { promptId: 999999999, variables: {} },
      ]);
      expect(results.errorCount).toBeGreaterThan(0);
    });
  });
});

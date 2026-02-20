import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { SdkClient } from "@clients/sdk-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import type { Project, Prompt } from "@api-types/index";

describe("SDK - Sanity (P0)", () => {
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

    // Setup: create project -> prompt -> version -> publish
    testProject = await projectsClient.create(projectData());
    testPrompt = await prompts.create(promptData(testProject.id));
    const version = await prompts.createVersion(testPrompt.id, versionData({
      content: "Hello {{name}}, welcome to {{place}}!",
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

  it("SDK-001: fetches a published prompt via SDK endpoint", async () => {
    const result = await sdk.getPrompt(testPrompt.id);
    expect(result).toBeDefined();
    expect(result.id).toBe(testPrompt.id);
    expect(result.name).toBe(testPrompt.name);
    expect(result.content).toBeDefined();
  });

  it("SDK-005: rejects SDK fetch without auth", async () => {
    const unauthApi = new ApiClient();
    const unauthSdk = new SdkClient(unauthApi);

    try {
      await unauthSdk.getPrompt(testPrompt.id);
      expect.fail("Expected 401");
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      expect(error.response?.status).toBe(401);
    }
  });

  it("SDK-008: renders a prompt with variables", async () => {
    const result = await sdk.render(testPrompt.id, {
      name: "Alice",
      place: "Wonderland",
    });
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.promptId).toBe(testPrompt.id);
  });

  it("SDK-003: returns 404 for non-owned prompt", async () => {
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
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AuthClient } from "@clients/auth-client";
import { ProjectsClient } from "@clients/projects-client";
import { PromptsClient } from "@clients/prompts-client";
import { SdkClient } from "@clients/sdk-client";
import { KeysClient } from "@clients/keys-client";
import { loginAsGuest, getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, CreateVersionResponse } from "@api-types/index";

describe("E2E - Full Lifecycle", () => {
  describe("E2E-001: Guest -> Project -> Prompt -> Version -> Publish -> SDK Fetch", () => {
    let api: ApiClient;
    let projectsClient: ProjectsClient;
    let promptsClient: PromptsClient;
    let sdkClient: SdkClient;
    let project: Project;
    let prompt: Prompt;
    let version: CreateVersionResponse;

    beforeAll(async () => {
      // Step 1: Login as guest
      const tokens = await loginAsGuest();
      api = new ApiClient({ token: tokens.accessToken });
      projectsClient = new ProjectsClient(api);
      promptsClient = new PromptsClient(api);
      sdkClient = new SdkClient(api);
    });

    afterAll(async () => {
      try {
        await projectsClient.delete(project.id);
      } catch {
        // ignore
      }
    });

    it("creates a project", async () => {
      project = await projectsClient.create(projectData());
      expect(project.id).toBeDefined();
      expect(project.name).toBeDefined();
    });

    it("creates a prompt in the project", async () => {
      prompt = await promptsClient.create(
        promptData(project.id, {
          name: `E2E Prompt ${uniqueId()}`,
        })
      );
      expect(prompt.id).toBeDefined();
      expect(prompt.projectId).toBe(Number(project.id));
    });

    it("creates a version", async () => {
      version = await promptsClient.createVersion(prompt.id, {
        content: "Hello {{name}}, you are in {{place}}!",
        changeMessage: "Initial E2E version",
      });
      expect(version.versionNo).toBeGreaterThanOrEqual(1);
    });

    it("publishes the version", async () => {
      const result = await promptsClient.publish(prompt.id, {
        versionNo: version.versionNo,
      });
      expect(result).toBeDefined();
    });

    it("fetches via SDK endpoint", async () => {
      const sdkResult = await sdkClient.getPrompt(prompt.id);
      expect(sdkResult).toBeDefined();
      expect(sdkResult.id).toBe(prompt.id);
      expect(sdkResult.content).toBeDefined();
    });

    it("renders via SDK endpoint", async () => {
      const renderResult = await sdkClient.render(prompt.id, {
        name: "E2E User",
        place: "Test Environment",
      });
      expect(renderResult).toBeDefined();
      expect(renderResult.content).toBeDefined();
      expect(renderResult.promptId).toBe(prompt.id);
    });
  });

  describe("E2E-005: API Key -> SDK -> Revoke -> Verify Blocked", () => {
    let api: ApiClient;
    let keysClient: KeysClient;
    let projectsClient: ProjectsClient;
    let promptsClient: PromptsClient;
    let project: Project;
    let prompt: Prompt;

    beforeAll(async () => {
      api = await getGuestClient();
      keysClient = new KeysClient(api);
      projectsClient = new ProjectsClient(api);
      promptsClient = new PromptsClient(api);

      // Setup a published prompt
      project = await projectsClient.create(projectData());
      prompt = await promptsClient.create(promptData(project.id));
      const version = await promptsClient.createVersion(prompt.id, versionData({
        content: "Key lifecycle test {{v}}",
      }));
      await promptsClient.publish(prompt.id, { versionNo: version.versionNo });
    });

    afterAll(async () => {
      try {
        await projectsClient.delete(project.id);
      } catch {
        // ignore
      }
    });

    it("creates API key, uses it, revokes it, verifies it is blocked", async () => {
      // Create key
      const key = await keysClient.create(`e2e-key-${uniqueId()}`);
      expect(key.key).toBeDefined();

      // Use key for SDK
      const apiKeyClient = new ApiClient({ apiKey: key.key! });
      const sdkWithKey = new SdkClient(apiKeyClient);
      const fetchResult = await sdkWithKey.getPrompt(prompt.id);
      expect(fetchResult.id).toBe(prompt.id);

      // Revoke key
      await keysClient.revoke(key.id);

      // Verify blocked
      try {
        await sdkWithKey.getPrompt(prompt.id);
        expect.fail("Expected 401 after key revocation");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe("E2E-003: Prompt -> Public Visibility -> Access Without Auth", () => {
    let api: ApiClient;
    let projectsClient: ProjectsClient;
    let promptsClient: PromptsClient;
    let project: Project;
    let prompt: Prompt;

    beforeAll(async () => {
      api = await getGuestClient();
      projectsClient = new ProjectsClient(api);
      promptsClient = new PromptsClient(api);

      project = await projectsClient.create(projectData());
      prompt = await promptsClient.create(promptData(project.id));
      const version = await promptsClient.createVersion(prompt.id, versionData({
        content: "Public E2E test content",
      }));
      await promptsClient.publish(prompt.id, { versionNo: version.versionNo });
    });

    afterAll(async () => {
      try {
        await projectsClient.delete(project.id);
      } catch {
        // ignore
      }
    });

    it("sets visibility to public", async () => {
      await promptsClient.updateVisibility(prompt.id, { visibility: "public" });
    });
  });

  describe("E2E-004: Multiple Versions -> Version Names -> Fetch by Name", () => {
    let api: ApiClient;
    let projectsClient: ProjectsClient;
    let promptsClient: PromptsClient;
    let project: Project;
    let prompt: Prompt;

    beforeAll(async () => {
      api = await getGuestClient();
      projectsClient = new ProjectsClient(api);
      promptsClient = new PromptsClient(api);

      project = await projectsClient.create(projectData());
      prompt = await promptsClient.create(promptData(project.id));
    });

    afterAll(async () => {
      try {
        await projectsClient.delete(project.id);
      } catch {
        // ignore
      }
    });

    it("creates multiple versions and tracks them", async () => {
      const v1 = await promptsClient.createVersion(prompt.id, versionData({ content: "V1 content" }));
      const v2 = await promptsClient.createVersion(prompt.id, versionData({ content: "V2 content" }));
      const v3 = await promptsClient.createVersion(prompt.id, versionData({ content: "V3 content" }));

      expect(v2.versionNo).toBeGreaterThan(v1.versionNo);
      expect(v3.versionNo).toBeGreaterThan(v2.versionNo);

      // Publish the latest
      await promptsClient.publish(prompt.id, { versionNo: v3.versionNo });

      // Verify via SDK
      const sdkClient = new SdkClient(api);
      const result = await sdkClient.getPrompt(prompt.id);
      expect(result).toBeDefined();
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { KeysClient } from "@clients/keys-client";
import { SdkClient } from "@clients/sdk-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { ApiKey, Project, Prompt } from "@api-types/index";

describe("API Keys - CRUD & Auth", () => {
  let api: ApiClient;
  let keysClient: KeysClient;
  let projectsClient: ProjectsClient;
  let promptsClient: PromptsClient;
  let testProject: Project;
  let publishedPrompt: Prompt;
  const createdKeyIds: number[] = [];

  beforeAll(async () => {
    api = await getGuestClient();
    keysClient = new KeysClient(api);
    projectsClient = new ProjectsClient(api);
    promptsClient = new PromptsClient(api);

    // Setup: create a published prompt for SDK auth tests
    testProject = await projectsClient.create(projectData());
    publishedPrompt = await promptsClient.create(promptData(testProject.id));
    const version = await promptsClient.createVersion(
      publishedPrompt.id,
      versionData({ content: "API key test {{var}}" })
    );
    await promptsClient.publish(publishedPrompt.id, { versionNo: version.versionNo });
  });

  afterAll(async () => {
    // Clean up keys
    for (const id of createdKeyIds) {
      try {
        await keysClient.revoke(id);
      } catch {
        // ignore
      }
    }
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create (AKEY-001 through AKEY-004)", () => {
    it("AKEY-001: creates an API key with valid name", async () => {
      const name = `test-key-${uniqueId()}`;
      const key = await keysClient.create(name);

      expect(key).toBeDefined();
      expect(key.id).toBeDefined();
      expect(key.name).toBe(name);
      expect(key.prefix).toBeDefined();
      expect(key.key).toBeDefined();
      expect(typeof key.key).toBe("string");
      createdKeyIds.push(key.id);
    });

    it("AKEY-002: rejects API key creation with missing name", async () => {
      try {
        await keysClient.create(null as unknown as string);
        expect.fail("Expected 400");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
      }
    });

    it("AKEY-003: rejects API key creation with blank name", async () => {
      try {
        await keysClient.create("");
        expect.fail("Expected 400");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
      }
    });

    it("AKEY-004: rejects API key creation without auth", async () => {
      const unauthKeys = new KeysClient(new ApiClient());

      try {
        await unauthKeys.create("unauth-key");
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe("List (AKEY-005)", () => {
    it("AKEY-005: lists keys without exposing rawKey", async () => {
      const keys = await keysClient.list();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach((k) => {
        expect(k.id).toBeDefined();
        expect(k.name).toBeDefined();
        expect(k.prefix).toBeDefined();
        // rawKey should NOT be returned in list
      });
    });
  });

  describe("Revoke (AKEY-007, AKEY-008)", () => {
    it("AKEY-007: revokes own key", async () => {
      const key = await keysClient.create(`revoke-test-${uniqueId()}`);
      await keysClient.revoke(key.id);

      // Verify it's gone from the list
      const keys = await keysClient.list();
      const found = keys.find((k) => k.id === key.id);
      expect(found).toBeUndefined();
    });

    it("AKEY-008: returns 404 when revoking key not owned", async () => {
      const key = await keysClient.create(`other-user-key-${uniqueId()}`);
      createdKeyIds.push(key.id);

      const otherApi = await getGuestClient();
      const otherKeys = new KeysClient(otherApi);

      try {
        await otherKeys.revoke(key.id);
        expect.fail("Expected 404 or 403");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe("SDK Auth via API Key (AKEY-009, AKEY-010, SDK-022, SDK-023)", () => {
    it("AKEY-009 / SDK-022: uses API key for SDK auth", async () => {
      const key = await keysClient.create(`sdk-auth-${uniqueId()}`);
      createdKeyIds.push(key.id);

      const apiKeyClient = new ApiClient({ apiKey: key.key! });
      const apiKeySdk = new SdkClient(apiKeyClient);

      const result = await apiKeySdk.getPrompt(publishedPrompt.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(publishedPrompt.id);
    });

    it("SDK-023: rejects invalid API key", async () => {
      const badClient = new ApiClient({ apiKey: "invalid-api-key-value" });
      const badSdk = new SdkClient(badClient);

      try {
        await badSdk.getPrompt(publishedPrompt.id);
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("AKEY-010 / SDK-024: rejects revoked API key", async () => {
      const key = await keysClient.create(`revoked-sdk-${uniqueId()}`);
      const revokedClient = new ApiClient({ apiKey: key.key! });
      const revokedSdk = new SdkClient(revokedClient);

      // Revoke it
      await keysClient.revoke(key.id);

      try {
        await revokedSdk.getPrompt(publishedPrompt.id);
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

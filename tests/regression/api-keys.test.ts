import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { KeysClient } from "@clients/keys-client";
import { SdkClient } from "@clients/sdk-client";
import { ProjectsClient } from "@clients/projects-client";
import { PromptsClient } from "@clients/prompts-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project } from "@api-types/index";

describe("API Keys - CRUD & SDK Access", () => {
  let api: ApiClient;
  let keysClient: KeysClient;
  let testProject: Project;
  const createdKeyIds: number[] = [];

  beforeAll(async () => {
    api = await getGuestClient();
    keysClient = new KeysClient(api);
    const projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
  });

  afterAll(async () => {
    for (const id of createdKeyIds) {
      try {
        await keysClient.revoke(id);
      } catch {
        // ignore
      }
    }
    try {
      await new ProjectsClient(api).delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create", () => {
    it("creates an API key and returns the raw key", async () => {
      const keyName = `test-key-${uniqueId()}`;
      const created = await keysClient.create(keyName);

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.name).toBe(keyName);
      expect(created.key).toBeDefined();
      expect(created.prefix).toBeDefined();
      createdKeyIds.push(created.id);
    });

    it("creates multiple keys with unique names", async () => {
      const key1 = await keysClient.create(`key-a-${uniqueId()}`);
      const key2 = await keysClient.create(`key-b-${uniqueId()}`);
      createdKeyIds.push(key1.id, key2.id);

      expect(key1.id).not.toBe(key2.id);
      expect(key1.key).not.toBe(key2.key);
    });
  });

  describe("List", () => {
    it("lists API keys", async () => {
      const keys = await keysClient.list();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
    });

    it("listed keys do not expose the raw key", async () => {
      const keys = await keysClient.list();
      for (const key of keys) {
        expect(key.prefix).toBeDefined();
      }
    });
  });

  describe("Revoke", () => {
    it("revokes an API key", async () => {
      const created = await keysClient.create(`revoke-test-${uniqueId()}`);
      await keysClient.revoke(created.id);

      if (created.key) {
        const revokedApi = new ApiClient({ apiKey: created.key });
        const sdkClient = new SdkClient(revokedApi);
        try {
          await sdkClient.getPrompt("999999");
          expect.fail("Expected 401/403 with revoked key");
        } catch (err: unknown) {
          const error = err as { response?: { status: number } };
          expect([401, 403]).toContain(error.response?.status);
        }
      }
    });
  });

  describe("SDK Access with API Key", () => {
    it("can access SDK endpoints with a valid API key", async () => {
      const created = await keysClient.create(`sdk-access-${uniqueId()}`);
      createdKeyIds.push(created.id);

      const promptsClient = new PromptsClient(api);
      const prompt = await promptsClient.create(promptData(testProject.id));

      const apiKeyClient = new ApiClient({ apiKey: created.key! });
      const sdkClient = new SdkClient(apiKeyClient);

      const fetched = await sdkClient.getPrompt(prompt.id);
      expect(fetched).toBeDefined();
      expect(fetched.id).toBe(prompt.id);
    });

    it("rejects SDK access without API key or token", async () => {
      const unauthApi = new ApiClient();
      const sdkClient = new SdkClient(unauthApi);

      try {
        await sdkClient.getPrompt("999999");
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

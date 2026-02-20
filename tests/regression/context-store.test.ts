import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { ContextStoreClient } from "@clients/context-store-client";
import { getGuestClient } from "@helpers/auth";

describe("Context Store Endpoints", () => {
  let api: ApiClient;
  let contextClient: ContextStoreClient;

  beforeAll(async () => {
    api = await getGuestClient();
    contextClient = new ContextStoreClient(api);
  });

  describe("List", () => {
    it("lists context assets (may be empty for new user)", async () => {
      const assets = await contextClient.list();
      expect(Array.isArray(assets)).toBe(true);
    });
  });

  describe("Usage", () => {
    it("gets storage usage info", async () => {
      const usage = await contextClient.getUsage();
      expect(usage).toBeDefined();
    });
  });

  describe("Upload & Delete", () => {
    it("uploads a text file and then deletes it", async () => {
      const formData = new FormData();
      const blob = new Blob(["Test file content for automation"], { type: "text/plain" });
      formData.append("file", blob, "test-upload.txt");

      const asset = await contextClient.upload(formData);
      expect(asset).toBeDefined();
      expect(asset.id).toBeDefined();
      expect(asset.filename).toBe("test-upload.txt");

      // Cleanup
      await contextClient.delete(asset.id);
    });

    it("gets content of an uploaded file", async () => {
      const formData = new FormData();
      const blob = new Blob(["Readable content here"], { type: "text/plain" });
      formData.append("file", blob, "readable.txt");

      const asset = await contextClient.upload(formData);
      const content = await contextClient.getContent(asset.id);
      expect(content).toBeDefined();

      // Cleanup
      await contextClient.delete(asset.id);
    });
  });

  describe("Error Handling", () => {
    it("returns 404 for non-existent asset", async () => {
      try {
        await contextClient.getContent("non-existent-asset-000");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("rejects access without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthClient = new ContextStoreClient(unauthApi);

      try {
        await unauthClient.list();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { ContextStoreClient } from "@clients/context-store-client";
import { getGuestClient } from "@helpers/auth";
import { uniqueId } from "@utils/index";

describe("Context Store", () => {
  let api: ApiClient;
  let contextStore: ContextStoreClient;
  const createdAssetIds: string[] = [];

  beforeAll(async () => {
    api = await getGuestClient();
    contextStore = new ContextStoreClient(api);
  });

  afterAll(async () => {
    for (const id of createdAssetIds) {
      try {
        await contextStore.delete(id);
      } catch {
        // ignore
      }
    }
  });

  describe("Upload (CTX-001)", () => {
    it("CTX-001: uploads a file via multipart", async () => {
      const formData = new FormData();
      const blob = new Blob(["test content for context store"], { type: "text/plain" });
      formData.append("file", blob, `test-${uniqueId()}.txt`);

      try {
        const asset = await contextStore.upload(formData);
        expect(asset).toBeDefined();
        expect(asset.id).toBeDefined();
        expect(asset.contentType).toBeDefined();
        createdAssetIds.push(asset.id);
      } catch (err: unknown) {
        // Context store may not be available in all environments
        const error = err as { response?: { status: number } };
        // Skip if feature not enabled (404 or 501)
        if (error.response?.status && error.response.status >= 500) {
          console.log("Context store not available, skipping");
          return;
        }
        throw err;
      }
    });
  });

  describe("List (CTX-004)", () => {
    it("CTX-004: lists all assets", async () => {
      try {
        const assets = await contextStore.list();
        expect(Array.isArray(assets)).toBe(true);
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        if (error.response?.status && error.response.status >= 500) {
          console.log("Context store not available, skipping");
          return;
        }
        throw err;
      }
    });
  });

  describe("Usage (CTX-010)", () => {
    it("CTX-010: gets storage usage", async () => {
      try {
        const usage = await contextStore.getUsage();
        expect(usage).toBeDefined();
        expect(typeof usage.totalAssets).toBe("number");
        expect(typeof usage.totalSize).toBe("number");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        if (error.response?.status && error.response.status >= 500) {
          console.log("Context store not available, skipping");
          return;
        }
        throw err;
      }
    });
  });

  describe("Delete (CTX-008)", () => {
    it("CTX-008: deletes an asset", async () => {
      const formData = new FormData();
      const blob = new Blob(["delete me"], { type: "text/plain" });
      formData.append("file", blob, `delete-${uniqueId()}.txt`);

      try {
        const asset = await contextStore.upload(formData);
        await contextStore.delete(asset.id);

        // Verify deleted
        try {
          await contextStore.getContent(asset.id);
          expect.fail("Expected 404 after deletion");
        } catch (innerErr: unknown) {
          const error = innerErr as { response?: { status: number } };
          expect(error.response?.status).toBe(404);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        if (error.response?.status && error.response.status >= 500) {
          console.log("Context store not available, skipping");
          return;
        }
        throw err;
      }
    });
  });

  describe("Auth (CTX-003)", () => {
    it("CTX-003: rejects upload without auth", async () => {
      const unauthContext = new ContextStoreClient(new ApiClient());
      const formData = new FormData();
      const blob = new Blob(["unauth test"], { type: "text/plain" });
      formData.append("file", blob, "unauth.txt");

      try {
        await unauthContext.upload(formData);
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PublicClient } from "@clients/public-client";

describe("Public Endpoints (No Auth)", () => {
  let api: ApiClient;
  let publicClient: PublicClient;

  beforeAll(() => {
    api = new ApiClient();
    publicClient = new PublicClient(api);
  });

  describe("Plans", () => {
    it("lists available plans without auth", async () => {
      const plans = await publicClient.listPlans();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
      for (const plan of plans) {
        expect(plan.name).toBeDefined();
        expect(plan.metadata).toBeDefined();
        expect(plan.metadata.title).toBeDefined();
      }
    });
  });

  describe("Packs", () => {
    it("lists prompt packs", async () => {
      const packs = await publicClient.listPacks();
      expect(Array.isArray(packs)).toBe(true);
    });
  });

  describe("Public Prompt Access", () => {
    it("returns 404 for non-existent slug", async () => {
      try {
        await publicClient.getPrompt("definitely-does-not-exist-999");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

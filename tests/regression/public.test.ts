import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PublicClient } from "@clients/public-client";
import { expectPaginated } from "@helpers/assertions";

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
      // Plans should always exist
      for (const plan of plans) {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(typeof plan.price).toBe("number");
      }
    });
  });

  describe("Search Public Prompts", () => {
    it("searches public prompts without auth", async () => {
      const results = await publicClient.searchPrompts();
      expectPaginated(results);
    });

    it("searches with query parameter", async () => {
      const results = await publicClient.searchPrompts({ query: "test" });
      expectPaginated(results);
    });

    it("supports pagination", async () => {
      const results = await publicClient.searchPrompts({ page: 0, size: 5 });
      expectPaginated(results);
      expect(results.content.length).toBeLessThanOrEqual(5);
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

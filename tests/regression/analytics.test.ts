import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AnalyticsClient } from "@clients/analytics-client";
import { getGuestClient } from "@helpers/auth";
import { formatDate } from "@utils/index";

describe("Analytics Endpoints", () => {
  let api: ApiClient;
  let analyticsClient: AnalyticsClient;

  beforeAll(async () => {
    api = await getGuestClient();
    analyticsClient = new AnalyticsClient(api);
  });

  describe("Overview", () => {
    it("gets analytics overview for a date range", async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const from = formatDate(thirtyDaysAgo);
      const to = formatDate(now);

      const overview = await analyticsClient.getOverview(from, to);
      expect(overview).toBeDefined();
      expect(typeof overview.totalPrompts).toBe("number");
      expect(typeof overview.totalRenders).toBe("number");
      expect(typeof overview.totalProjects).toBe("number");
      expect(overview.period).toBeDefined();
    });
  });

  describe("Top Prompts", () => {
    it("gets top prompts", async () => {
      const topPrompts = await analyticsClient.getTopPrompts({ limit: 10 });
      expect(Array.isArray(topPrompts)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("rejects analytics access without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthAnalytics = new AnalyticsClient(unauthApi);

      try {
        await unauthAnalytics.getOverview("2024-01-01", "2024-12-31");
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

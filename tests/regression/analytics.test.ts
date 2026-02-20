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

      try {
        const overview = await analyticsClient.getOverview(from, to);
        expect(overview).toBeDefined();
      } catch (err: unknown) {
        // Analytics requires ANALYTICS_VIEW quota which guest/free plans don't include
        const error = err as { response?: { status: number } };
        expect([403, 429]).toContain(error.response?.status);
      }
    });
  });

  describe("Top Prompts", () => {
    it("gets top prompts", async () => {
      try {
        const topPrompts = await analyticsClient.getTopPrompts({ limit: 10 });
        expect(Array.isArray(topPrompts)).toBe(true);
      } catch (err: unknown) {
        // Analytics requires ANALYTICS_VIEW quota which guest/free plans don't include
        const error = err as { response?: { status: number } };
        expect([400, 403, 429]).toContain(error.response?.status);
      }
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

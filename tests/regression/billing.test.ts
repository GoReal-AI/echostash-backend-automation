import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { BillingClient } from "@clients/billing-client";
import { getGuestClient } from "@helpers/auth";

describe("Billing Endpoints", () => {
  let api: ApiClient;
  let billingClient: BillingClient;

  beforeAll(async () => {
    api = await getGuestClient();
    billingClient = new BillingClient(api);
  });

  describe("Profile", () => {
    it("gets billing profile for authenticated user", async () => {
      const profile = await billingClient.me();
      expect(profile).toBeDefined();
      expect(profile.planName).toBeDefined();
      expect(profile.status).toBeDefined();
    });
  });

  describe("Spending", () => {
    it("gets current spending data", async () => {
      const spending = await billingClient.getSpending();
      expect(spending).toBeDefined();
    });

    it("gets spending history", async () => {
      const history = await billingClient.getSpendingHistory();
      expect(history).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("rejects billing access without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthBilling = new BillingClient(unauthApi);

      try {
        await unauthBilling.me();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

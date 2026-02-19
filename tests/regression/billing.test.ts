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
      expect(profile.plan).toBeDefined();
      expect(profile.status).toBeDefined();
    });
  });

  describe("Quotas", () => {
    it("gets current quotas", async () => {
      const quotas = await billingClient.getQuotas();
      expect(quotas).toBeDefined();
      expect(quotas.prompts).toBeDefined();
      expect(typeof quotas.prompts.used).toBe("number");
      expect(typeof quotas.prompts.limit).toBe("number");
      expect(quotas.renders).toBeDefined();
      expect(quotas.storage).toBeDefined();
    });
  });

  describe("Spending", () => {
    it("gets current spending data", async () => {
      const spending = await billingClient.getSpending();
      expect(spending).toBeDefined();
      expect(typeof spending.currentMonth).toBe("number");
      expect(typeof spending.limit).toBe("number");
    });

    it("gets spending history", async () => {
      const history = await billingClient.getSpendingHistory();
      expect(Array.isArray(history)).toBe(true);
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

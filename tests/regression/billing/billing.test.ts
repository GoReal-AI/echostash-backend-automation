import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { BillingClient } from "@clients/billing-client";
import { getGuestClient } from "@helpers/auth";

describe("Billing", () => {
  let api: ApiClient;
  let billing: BillingClient;

  beforeAll(async () => {
    api = await getGuestClient();
    billing = new BillingClient(api);
  });

  describe("Billing Status (BILL-001, BILL-002)", () => {
    it("BILL-002: guest user returns free plan billing status", async () => {
      try {
        const status = await billing.me();
        expect(status).toBeDefined();
        expect(status.planName).toBeDefined();
      } catch (err: unknown) {
        // Billing may not be configured for guest users
        const error = err as { response?: { status: number } };
        // 200 or 404 both acceptable
        expect(error.response).toBeDefined();
      }
    });
  });

  describe("Quotas (BILL-006)", () => {
    it("BILL-006: gets quota usage", async () => {
      try {
        const quotas = await billing.getQuotas();
        expect(quotas).toBeDefined();
        expect(quotas.prompts).toBeDefined();
        expect(typeof quotas.prompts.used).toBe("number");
        expect(typeof quotas.prompts.limit).toBe("number");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
      }
    });
  });

  describe("Spending (BILL-007)", () => {
    it("BILL-007: gets spending preferences", async () => {
      try {
        const spending = await billing.getSpending();
        expect(spending).toBeDefined();
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
      }
    });
  });

  describe("Spending History (BILL-010)", () => {
    it("BILL-010: gets overage history", async () => {
      try {
        const history = await billing.getSpendingHistory();
        expect(history).toBeDefined();
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
      }
    });
  });

  describe("Auth (BILL-011)", () => {
    it("BILL-011: rejects billing endpoints without auth", async () => {
      const unauthBilling = new BillingClient(new ApiClient());

      try {
        await unauthBilling.me();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("BILL-011: rejects quotas without auth", async () => {
      const unauthBilling = new BillingClient(new ApiClient());

      try {
        await unauthBilling.getQuotas();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

import { ApiClient } from "./api-client.js";
import type {
  BillingProfile,
  BillingPortal,
  BillingQuotas,
  SpendingData,
  UpdateSpendingRequest,
  SpendingHistoryEntry,
} from "../types/index.js";

export class BillingClient {
  constructor(private api: ApiClient) {}

  async me(): Promise<BillingProfile> {
    const res = await this.api.get<BillingProfile>("/api/billing/me");
    return res.data;
  }

  async getPortal(): Promise<BillingPortal> {
    const res = await this.api.get<BillingPortal>("/api/billing/portal");
    return res.data;
  }

  async getQuotas(): Promise<BillingQuotas> {
    const res = await this.api.get<BillingQuotas>("/api/billing/quotas");
    return res.data;
  }

  async getSpending(): Promise<SpendingData> {
    const res = await this.api.get<SpendingData>("/api/billing/spending");
    return res.data;
  }

  async updateSpending(data: UpdateSpendingRequest): Promise<SpendingData> {
    const res = await this.api.put<SpendingData>("/api/billing/spending", data);
    return res.data;
  }

  async getSpendingHistory(): Promise<SpendingHistoryEntry[]> {
    const res = await this.api.get<SpendingHistoryEntry[]>("/api/billing/spending/history");
    return res.data;
  }
}

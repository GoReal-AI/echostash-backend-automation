import { ApiClient } from "./api-client.js";
import type {
  AnalyticsOverview,
  PromptMetrics,
  TopPromptsParams,
  VariableUsageParams,
  Prompt,
} from "../types/index.js";

export interface VariableUsageResponse {
  promptId: string;
  variables: Record<string, number>;
}

export class AnalyticsClient {
  constructor(private api: ApiClient) {}

  async getOverview(from: string, to: string): Promise<AnalyticsOverview> {
    const res = await this.api.get<AnalyticsOverview>("/api/v1/analytics/overview", {
      params: { from, to },
    });
    return res.data;
  }

  async getPromptMetrics(promptId: string, params?: { from?: string; to?: string }): Promise<PromptMetrics> {
    const res = await this.api.get<PromptMetrics>(`/api/v1/analytics/prompts/${promptId}`, {
      params,
    });
    return res.data;
  }

  async getTopPrompts(params?: TopPromptsParams): Promise<Prompt[]> {
    const res = await this.api.get<Prompt[]>("/api/v1/analytics/top-prompts", { params });
    return res.data;
  }

  async getVariableUsage(promptId: string, params?: VariableUsageParams): Promise<VariableUsageResponse> {
    const res = await this.api.get<VariableUsageResponse>(
      `/api/v1/analytics/prompts/${promptId}/variables`,
      { params }
    );
    return res.data;
  }
}

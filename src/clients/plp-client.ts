import { ApiClient } from "./api-client.js";
import type { PlpDiscovery, PlpPrompt, PlpSearchParams } from "../types/index.js";

interface PlpListResponse {
  content: PlpPrompt[];
  page: number;
  totalElements: number;
  totalPages: number;
}

export class PlpClient {
  constructor(private api: ApiClient) {}

  async discover(): Promise<PlpDiscovery> {
    const res = await this.api.get<PlpDiscovery>("/.well-known/plp");
    return res.data;
  }

  async listPrompts(params?: PlpSearchParams): Promise<PlpListResponse> {
    const res = await this.api.get<PlpListResponse>("/v1/prompts", { params });
    return res.data;
  }

  async getPrompt(id: string): Promise<PlpPrompt> {
    const res = await this.api.get<PlpPrompt>(`/v1/prompts/${id}`);
    return res.data;
  }
}

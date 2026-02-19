import { ApiClient } from "./api-client.js";
import type {
  PublicPrompt,
  PublicSearchParams,
  SharePromptRequest,
  PromptPack,
  Plan,
  PaginatedResponse,
} from "../types/index.js";

export class PublicClient {
  constructor(private api: ApiClient) {}

  async getPrompt(slug: string): Promise<PublicPrompt> {
    const res = await this.api.get<PublicPrompt>(`/api/public/prompts/${slug}`);
    return res.data;
  }

  async searchPrompts(params?: PublicSearchParams): Promise<PaginatedResponse<PublicPrompt>> {
    const res = await this.api.get<PaginatedResponse<PublicPrompt>>("/api/public/prompts", { params });
    return res.data;
  }

  async share(data: SharePromptRequest): Promise<PublicPrompt> {
    const res = await this.api.post<PublicPrompt>("/api/public/share", data);
    return res.data;
  }

  async trackView(slug: string): Promise<void> {
    await this.api.post(`/api/public/prompts/${slug}/view`);
  }

  async trackUpvote(slug: string): Promise<void> {
    await this.api.post(`/api/public/prompts/${slug}/upvote`);
  }

  async trackFork(slug: string): Promise<void> {
    await this.api.post(`/api/public/prompts/${slug}/fork`);
  }

  async listPacks(): Promise<PromptPack[]> {
    const res = await this.api.get<PromptPack[]>("/api/public/packs");
    return res.data;
  }

  async getPack(id: string): Promise<PromptPack> {
    const res = await this.api.get<PromptPack>(`/api/public/packs/${id}`);
    return res.data;
  }

  async listPlans(): Promise<Plan[]> {
    const res = await this.api.get<Plan[]>("/api/public/plans");
    return res.data;
  }
}

import { ApiClient } from "./api-client.js";
import type {
  Prompt,
  CreatePromptRequest,
  UpdatePromptRequest,
  PromptVersion,
  CreateVersionRequest,
  PublishPromptRequest,
  PublishNewVersionRequest,
  UpdateVisibilityRequest,
  PromptSearchParams,
  SemanticSearchParams,
  PaginatedResponse,
} from "../types/index.js";

export class PromptsClient {
  constructor(private api: ApiClient) {}

  async create(data: CreatePromptRequest): Promise<Prompt> {
    const res = await this.api.post<Prompt>("/api/prompts", data);
    return res.data;
  }

  async get(id: string): Promise<Prompt> {
    const res = await this.api.get<Prompt>(`/api/prompts/${id}`);
    return res.data;
  }

  async list(projectId: string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Prompt>> {
    const res = await this.api.get<PaginatedResponse<Prompt>>("/api/prompts", {
      params: { projectId, ...params },
    });
    return res.data;
  }

  async update(id: string, data: UpdatePromptRequest): Promise<Prompt> {
    const res = await this.api.put<Prompt>(`/api/prompts/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/api/prompts/${id}`);
  }

  async createVersion(promptId: string, data: CreateVersionRequest): Promise<PromptVersion> {
    const res = await this.api.post<PromptVersion>(`/api/prompts/${promptId}/versions`, data);
    return res.data;
  }

  async listVersions(promptId: string): Promise<PromptVersion[]> {
    const res = await this.api.get<PromptVersion[]>(`/api/prompts/${promptId}/versions`);
    return res.data;
  }

  async getVersion(promptId: string, versionNo: number): Promise<PromptVersion> {
    const res = await this.api.get<PromptVersion>(`/api/prompts/${promptId}/versions/${versionNo}`);
    return res.data;
  }

  async publish(promptId: string, data: PublishPromptRequest): Promise<Prompt> {
    const res = await this.api.post<Prompt>(`/api/prompts/${promptId}/publish`, data);
    return res.data;
  }

  async publishNewVersion(promptId: string, data: PublishNewVersionRequest): Promise<Prompt> {
    const res = await this.api.post<Prompt>(`/api/prompts/${promptId}/publish-new`, data);
    return res.data;
  }

  async updateVisibility(promptId: string, data: UpdateVisibilityRequest): Promise<Prompt> {
    const res = await this.api.patch<Prompt>(`/api/prompts/${promptId}/visibility`, data);
    return res.data;
  }

  async addTags(promptId: string, tagIds: string[]): Promise<Prompt> {
    const res = await this.api.post<Prompt>(`/api/prompts/${promptId}/tags`, { tagIds });
    return res.data;
  }

  async search(params: PromptSearchParams): Promise<PaginatedResponse<Prompt>> {
    const res = await this.api.get<PaginatedResponse<Prompt>>("/api/prompts/search", { params });
    return res.data;
  }

  async semanticSearch(query: string, limit?: number): Promise<Prompt[]> {
    const params: SemanticSearchParams = { query, limit };
    const res = await this.api.get<Prompt[]>("/api/prompts/semantic-search", { params });
    return res.data;
  }

  async count(): Promise<number> {
    const res = await this.api.get<{ count: number }>("/api/prompts/count");
    return res.data.count;
  }
}

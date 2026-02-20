import { ApiClient } from "./api-client.js";
import type {
  Prompt,
  CreatePromptRequest,
  UpdatePromptRequest,
  PromptVersion,
  CreateVersionRequest,
  CreateVersionResponse,
  PublishPromptRequest,
  PublishPromptResponse,
  PublishNewVersionRequest,
  UpdateVisibilityRequest,
  PromptSearchParams,
  SemanticSearchParams,
  PaginatedResponse,
} from "../types/index.js";

export class PromptsClient {
  constructor(private api: ApiClient) {}

  async create(data: CreatePromptRequest): Promise<Prompt> {
    const res = await this.api.post<Prompt>("/api/prompts/create", data);
    return res.data;
  }

  async get(id: number | string): Promise<Prompt> {
    const res = await this.api.get<Prompt>(`/api/prompts/${id}`);
    return res.data;
  }

  async list(projectId: number | string, params?: { page?: number; size?: number }): Promise<PaginatedResponse<Prompt>> {
    const res = await this.api.get<PaginatedResponse<Prompt>>("/api/prompts", {
      params: { projectId, ...params },
    });
    return res.data;
  }

  async update(id: number | string, data: UpdatePromptRequest): Promise<Prompt> {
    const res = await this.api.patch<Prompt>(`/api/prompts/${id}`, data);
    return res.data;
  }

  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/api/prompts/${id}`);
  }

  async createVersion(promptId: number | string, data: CreateVersionRequest): Promise<CreateVersionResponse> {
    const res = await this.api.post<CreateVersionResponse>(`/api/prompts/${promptId}/versions`, data);
    return res.data;
  }

  async listVersions(promptId: number | string): Promise<PromptVersion[]> {
    const res = await this.api.get<PromptVersion[]>(`/api/prompts/${promptId}/versions`);
    return res.data;
  }

  async getVersion(promptId: number | string, versionNo: number): Promise<PromptVersion> {
    const res = await this.api.get<PromptVersion>(`/api/prompts/${promptId}/versions/${versionNo}`);
    return res.data;
  }

  async publish(promptId: number | string, data: PublishPromptRequest): Promise<PublishPromptResponse> {
    const res = await this.api.post<PublishPromptResponse>(`/api/prompts/${promptId}/publish`, data);
    return res.data;
  }

  async publishNewVersion(promptId: number | string, data: PublishNewVersionRequest): Promise<PublishPromptResponse> {
    const res = await this.api.post<PublishPromptResponse>(`/api/prompts/${promptId}/publish-new-version`, data);
    return res.data;
  }

  async updateVisibility(promptId: number | string, data: UpdateVisibilityRequest): Promise<void> {
    await this.api.put(`/api/prompts/${promptId}/visibility`, data);
  }

  async addTags(promptId: number | string, tagIds: number[]): Promise<void> {
    await this.api.post(`/api/prompts/${promptId}/tags`, { tagIds });
  }

  async search(params: PromptSearchParams): Promise<PaginatedResponse<Prompt>> {
    const res = await this.api.get<PaginatedResponse<Prompt>>("/api/prompts/search", { params });
    return res.data;
  }

  async semanticSearch(query: string, limit?: number): Promise<Prompt[]> {
    const params: SemanticSearchParams = { query, limit };
    const res = await this.api.get<Prompt[]>("/api/prompts/search/semantic/my", { params });
    return res.data;
  }

  async count(): Promise<number> {
    const res = await this.api.get<{ count: number }>("/api/prompts/count");
    return res.data.count;
  }
}

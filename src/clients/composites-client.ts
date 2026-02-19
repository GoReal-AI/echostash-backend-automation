import { ApiClient } from "./api-client.js";
import type {
  Composite,
  CreateCompositeRequest,
  UpdateCompositeRequest,
} from "../types/index.js";

export class CompositesClient {
  constructor(private api: ApiClient) {}

  async create(data: CreateCompositeRequest): Promise<Composite> {
    const res = await this.api.post<Composite>("/api/composites", data);
    return res.data;
  }

  async list(projectId?: string): Promise<Composite[]> {
    const res = await this.api.get<Composite[]>("/api/composites", {
      params: projectId ? { projectId } : undefined,
    });
    return res.data;
  }

  async get(id: string): Promise<Composite> {
    const res = await this.api.get<Composite>(`/api/composites/${id}`);
    return res.data;
  }

  async update(id: string, data: UpdateCompositeRequest): Promise<Composite> {
    const res = await this.api.put<Composite>(`/api/composites/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/api/composites/${id}`);
  }
}

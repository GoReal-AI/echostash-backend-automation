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

  async get(id: number | string): Promise<Composite> {
    const res = await this.api.get<Composite>(`/api/composites/${id}`);
    return res.data;
  }

  async getVersion(compositeId: number | string, versionNo: number): Promise<Composite> {
    const res = await this.api.get<Composite>(`/api/composites/${compositeId}/versions/${versionNo}`);
    return res.data;
  }

  // Note: The backend does not have a list endpoint for composites.
  // This is kept for backward compatibility but may return 404/405.
  async list(projectId?: string | number): Promise<Composite[]> {
    try {
      const res = await this.api.get<Composite[]>("/api/composites", {
        params: projectId ? { projectId } : undefined,
      });
      return res.data;
    } catch {
      return [];
    }
  }

  // Note: The backend does not have an update endpoint for composites.
  // New versions are created via POST /{compositeId}/versions instead.
  async update(id: number | string, data: UpdateCompositeRequest): Promise<Composite> {
    const res = await this.api.put<Composite>(`/api/composites/${id}`, data);
    return res.data;
  }

  // Note: The backend does not have a delete endpoint for composites.
  async delete(id: number | string): Promise<void> {
    await this.api.delete(`/api/composites/${id}`);
  }
}

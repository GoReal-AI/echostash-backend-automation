import { ApiClient } from "./api-client.js";
import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginatedResponse,
} from "../types/index.js";

export class ProjectsClient {
  constructor(private api: ApiClient) {}

  async create(data: CreateProjectRequest): Promise<Project> {
    const res = await this.api.post<Project>("/api/projects", data);
    return res.data;
  }

  async list(): Promise<PaginatedResponse<Project>> {
    const res = await this.api.get<PaginatedResponse<Project>>("/api/projects");
    return res.data;
  }

  async get(id: string): Promise<Project> {
    const res = await this.api.get<Project>(`/api/projects/${id}`);
    return res.data;
  }

  async update(id: string, data: UpdateProjectRequest): Promise<Project> {
    const res = await this.api.put<Project>(`/api/projects/${id}`, data);
    return res.data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/api/projects/${id}`);
  }
}

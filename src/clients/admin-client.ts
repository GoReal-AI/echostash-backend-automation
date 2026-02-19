import { ApiClient } from "./api-client.js";
import type {
  ShortLink,
  CreateShortLinkRequest,
  Tag,
  CreateTagRequest,
  UpdateTagRequest,
} from "../types/index.js";

export class AdminClient {
  constructor(private api: ApiClient) {}

  // --- Short Links ---

  async createShortLink(data: CreateShortLinkRequest): Promise<ShortLink> {
    const res = await this.api.post<ShortLink>("/api/admin/short-links", data);
    return res.data;
  }

  async listShortLinks(): Promise<ShortLink[]> {
    const res = await this.api.get<ShortLink[]>("/api/admin/short-links");
    return res.data;
  }

  async deleteShortLink(code: string): Promise<void> {
    await this.api.delete(`/api/admin/short-links/${code}`);
  }

  // --- Tags ---

  async listTags(): Promise<Tag[]> {
    const res = await this.api.get<Tag[]>("/api/admin/tags");
    return res.data;
  }

  async createTag(data: CreateTagRequest): Promise<Tag> {
    const res = await this.api.post<Tag>("/api/admin/tags", data);
    return res.data;
  }

  async updateTag(id: string, data: UpdateTagRequest): Promise<Tag> {
    const res = await this.api.put<Tag>(`/api/admin/tags/${id}`, data);
    return res.data;
  }

  async deleteTag(id: string): Promise<void> {
    await this.api.delete(`/api/admin/tags/${id}`);
  }
}

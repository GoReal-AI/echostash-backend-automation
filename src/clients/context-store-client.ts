import { ApiClient } from "./api-client.js";
import type { ContextAsset, ContextStoreUsage } from "../types/index.js";

export class ContextStoreClient {
  constructor(private api: ApiClient) {}

  async upload(formData: FormData): Promise<ContextAsset> {
    const res = await this.api.upload<ContextAsset>("/api/v1/context-store", formData);
    return res.data;
  }

  async list(): Promise<ContextAsset[]> {
    const res = await this.api.get<ContextAsset[]>("/api/v1/context-store");
    return res.data;
  }

  async getContent(assetId: string): Promise<string> {
    const res = await this.api.get<string>(`/api/v1/context-store/${assetId}/content`);
    return res.data;
  }

  async delete(assetId: string): Promise<void> {
    await this.api.delete(`/api/v1/context-store/${assetId}`);
  }

  async getUsage(): Promise<ContextStoreUsage> {
    const res = await this.api.get<ContextStoreUsage>("/api/v1/context-store/usage");
    return res.data;
  }
}

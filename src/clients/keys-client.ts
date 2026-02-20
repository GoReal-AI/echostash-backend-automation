import { ApiClient } from "./api-client.js";
import type { ApiKey, CreateApiKeyRequest } from "../types/index.js";

export class KeysClient {
  constructor(private api: ApiClient) {}

  async create(name: string): Promise<ApiKey> {
    const body: CreateApiKeyRequest = { name };
    const res = await this.api.post<ApiKey>("/api/keys", body);
    return res.data;
  }

  async list(): Promise<ApiKey[]> {
    const res = await this.api.get<ApiKey[]>("/api/keys");
    return res.data;
  }

  async revoke(id: number | string): Promise<void> {
    await this.api.delete(`/api/keys/${id}`);
  }
}

import { ApiClient } from "./api-client.js";
import type {
  SdkPromptResponse,
  SdkVersionResponse,
  SdkRenderRequest,
  SdkBatchRenderRequest,
  SdkRenderResponse,
  SdkBatchRenderResponse,
} from "../types/index.js";

export class SdkClient {
  constructor(private api: ApiClient) {}

  async getPrompt(id: number | string): Promise<SdkPromptResponse> {
    const res = await this.api.get<SdkPromptResponse>(`/api/sdk/prompts/${id}`);
    return res.data;
  }

  async getPromptVersion(id: number | string, versionNo: number): Promise<SdkVersionResponse> {
    const res = await this.api.get<SdkVersionResponse>(`/api/sdk/prompts/${id}/versions/${versionNo}`);
    return res.data;
  }

  async render(promptId: number | string, variables?: Record<string, string>, version?: string): Promise<SdkRenderResponse> {
    const body: SdkRenderRequest = { variables, version };
    const res = await this.api.post<SdkRenderResponse>(`/api/sdk/prompts/${promptId}/render`, body);
    return res.data;
  }

  async batchRender(items: SdkBatchRenderRequest["items"]): Promise<SdkBatchRenderResponse> {
    const body: SdkBatchRenderRequest = { items };
    const res = await this.api.post<SdkBatchRenderResponse>("/api/sdk/prompts/batch", body);
    return res.data;
  }
}

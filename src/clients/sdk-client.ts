import { ApiClient } from "./api-client.js";
import type {
  SdkPromptResponse,
  SdkRenderRequest,
  SdkBatchRenderRequest,
  SdkRenderResponse,
} from "../types/index.js";

export interface SdkGetPromptOptions {
  version?: number;
  variables?: Record<string, string>;
}

export class SdkClient {
  constructor(private api: ApiClient) {}

  async getPrompt(id: string, options?: SdkGetPromptOptions): Promise<SdkPromptResponse> {
    const res = await this.api.get<SdkPromptResponse>(`/api/sdk/prompts/${id}`, {
      params: options,
    });
    return res.data;
  }

  async getPromptVersion(id: string, versionNo: number): Promise<SdkPromptResponse> {
    const res = await this.api.get<SdkPromptResponse>(`/api/sdk/prompts/${id}/versions/${versionNo}`);
    return res.data;
  }

  async render(promptId: string, variables?: Record<string, string>): Promise<SdkRenderResponse> {
    const body: SdkRenderRequest = { promptId, variables };
    const res = await this.api.post<SdkRenderResponse>("/api/sdk/prompts/render", body);
    return res.data;
  }

  async batchRender(items: SdkBatchRenderRequest["items"]): Promise<SdkRenderResponse[]> {
    const body: SdkBatchRenderRequest = { items };
    const res = await this.api.post<SdkRenderResponse[]>("/api/sdk/prompts/batch-render", body);
    return res.data;
  }
}

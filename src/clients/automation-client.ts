import { ApiClient } from "./api-client.js";
import type { AuthTokens } from "../types/index.js";

export interface AutomationLoginRequest {
  email: string;
  name?: string;
}

export interface AutomationLoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  isFirstLogin: boolean;
}

export interface SetPlanRequest {
  userId: number;
  planName: string;
}

export interface SetPlanResponse {
  userId: number;
  planName: string;
  status: string;
}

export interface ResetQuotasResponse {
  userId: number;
  keysDeleted: number;
}

export interface DeleteUserResponse {
  userId: number;
  deleted: boolean;
}

/**
 * Client for automation-only endpoints (stage/dev environments).
 * These endpoints are gated by AUTOMATION_CHEATS_ENABLED=true on the backend.
 */
export class AutomationClient {
  constructor(private api: ApiClient) {}

  /**
   * Sign in as a specific email without Google OAuth.
   * Creates the user if they don't exist.
   */
  async login(request: AutomationLoginRequest): Promise<AutomationLoginResponse> {
    const res = await this.api.post<AutomationLoginResponse>("/automation/auth/login", request);
    return res.data;
  }

  /**
   * Login and return a pre-authenticated ApiClient.
   */
  async loginAndGetClient(email: string, name?: string): Promise<{ client: ApiClient; tokens: AuthTokens; isFirstLogin: boolean }> {
    const response = await this.login({ email, name });
    const client = new ApiClient({ token: response.accessToken });
    return {
      client,
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
      isFirstLogin: response.isFirstLogin,
    };
  }

  /**
   * Set a user's plan directly (bypasses payment provider).
   */
  async setPlan(userId: number, planName: string): Promise<SetPlanResponse> {
    const res = await this.api.post<SetPlanResponse>("/automation/cheats/set-plan", { userId, planName });
    return res.data;
  }

  /**
   * Reset all quota usage counters for a user.
   */
  async resetQuotas(userId: number): Promise<ResetQuotasResponse> {
    const res = await this.api.post<ResetQuotasResponse>("/automation/cheats/reset-quotas", { userId });
    return res.data;
  }

  /**
   * Delete a user and all their billing/usage data.
   */
  async deleteUser(userId: number): Promise<DeleteUserResponse> {
    const res = await this.api.post<DeleteUserResponse>("/automation/cheats/delete-user", { userId });
    return res.data;
  }
}

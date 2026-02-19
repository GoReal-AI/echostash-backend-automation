import { ApiClient } from "./api-client.js";
import type { AuthTokens, GuestAuthResponse, UserProfile } from "../types/index.js";

export class AuthClient {
  constructor(private api: ApiClient) {}

  async guest(): Promise<GuestAuthResponse> {
    const res = await this.api.post<GuestAuthResponse>("/auth/guest");
    return res.data;
  }

  async exchange(googleToken: string): Promise<AuthTokens> {
    const res = await this.api.post<AuthTokens>("/auth/exchange", { token: googleToken });
    return res.data;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const res = await this.api.post<AuthTokens>("/auth/refresh", { refreshToken });
    return res.data;
  }

  async me(): Promise<UserProfile> {
    const res = await this.api.get<UserProfile>("/auth/me");
    return res.data;
  }
}

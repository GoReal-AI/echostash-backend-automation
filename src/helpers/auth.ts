import { ApiClient } from "../clients/api-client.js";
import { AuthClient } from "../clients/auth-client.js";
import { getTestConfig } from "../config/index.js";
import type { AuthTokens } from "../types/index.js";

/**
 * Log in as a guest user and return the tokens.
 */
export async function loginAsGuest(): Promise<AuthTokens> {
  const api = new ApiClient();
  const authClient = new AuthClient(api);
  const guestResponse = await authClient.guest();
  return {
    accessToken: guestResponse.accessToken,
    refreshToken: guestResponse.refreshToken,
  };
}

/**
 * Log in as a guest user and return a pre-authenticated ApiClient.
 */
export async function getGuestClient(): Promise<ApiClient> {
  const tokens = await loginAsGuest();
  return new ApiClient({ token: tokens.accessToken });
}

/**
 * Create an ApiClient authenticated with an API key.
 */
export function getApiKeyClient(apiKey?: string): ApiClient {
  const key = apiKey || getTestConfig().testApiKey;
  if (!key) {
    throw new Error("No API key provided and TEST_API_KEY env var is not set");
  }
  return new ApiClient({ apiKey: key });
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshToken(refreshTokenValue: string): Promise<AuthTokens> {
  const api = new ApiClient();
  const authClient = new AuthClient(api);
  return authClient.refresh(refreshTokenValue);
}

/**
 * Log in with email/password and return an authenticated ApiClient.
 * Falls back to TEST_USER_EMAIL / TEST_USER_PASSWORD from env.
 */
export async function loginAndGetClient(email?: string, password?: string): Promise<ApiClient> {
  const config = getTestConfig();
  const api = new ApiClient();
  const response = await api.post<AuthTokens>("/api/auth/login", {
    email: email || config.testUserEmail,
    password: password || config.testUserPassword,
  });
  return new ApiClient({ token: response.data.accessToken });
}

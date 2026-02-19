import { ApiClient } from "../clients/api-client.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export async function login(email?: string, password?: string): Promise<AuthTokens> {
  const client = new ApiClient();
  const response = await client.post<AuthTokens>("/api/auth/login", {
    email: email || process.env.TEST_USER_EMAIL,
    password: password || process.env.TEST_USER_PASSWORD,
  });
  return response.data;
}

export async function getAuthenticatedClient(email?: string, password?: string): Promise<ApiClient> {
  const tokens = await login(email, password);
  const client = new ApiClient();
  client.setToken(tokens.accessToken);
  return client;
}

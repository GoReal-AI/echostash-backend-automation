import { describe, it, expect } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AuthClient } from "@clients/auth-client";

describe("Auth - Sanity", () => {
  const api = new ApiClient();
  const authClient = new AuthClient(api);

  describe("Guest Auth", () => {
    it("POST /auth/guest returns tokens", async () => {
      const response = await authClient.guest();

      expect(response.accessToken).toBeDefined();
      expect(typeof response.accessToken).toBe("string");
      expect(response.accessToken.length).toBeGreaterThan(0);
      expect(response.refreshToken).toBeDefined();
      expect(typeof response.refreshToken).toBe("string");
    });

    it("guest token can be used to call /auth/me", async () => {
      const guestTokens = await authClient.guest();
      const authedApi = new ApiClient({ token: guestTokens.accessToken });
      const authedAuth = new AuthClient(authedApi);

      const profile = await authedAuth.me();
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.userType).toBe("guest");
    });

    it("guest token can be refreshed", async () => {
      const guestTokens = await authClient.guest();
      const newTokens = await authClient.refresh(guestTokens.refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.accessToken).not.toBe(guestTokens.accessToken);
    });
  });

  describe("Auth Error Handling", () => {
    it("rejects request without token on protected endpoint", async () => {
      try {
        await api.get("/auth/me");
        expect.fail("Expected 401 error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("rejects request with invalid token", async () => {
      const badApi = new ApiClient({ token: "invalid-token-value" });
      try {
        await badApi.get("/auth/me");
        expect.fail("Expected 401 error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("rejects refresh with invalid refresh token", async () => {
      try {
        await authClient.refresh("invalid-refresh-token");
        expect.fail("Expected error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
        expect([400, 401]).toContain(error.response?.status);
      }
    });
  });
});

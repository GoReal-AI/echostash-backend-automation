import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AuthClient } from "@clients/auth-client";
import { getGuestClient, loginAsGuest } from "@helpers/auth";
import { expectError } from "@helpers/assertions";

describe("Auth Flows - Regression", () => {
  const api = new ApiClient();
  const authClient = new AuthClient(api);

  describe("Guest Login (AUTH-001, AUTH-002)", () => {
    it("AUTH-001: issues guest tokens with no prior cookie", async () => {
      const response = await authClient.guest();

      expect(response.accessToken).toBeDefined();
      expect(typeof response.accessToken).toBe("string");
      expect(response.accessToken.length).toBeGreaterThan(0);
      expect(response.refreshToken).toBeDefined();
      expect(typeof response.refreshToken).toBe("string");
      expect(response.refreshToken.length).toBeGreaterThan(0);
      expect(response.expiresIn).toBeDefined();
    });

    it("AUTH-002: two guest logins produce different user IDs", async () => {
      const guest1 = await authClient.guest();
      const api1 = new ApiClient({ token: guest1.accessToken });
      const profile1 = await new AuthClient(api1).me();

      const guest2 = await authClient.guest();
      const api2 = new ApiClient({ token: guest2.accessToken });
      const profile2 = await new AuthClient(api2).me();

      expect(profile1.sub).not.toBe(profile2.sub);
    });
  });

  describe("Token Refresh (AUTH-009 through AUTH-012)", () => {
    it("AUTH-009: refreshes a valid guest token", async () => {
      const initial = await authClient.guest();
      const refreshed = await authClient.refresh(initial.refreshToken);

      expect(refreshed.accessToken).toBeDefined();
      expect(typeof refreshed.accessToken).toBe("string");
      expect(refreshed.accessToken).not.toBe(initial.accessToken);
    });

    it("AUTH-010: rejects expired/invalid refresh token", async () => {
      try {
        await authClient.refresh("expired-or-invalid-token");
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
        expect([400, 401]).toContain(error.response?.status);
      }
    });

    it("AUTH-011: rejects blank refresh token", async () => {
      try {
        await authClient.refresh("");
        expect.fail("Expected error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
        expect([400, 401]).toContain(error.response?.status);
      }
    });

    it("AUTH-012: rejects malformed JWT string as refresh token", async () => {
      try {
        await authClient.refresh("not.a.valid.jwt.string");
        expect.fail("Expected error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response).toBeDefined();
        expect([400, 401]).toContain(error.response?.status);
      }
    });
  });

  describe("Get Current User /auth/me (AUTH-015 through AUTH-019)", () => {
    it("AUTH-015: returns user profile for valid guest JWT", async () => {
      const tokens = await loginAsGuest();
      const authedApi = new ApiClient({ token: tokens.accessToken });
      const authedAuth = new AuthClient(authedApi);

      const profile = await authedAuth.me();
      expect(profile).toBeDefined();
      expect(profile.sub).toBeDefined();
      expect(typeof profile.sub).toBe("string");
      expect(profile.acct_type).toBeDefined();
    });

    it("AUTH-016: returns 401 without Authorization header", async () => {
      const unauthApi = new ApiClient();
      try {
        await new AuthClient(unauthApi).me();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("AUTH-017: returns 401 for expired/invalid JWT", async () => {
      const badApi = new ApiClient({ token: "expired.jwt.token" });
      try {
        await new AuthClient(badApi).me();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("AUTH-018: returns 401 for JWT with invalid signature", async () => {
      // Use a structurally valid JWT but with wrong signature
      const fakeJwt =
        "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.invalid_signature";
      const badApi = new ApiClient({ token: fakeJwt });
      try {
        await new AuthClient(badApi).me();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });

    it("AUTH-019: guest JWT shows userType=guest in /auth/me", async () => {
      const tokens = await loginAsGuest();
      const authedApi = new ApiClient({ token: tokens.accessToken });
      const profile = await new AuthClient(authedApi).me();
      expect(profile.acct_type).toBe("guest");
    });
  });

  describe("Refresh Token Edge Cases (AUTH-014)", () => {
    it("AUTH-014: guest refresh returns a valid access token", async () => {
      const guestTokens = await authClient.guest();
      const refreshed = await authClient.refresh(guestTokens.refreshToken);

      // Verify the new token works
      const authedApi = new ApiClient({ token: refreshed.accessToken });
      const profile = await new AuthClient(authedApi).me();
      expect(profile).toBeDefined();
      expect(profile.sub).toBeDefined();
    });
  });
});

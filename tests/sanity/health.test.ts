import { describe, it, expect } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AuthClient } from "@clients/auth-client";
import { PlpClient } from "@clients/plp-client";

describe("Health & Smoke Tests", () => {
  const api = new ApiClient();

  it("GET /actuator/health returns 200", async () => {
    const response = await api.get<{ status: string }>("/actuator/health");
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.status).toBeDefined();
  });

  it("GET /.well-known/plp returns PLP discovery document", async () => {
    const res = await api.get<Record<string, unknown>>("/.well-known/plp");
    expect(res.data).toBeDefined();
    expect(res.data.plp_version || res.data.version).toBeDefined();
    expect(res.data.server_name || res.data.name).toBeDefined();
  });

  it("POST /auth/guest returns a guest token", async () => {
    const authClient = new AuthClient(api);
    const guestResponse = await authClient.guest();
    expect(guestResponse).toBeDefined();
    expect(guestResponse.accessToken).toBeDefined();
    expect(typeof guestResponse.accessToken).toBe("string");
    expect(guestResponse.accessToken.length).toBeGreaterThan(0);
  });
});

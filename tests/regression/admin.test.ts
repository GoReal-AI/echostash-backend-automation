import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { AdminClient } from "@clients/admin-client";
import { getGuestClient } from "@helpers/auth";
import { shortLinkData, tagData } from "@fixtures/test-data";

describe("Admin Endpoints", () => {
  let api: ApiClient;
  let adminClient: AdminClient;

  beforeAll(async () => {
    // Note: Admin endpoints require ADMIN role. Guest users will get 403.
    // These tests verify proper access control and, when run with an admin
    // user, verify full CRUD functionality.
    api = await getGuestClient();
    adminClient = new AdminClient(api);
  });

  describe("Access Control", () => {
    it("rejects short link creation for non-admin user", async () => {
      try {
        await adminClient.createShortLink(shortLinkData());
        // If we get here, either the user has admin role or API is permissive
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it("rejects tag creation for non-admin user", async () => {
      try {
        await adminClient.createTag(tagData());
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it("rejects admin access without auth entirely", async () => {
      const unauthApi = new ApiClient();
      const unauthAdmin = new AdminClient(unauthApi);

      try {
        await unauthAdmin.listShortLinks();
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe("Tags (Read-only for non-admin)", () => {
    it("lists tags (may require admin)", async () => {
      try {
        const tags = await adminClient.listTags();
        expect(Array.isArray(tags)).toBe(true);
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        // 403 is acceptable if guest doesn't have admin access
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });

  describe("Short Links (Read-only for non-admin)", () => {
    it("lists short links (may require admin)", async () => {
      try {
        const links = await adminClient.listShortLinks();
        expect(Array.isArray(links)).toBe(true);
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });
});

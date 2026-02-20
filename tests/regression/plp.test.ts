import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PlpClient } from "@clients/plp-client";
import { getGuestClient } from "@helpers/auth";

describe("PLP Protocol Endpoints", () => {
  let api: ApiClient;
  let plpClient: PlpClient;
  let authedPlpClient: PlpClient;

  beforeAll(async () => {
    api = new ApiClient();
    plpClient = new PlpClient(api);
    const authedApi = await getGuestClient();
    authedPlpClient = new PlpClient(authedApi);
  });

  describe("Discovery", () => {
    it("returns PLP discovery document at /.well-known/plp", async () => {
      const discovery = await plpClient.discover();

      expect(discovery).toBeDefined();
      expect(discovery.server_name).toBeDefined();
      expect(typeof discovery.server_name).toBe("string");
      expect(discovery.plp_version).toBeDefined();
      expect(typeof discovery.plp_version).toBe("string");
    });

    it("discovery document contains capabilities", async () => {
      const discovery = await plpClient.discover();
      expect(discovery.capabilities).toBeDefined();
      expect(typeof discovery.capabilities).toBe("object");
    });
  });

  describe("Prompts", () => {
    it("lists prompts via PLP /v1/prompts", async () => {
      const result = await authedPlpClient.listPrompts();
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    it("supports pagination in PLP list", async () => {
      const result = await authedPlpClient.listPrompts({ limit: 5, offset: 0 });
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });
  });
});

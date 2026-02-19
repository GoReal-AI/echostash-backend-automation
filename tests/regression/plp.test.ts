import { describe, it, expect, beforeAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PlpClient } from "@clients/plp-client";

describe("PLP Protocol Endpoints", () => {
  let api: ApiClient;
  let plpClient: PlpClient;

  beforeAll(() => {
    api = new ApiClient();
    plpClient = new PlpClient(api);
  });

  describe("Discovery", () => {
    it("returns PLP discovery document at /.well-known/plp", async () => {
      const discovery = await plpClient.discover();

      expect(discovery).toBeDefined();
      expect(discovery.name).toBeDefined();
      expect(typeof discovery.name).toBe("string");
      expect(discovery.version).toBeDefined();
      expect(typeof discovery.version).toBe("string");
    });

    it("discovery document contains endpoints", async () => {
      const discovery = await plpClient.discover();
      expect(discovery.endpoints).toBeDefined();
      expect(typeof discovery.endpoints).toBe("object");
    });
  });

  describe("Prompts", () => {
    it("lists prompts via PLP /v1/prompts", async () => {
      const prompts = await plpClient.listPrompts();
      expect(Array.isArray(prompts)).toBe(true);
    });

    it("searches prompts via PLP", async () => {
      const prompts = await plpClient.searchPrompts({ query: "test" });
      expect(Array.isArray(prompts)).toBe(true);
    });

    it("supports pagination in PLP list", async () => {
      const prompts = await plpClient.listPrompts({ limit: 5, offset: 0 });
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeLessThanOrEqual(5);
    });
  });
});

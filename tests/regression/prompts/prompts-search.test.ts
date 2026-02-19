import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData } from "@fixtures/test-data";
import { expectPaginated } from "@helpers/assertions";
import { uniqueId } from "@utils/index";
import type { Project } from "@api-types/index";

describe("Prompts - Search", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  const searchTag = `SearchTag-${uniqueId()}`;
  const searchableName = `Searchable-${uniqueId()}`;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());

    // Seed prompts for search
    await prompts.create(promptData(testProject.id, { name: searchableName }));
    await prompts.create(promptData(testProject.id, { name: `Other-${uniqueId()}` }));
    await prompts.create(promptData(testProject.id, { name: `Another-${uniqueId()}` }));
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Basic Search (SRCH-001, SRCH-002)", () => {
    it("SRCH-001: searches prompts with no filters (returns own prompts)", async () => {
      const results = await prompts.search({});
      expectPaginated(results);
      expect(results.content.length).toBeGreaterThan(0);
    });

    it("SRCH-002: searches prompts by name (contains match)", async () => {
      const results = await prompts.search({ query: searchableName });
      expectPaginated(results);
      expect(results.content.length).toBeGreaterThan(0);
      expect(results.content.some((p) => p.name.includes("Searchable"))).toBe(true);
    });
  });

  describe("Filter by Project (SRCH-005)", () => {
    it("SRCH-005: filters prompts by projectId", async () => {
      const results = await prompts.search({ projectId: testProject.id });
      expectPaginated(results);
      expect(results.content.length).toBeGreaterThan(0);
      results.content.forEach((p) => {
        expect(p.projectId).toBe(testProject.id);
      });
    });
  });

  describe("Pagination (SRCH-010)", () => {
    it("SRCH-010: paginates search results", async () => {
      const page0 = await prompts.search({ projectId: testProject.id, page: 0, size: 2 });
      expectPaginated(page0);
      expect(page0.content.length).toBeLessThanOrEqual(2);
      expect(page0.number).toBe(0);
    });
  });

  describe("Empty Results (SRCH-012)", () => {
    it("SRCH-012: returns empty page for non-matching query", async () => {
      const results = await prompts.search({ query: "zzzNonExistentQuery999" + uniqueId() });
      expectPaginated(results);
      expect(results.content.length).toBe(0);
    });
  });

  describe("Without Auth (SRCH-016)", () => {
    it("SRCH-016: rejects search without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthPrompts = new PromptsClient(unauthApi);

      try {
        await unauthPrompts.search({});
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

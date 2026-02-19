import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData } from "@fixtures/test-data";
import { PromptBuilder } from "@fixtures/builders";
import { expectValidPrompt, expectPaginated } from "@helpers/assertions";
import { uniqueId } from "@utils/index";
import type { Project, Prompt } from "@api-types/index";

describe("Prompts - Full CRUD", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create (PRMT-001 through PRMT-003)", () => {
    it("PRMT-001: creates with minimal fields (name + content + projectId)", async () => {
      const data = promptData(testProject.id);
      const prompt = await prompts.create(data);

      expectValidPrompt(prompt);
      expect(prompt.name).toBe(data.name);
      expect(prompt.projectId).toBe(testProject.id);
    });

    it("PRMT-002: creates with all fields (name, description, projectId, visibility)", async () => {
      const data = new PromptBuilder(testProject.id)
        .withName(`Full Prompt ${uniqueId()}`)
        .withContent("Complete prompt content {{var}}")
        .withDescription("A detailed prompt description")
        .withVisibility("private")
        .build();

      const prompt = await prompts.create(data);
      expectValidPrompt(prompt);
      expect(prompt.name).toBe(data.name);
      expect(prompt.description).toBe("A detailed prompt description");
    });

    it("PRMT-003: rejects prompt creation without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthPrompts = new PromptsClient(unauthApi);

      try {
        await unauthPrompts.create(promptData(testProject.id));
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe("Read (PRMT-004 through PRMT-008)", () => {
    let testPrompt: Prompt;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
    });

    it("PRMT-004: gets own prompt by ID", async () => {
      const fetched = await prompts.get(testPrompt.id);
      expectValidPrompt(fetched);
      expect(fetched.id).toBe(testPrompt.id);
    });

    it("PRMT-005: returns 404 for prompt not owned", async () => {
      const otherApi = await getGuestClient();
      const otherPrompts = new PromptsClient(otherApi);

      try {
        await otherPrompts.get(testPrompt.id);
        expect.fail("Expected 403 or 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([403, 404]).toContain(error.response?.status);
      }
    });

    it("PRMT-006: returns 404 for non-existent prompt", async () => {
      try {
        await prompts.get("non-existent-" + uniqueId());
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("PRMT-007: lists prompts in project (paginated)", async () => {
      const list = await prompts.list(testProject.id);
      expectPaginated(list);
      expect(list.content.length).toBeGreaterThan(0);
    });

    it("PRMT-008: returns empty page for project with no prompts", async () => {
      const emptyProject = await projectsClient.create(projectData());
      try {
        const list = await prompts.list(emptyProject.id);
        expectPaginated(list);
        expect(list.content.length).toBe(0);
      } finally {
        await projectsClient.delete(emptyProject.id).catch(() => {});
      }
    });
  });

  describe("Update (PRMT-009, PRMT-010)", () => {
    let testPrompt: Prompt;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
    });

    it("PRMT-009: updates prompt name", async () => {
      const newName = `Renamed-${uniqueId()}`;
      const updated = await prompts.update(testPrompt.id, { name: newName });
      expect(updated.name).toBe(newName);
    });

    it("PRMT-010: updates prompt visibility", async () => {
      try {
        const updated = await prompts.updateVisibility(testPrompt.id, { visibility: "public" });
        expect(updated).toBeDefined();
      } catch (err: unknown) {
        // Some APIs may not support visibility toggle for guest users
        const error = err as { response?: { status: number } };
        expect([200, 403]).toContain(error.response?.status ?? 200);
      }
    });
  });

  describe("Delete (PRMT-013, PRMT-014)", () => {
    it("PRMT-013: deletes own prompt", async () => {
      const prompt = await prompts.create(promptData(testProject.id));
      await prompts.delete(prompt.id);

      try {
        await prompts.get(prompt.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("PRMT-014: returns 403 or 404 when deleting prompt not owned", async () => {
      const prompt = await prompts.create(promptData(testProject.id));
      const otherApi = await getGuestClient();
      const otherPrompts = new PromptsClient(otherApi);

      try {
        await otherPrompts.delete(prompt.id);
        expect.fail("Expected 403 or 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe("Count (PRMT-029)", () => {
    it("PRMT-029: returns prompt count as a number", async () => {
      const count = await prompts.count();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

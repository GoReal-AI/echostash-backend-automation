import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { PromptBuilder } from "@fixtures/builders";
import { expectValidPrompt, expectPaginated } from "@helpers/assertions";
import type { Project, Prompt } from "@api-types/index";

describe("Prompts - CRUD & Versioning", () => {
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

  describe("Create", () => {
    it("creates a prompt with required fields", async () => {
      const data = promptData(testProject.id);
      const prompt = await prompts.create(data);

      expectValidPrompt(prompt);
      expect(prompt.name).toBe(data.name);
      expect(prompt.content).toBe(data.content);
      expect(prompt.projectId).toBe(testProject.id);
    });

    it("creates a prompt using builder", async () => {
      const data = new PromptBuilder(testProject.id)
        .withName("Builder Prompt")
        .withContent("Hello {{world}}")
        .withDescription("Built with builder")
        .build();

      const prompt = await prompts.create(data);
      expectValidPrompt(prompt);
      expect(prompt.name).toBe("Builder Prompt");
      expect(prompt.content).toBe("Hello {{world}}");
    });

    it("rejects prompt creation without projectId", async () => {
      try {
        await prompts.create({
          name: "No Project",
          content: "test",
          projectId: "",
        });
        expect.fail("Expected validation error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });

    it("rejects prompt creation with empty content", async () => {
      try {
        await prompts.create({
          name: "Empty Content",
          content: "",
          projectId: testProject.id,
        });
        expect.fail("Expected validation error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe("Read", () => {
    let testPrompt: Prompt;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
    });

    it("gets a prompt by ID", async () => {
      const fetched = await prompts.get(testPrompt.id);
      expectValidPrompt(fetched);
      expect(fetched.id).toBe(testPrompt.id);
      expect(fetched.name).toBe(testPrompt.name);
    });

    it("lists prompts for a project", async () => {
      const list = await prompts.list(testProject.id);
      expectPaginated(list);
      expect(list.content.length).toBeGreaterThan(0);
    });

    it("returns 404 for non-existent prompt", async () => {
      try {
        await prompts.get("non-existent-prompt-000");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Update", () => {
    let testPrompt: Prompt;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
    });

    it("updates prompt name", async () => {
      const updated = await prompts.update(testPrompt.id, { name: "Renamed Prompt" });
      expect(updated.name).toBe("Renamed Prompt");
    });

    it("updates prompt content", async () => {
      const updated = await prompts.update(testPrompt.id, { content: "New content {{var}}" });
      expect(updated.content).toBe("New content {{var}}");
    });

    it("updates prompt description", async () => {
      const updated = await prompts.update(testPrompt.id, {
        description: "Updated description",
      });
      expect(updated.description).toBe("Updated description");
    });
  });

  describe("Delete", () => {
    it("deletes a prompt", async () => {
      const prompt = await prompts.create(promptData(testProject.id));
      await prompts.delete(prompt.id);

      try {
        await prompts.get(prompt.id);
        expect.fail("Expected 404 after deletion");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Versioning", () => {
    let testPrompt: Prompt;

    beforeAll(async () => {
      testPrompt = await prompts.create(promptData(testProject.id));
    });

    it("creates a new version", async () => {
      const version = await prompts.createVersion(testPrompt.id, versionData());
      expect(version).toBeDefined();
      expect(version.promptId).toBe(testPrompt.id);
      expect(version.versionNumber).toBeGreaterThanOrEqual(1);
      expect(version.content).toBeDefined();
    });

    it("lists versions for a prompt", async () => {
      const versions = await prompts.listVersions(testPrompt.id);
      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
    });

    it("gets a specific version by number", async () => {
      const versions = await prompts.listVersions(testPrompt.id);
      const first = versions[0];
      const fetched = await prompts.getVersion(testPrompt.id, first.versionNumber);
      expect(fetched.versionNumber).toBe(first.versionNumber);
      expect(fetched.promptId).toBe(testPrompt.id);
    });

    it("creates multiple versions and tracks version numbers", async () => {
      const v1 = await prompts.createVersion(testPrompt.id, versionData({ content: "v1 content" }));
      const v2 = await prompts.createVersion(testPrompt.id, versionData({ content: "v2 content" }));
      expect(v2.versionNumber).toBeGreaterThan(v1.versionNumber);
    });
  });

  describe("Search", () => {
    beforeAll(async () => {
      // Create a prompt with a searchable name
      await prompts.create(
        promptData(testProject.id, { name: "SearchableUniqueTestPrompt" })
      );
    });

    it("searches prompts by query", async () => {
      const results = await prompts.search({ query: "SearchableUniqueTestPrompt" });
      expectPaginated(results);
      expect(results.content.length).toBeGreaterThan(0);
    });

    it("searches prompts by projectId", async () => {
      const results = await prompts.search({ projectId: testProject.id });
      expectPaginated(results);
      expect(results.content.length).toBeGreaterThan(0);
      results.content.forEach((p) => {
        expect(p.projectId).toBe(testProject.id);
      });
    });

    it("search returns empty for non-matching query", async () => {
      const results = await prompts.search({ query: "zzzNonExistentQueryzzz999" });
      expectPaginated(results);
      expect(results.content.length).toBe(0);
    });
  });

  describe("Count", () => {
    it("returns prompt count as a number", async () => {
      const count = await prompts.count();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});

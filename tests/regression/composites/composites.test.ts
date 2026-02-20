import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { CompositesClient } from "@clients/composites-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, compositeData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, Composite } from "@api-types/index";

describe("Composites - CRUD", () => {
  let api: ApiClient;
  let composites: CompositesClient;
  let promptsClient: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let prompt1: Prompt;
  let prompt2: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    composites = new CompositesClient(api);
    promptsClient = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);

    testProject = await projectsClient.create(projectData());
    prompt1 = await promptsClient.create(promptData(testProject.id));
    prompt2 = await promptsClient.create(promptData(testProject.id));
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create (COMP-001, COMP-002)", () => {
    it("COMP-001: creates a composite with items", async () => {
      const data = compositeData(testProject.id, [prompt1.id, prompt2.id]);
      const composite = await composites.create(data);

      expect(composite).toBeDefined();
      expect(composite.compositeId ?? composite.id).toBeDefined();
      expect(composite.name).toBe(data.name);
    });

    it("COMP-002: creates with name, description, and items", async () => {
      const data = compositeData(testProject.id, [prompt1.id, prompt2.id], {
        name: `Detailed Composite ${uniqueId()}`,
        description: "A composite with full details",
      });
      const composite = await composites.create(data);

      expect(composite.name).toBe(data.name);
      expect(composite.description).toBe("A composite with full details");
    });
  });

  describe("Read (COMP-005)", () => {
    it("COMP-005: gets composite metadata", async () => {
      const created = await composites.create(
        compositeData(testProject.id, [prompt1.id, prompt2.id])
      );
      const id = created.compositeId ?? created.id;
      const fetched = await composites.get(id!);

      expect(fetched).toBeDefined();
    });

    it("COMP-006: returns 403 or 404 for composite not owned", async () => {
      const created = await composites.create(
        compositeData(testProject.id, [prompt1.id, prompt2.id])
      );
      const otherApi = await getGuestClient();
      const otherComposites = new CompositesClient(otherApi);
      const id = created.compositeId ?? created.id;

      try {
        await otherComposites.get(id!);
        expect.fail("Expected 403 or 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect([403, 404]).toContain(error.response?.status);
      }
    });
  });

  describe("List", () => {
    it("lists composites for a project", async () => {
      const list = await composites.list(testProject.id);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  describe("Update", () => {
    it("updates composite name", async () => {
      const created = await composites.create(
        compositeData(testProject.id, [prompt1.id, prompt2.id])
      );
      const id = created.compositeId ?? created.id;
      const newName = `Updated-${uniqueId()}`;
      const updated = await composites.update(id!, { name: newName });
      expect(updated.name).toBe(newName);
    });
  });

  describe("Delete", () => {
    it("deletes a composite", async () => {
      const created = await composites.create(
        compositeData(testProject.id, [prompt1.id, prompt2.id])
      );
      const id = created.compositeId ?? created.id;
      await composites.delete(id!);

      try {
        await composites.get(id!);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

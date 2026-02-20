import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { CompositesClient } from "@clients/composites-client";
import { ProjectsClient } from "@clients/projects-client";
import { PromptsClient } from "@clients/prompts-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, compositeData } from "@fixtures/test-data";
import { CompositeBuilder } from "@fixtures/builders";
import type { Project, Prompt } from "@api-types/index";

describe("Composites - CRUD", () => {
  let api: ApiClient;
  let compositesClient: CompositesClient;
  let testProject: Project;
  let prompt1: Prompt;
  let prompt2: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    compositesClient = new CompositesClient(api);

    const projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());

    const promptsClient = new PromptsClient(api);
    prompt1 = await promptsClient.create(promptData(testProject.id));
    prompt2 = await promptsClient.create(promptData(testProject.id));
  });

  afterAll(async () => {
    try {
      await new ProjectsClient(api).delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create", () => {
    it("creates a composite with two items", async () => {
      const data = compositeData(testProject.id, [prompt1.id, prompt2.id]);
      const composite = await compositesClient.create(data);

      expect(composite).toBeDefined();
      expect(composite.compositeId ?? composite.id).toBeDefined();
      expect(composite.name).toBe(data.name);
    });

    it("creates a composite using builder", async () => {
      const data = new CompositeBuilder(testProject.id)
        .withName("Builder Composite")
        .withDescription("Created via builder")
        .addStep({ promptId: prompt1.id, order: 1 })
        .addStep({ promptId: prompt2.id, order: 2 })
        .build();

      const composite = await compositesClient.create(data);
      expect(composite.name).toBe("Builder Composite");
    });
  });

  describe("Read", () => {
    it("gets a composite by ID", async () => {
      const created = await compositesClient.create(
        compositeData(testProject.id, [prompt1.id])
      );
      const id = created.compositeId ?? created.id;
      const fetched = await compositesClient.get(id!);
      expect(fetched).toBeDefined();
    });

    it("lists composites", async () => {
      const list = await compositesClient.list(testProject.id);
      expect(Array.isArray(list)).toBe(true);
    });

    it("returns 404 for non-existent composite", async () => {
      try {
        await compositesClient.get(999999999);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Update", () => {
    it("updates composite name", async () => {
      const created = await compositesClient.create(
        compositeData(testProject.id, [prompt1.id])
      );
      const id = created.compositeId ?? created.id;
      const updated = await compositesClient.update(id!, { name: "Renamed Composite" });
      expect(updated.name).toBe("Renamed Composite");
    });
  });

  describe("Delete", () => {
    it("deletes a composite", async () => {
      const created = await compositesClient.create(
        compositeData(testProject.id, [prompt1.id])
      );
      const id = created.compositeId ?? created.id;
      await compositesClient.delete(id!);

      try {
        await compositesClient.get(id!);
        expect.fail("Expected 404 after deletion");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

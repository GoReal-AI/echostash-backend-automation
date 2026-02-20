import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData } from "@fixtures/test-data";
import { ProjectBuilder } from "@fixtures/builders";
import { expectValidProject } from "@helpers/assertions";
import type { Project } from "@api-types/index";

describe("Projects - CRUD", () => {
  let api: ApiClient;
  let projects: ProjectsClient;
  const createdIds: string[] = [];

  beforeAll(async () => {
    api = await getGuestClient();
    projects = new ProjectsClient(api);
  });

  afterAll(async () => {
    for (const id of createdIds) {
      try {
        await projects.delete(id);
      } catch {
        // ignore cleanup failures
      }
    }
  });

  describe("Create", () => {
    it("creates a project with name and description", async () => {
      const data = projectData({ description: "Integration test project" });
      const project = await projects.create(data);

      createdIds.push(project.id);
      expectValidProject(project);
      expect(project.name).toBe(data.name);
      expect(project.description).toBe(data.description);
    });

    it("creates a project with name only", async () => {
      const data = projectData();
      const project = await projects.create({ name: data.name });

      createdIds.push(project.id);
      expectValidProject(project);
      expect(project.name).toBe(data.name);
    });

    it("creates project using builder pattern", async () => {
      const data = new ProjectBuilder()
        .withName("Builder Test Project")
        .withDescription("Created via builder")
        .build();

      const project = await projects.create(data);
      createdIds.push(project.id);
      expect(project.name).toBe("Builder Test Project");
      expect(project.description).toBe("Created via builder");
    });

    it("rejects project creation with empty name", async () => {
      try {
        await projects.create({ name: "" });
        expect.fail("Expected validation error");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
      }
    });
  });

  describe("Read", () => {
    let testProject: Project;

    beforeAll(async () => {
      testProject = await projects.create(projectData());
      createdIds.push(testProject.id);
    });

    it("gets a project by ID", async () => {
      const fetched = await projects.get(testProject.id);
      expectValidProject(fetched);
      expect(fetched.id).toBe(testProject.id);
      expect(fetched.name).toBe(testProject.name);
    });

    it("lists projects", async () => {
      const list = await projects.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("returns 404 for non-existent project", async () => {
      try {
        await projects.get("non-existent-id-000");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Update", () => {
    let testProject: Project;

    beforeAll(async () => {
      testProject = await projects.create(projectData());
      createdIds.push(testProject.id);
    });

    it("updates project name", async () => {
      const updated = await projects.update(testProject.id, { name: "Updated Name" });
      expect(updated.name).toBe("Updated Name");
    });

    it("updates project description", async () => {
      const updated = await projects.update(testProject.id, { description: "New description" });
      expect(updated.description).toBe("New description");
    });
  });

  describe("Delete", () => {
    it("deletes a project", async () => {
      const project = await projects.create(projectData());
      await projects.delete(project.id);

      try {
        await projects.get(project.id);
        expect.fail("Expected 404 after deletion");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("returns 404 when deleting non-existent project", async () => {
      try {
        await projects.delete("non-existent-id-000");
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

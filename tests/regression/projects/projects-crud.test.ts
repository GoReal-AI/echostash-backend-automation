import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData } from "@fixtures/test-data";
import { ProjectBuilder } from "@fixtures/builders";
import { expectValidProject, expectError } from "@helpers/assertions";
import { uniqueId } from "@utils/index";
import type { Project } from "@api-types/index";

describe("Projects - Full CRUD + Validation + Ownership", () => {
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
        // ignore
      }
    }
  });

  describe("Create (PROJ-001 through PROJ-005)", () => {
    it("PROJ-001: creates a project with valid name", async () => {
      const data = projectData();
      const project = await projects.create(data);

      createdIds.push(project.id);
      expectValidProject(project);
      expect(project.name).toBe(data.name);
    });

    it("PROJ-002: creates a project with name and description", async () => {
      const data = projectData({ description: "Full CRUD test" });
      const project = await projects.create(data);

      createdIds.push(project.id);
      expectValidProject(project);
      expect(project.description).toBe("Full CRUD test");
    });

    it("PROJ-003: rejects missing name (null/undefined)", async () => {
      try {
        await projects.create({ name: null as unknown as string });
        expect.fail("Expected 400");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
      }
    });

    it("PROJ-004: rejects blank name", async () => {
      try {
        await projects.create({ name: "" });
        expect.fail("Expected 400");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBeGreaterThanOrEqual(400);
        expect(error.response?.status).toBeLessThan(500);
      }
    });

    it("PROJ-005: rejects project creation without auth", async () => {
      const unauthApi = new ApiClient();
      const unauthProjects = new ProjectsClient(unauthApi);

      try {
        await unauthProjects.create(projectData());
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });

  describe("List (PROJ-006, PROJ-007)", () => {
    it("PROJ-006: lists user projects", async () => {
      const list = await projects.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it("PROJ-007: new user gets empty project list", async () => {
      const freshApi = await getGuestClient();
      const freshProjects = new ProjectsClient(freshApi);
      const list = await freshProjects.list();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(0);
    });
  });

  describe("Get (PROJ-008 through PROJ-010)", () => {
    let testProject: Project;

    beforeAll(async () => {
      testProject = await projects.create(projectData());
      createdIds.push(testProject.id);
    });

    it("PROJ-008: gets own project by ID", async () => {
      const fetched = await projects.get(testProject.id);
      expectValidProject(fetched);
      expect(fetched.id).toBe(testProject.id);
    });

    it("PROJ-009: returns 404 for project owned by another user", async () => {
      const otherApi = await getGuestClient();
      const otherProjects = new ProjectsClient(otherApi);

      try {
        await otherProjects.get(testProject.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("PROJ-010: returns 404 for non-existent ID", async () => {
      try {
        await projects.get("non-existent-id-" + uniqueId());
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Update (PROJ-011 through PROJ-014)", () => {
    let testProject: Project;

    beforeAll(async () => {
      testProject = await projects.create(projectData());
      createdIds.push(testProject.id);
    });

    it("PROJ-011: updates project name", async () => {
      const newName = `Updated-${uniqueId()}`;
      const updated = await projects.update(testProject.id, { name: newName });
      expect(updated.name).toBe(newName);
    });

    it("PROJ-012: updates project description", async () => {
      const updated = await projects.update(testProject.id, {
        description: "Updated description",
      });
      expect(updated.description).toBe("Updated description");
    });

    it("PROJ-014: returns 404 when updating project not owned by user", async () => {
      const otherApi = await getGuestClient();
      const otherProjects = new ProjectsClient(otherApi);

      try {
        await otherProjects.update(testProject.id, { name: "Hijack" });
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Delete (PROJ-015 through PROJ-017)", () => {
    it("PROJ-015: deletes own project", async () => {
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

    it("PROJ-016: returns 404 when deleting project not owned", async () => {
      const project = await projects.create(projectData());
      createdIds.push(project.id);

      const otherApi = await getGuestClient();
      const otherProjects = new ProjectsClient(otherApi);

      try {
        await otherProjects.delete(project.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });

    it("PROJ-017: returns 404 when deleting non-existent project", async () => {
      try {
        await projects.delete("non-existent-" + uniqueId());
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

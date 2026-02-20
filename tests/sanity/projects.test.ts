import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData } from "@fixtures/test-data";
import { expectValidProject } from "@helpers/assertions";

describe("Projects - Sanity (P0)", () => {
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

  it("PROJ-001: creates a project with valid name", async () => {
    const data = projectData();
    const project = await projects.create(data);

    createdIds.push(project.id);
    expectValidProject(project);
    expect(project.name).toBe(data.name);
  });

  it("PROJ-002: creates a project with name and description", async () => {
    const data = projectData({ description: "Sanity test description" });
    const project = await projects.create(data);

    createdIds.push(project.id);
    expectValidProject(project);
    expect(project.name).toBe(data.name);
    expect(project.description).toBe("Sanity test description");
  });

  it("PROJ-006: lists user projects", async () => {
    const list = await projects.list();
    expect(Array.isArray(list)).toBe(true);
  });

  it("PROJ-008: gets a project by ID", async () => {
    const data = projectData();
    const created = await projects.create(data);
    createdIds.push(created.id);

    const fetched = await projects.get(created.id);
    expectValidProject(fetched);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(data.name);
  });
});

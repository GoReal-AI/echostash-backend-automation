import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData } from "@fixtures/test-data";
import { expectValidPrompt, expectPaginated } from "@helpers/assertions";
import type { Project, Prompt } from "@api-types/index";

describe("Prompts - Sanity (P0)", () => {
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

  it("PRMT-001: creates a prompt with minimal fields", async () => {
    const data = promptData(testProject.id);
    const prompt = await prompts.create(data);

    expectValidPrompt(prompt);
    expect(prompt.name).toBe(data.name);
    expect(prompt.projectId).toBe(Number(testProject.id));
  });

  it("PRMT-004: gets a prompt by ID", async () => {
    const created = await prompts.create(promptData(testProject.id));
    const fetched = await prompts.get(created.id);

    expectValidPrompt(fetched);
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe(created.name);
  });

  it("PRMT-007: lists prompts in a project", async () => {
    const list = await prompts.list(testProject.id);
    expectPaginated(list);
    expect(list.content.length).toBeGreaterThan(0);
  });

  it("PRMT-009: updates prompt name", async () => {
    const created = await prompts.create(promptData(testProject.id));
    const updated = await prompts.update(created.id, { name: "Updated Sanity Name" });
    expect(updated.name).toBe("Updated Sanity Name");
  });

  it("PRMT-013: deletes a prompt", async () => {
    const created = await prompts.create(promptData(testProject.id));
    await prompts.delete(created.id);

    try {
      await prompts.get(created.id);
      expect.fail("Expected 404 after deletion");
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      expect(error.response?.status).toBe(404);
    }
  });
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { EvalClient } from "@clients/eval-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, evalDatasetData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, EvalDataset } from "@api-types/index";

describe("Eval - Datasets", () => {
  let api: ApiClient;
  let evalClient: EvalClient;
  let promptsClient: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    evalClient = new EvalClient(api);
    promptsClient = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
    testPrompt = await promptsClient.create(promptData(testProject.id));
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create Dataset (EVAL-001)", () => {
    it("EVAL-001: creates a dataset with items", async () => {
      const data = evalDatasetData();
      const dataset = await evalClient.createDataset(testPrompt.id, data);

      expect(dataset).toBeDefined();
      expect(dataset.id).toBeDefined();
      expect(dataset.name).toBe(data.name);
      expect(dataset.promptId).toBe(testPrompt.id);
    });
  });

  describe("List Datasets (EVAL-002)", () => {
    it("EVAL-002: lists datasets for a prompt", async () => {
      const datasets = await evalClient.listDatasets(testPrompt.id);
      expect(Array.isArray(datasets)).toBe(true);
      expect(datasets.length).toBeGreaterThan(0);
    });
  });

  describe("Get Dataset (EVAL-003)", () => {
    it("EVAL-003: gets a dataset with cases", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      const fetched = await evalClient.getDataset(testPrompt.id, created.id);

      expect(fetched).toBeDefined();
      expect(fetched.id).toBe(created.id);
      expect(fetched.items).toBeDefined();
      expect(Array.isArray(fetched.items)).toBe(true);
    });
  });

  describe("Update Dataset (EVAL-004)", () => {
    it("EVAL-004: updates dataset description", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      const updated = await evalClient.updateDataset(testPrompt.id, created.id, {
        description: "Updated eval dataset description",
      });

      expect(updated).toBeDefined();
      expect(updated.description).toBe("Updated eval dataset description");
    });
  });

  describe("Delete Dataset (EVAL-005)", () => {
    it("EVAL-005: deletes a dataset", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      await evalClient.deleteDataset(testPrompt.id, created.id);

      try {
        await evalClient.getDataset(testPrompt.id, created.id);
        expect.fail("Expected 404 after deletion");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Auth (EVAL-028)", () => {
    it("EVAL-028: rejects dataset creation without auth", async () => {
      const unauthEval = new EvalClient(new ApiClient());

      try {
        await unauthEval.createDataset(testPrompt.id, evalDatasetData());
        expect.fail("Expected 401");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(401);
      }
    });
  });
});

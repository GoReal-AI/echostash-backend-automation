import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { EvalClient } from "@clients/eval-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, evalDatasetData, evalSuiteData, evalTestData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, EvalDataset, EvalSuite } from "@api-types/index";

describe("Eval - Suites & Tests", () => {
  let api: ApiClient;
  let evalClient: EvalClient;
  let promptsClient: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;
  let testDataset: EvalDataset;

  beforeAll(async () => {
    api = await getGuestClient();
    evalClient = new EvalClient(api);
    promptsClient = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
    testPrompt = await promptsClient.create(promptData(testProject.id));
    testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create Suite (EVAL-012)", () => {
    it("EVAL-012: creates a suite linked to a dataset", async () => {
      const data = evalSuiteData(testDataset.id);
      const suite = await evalClient.createSuite(testPrompt.id, data);

      expect(suite).toBeDefined();
      expect(suite.id).toBeDefined();
      expect(suite.name).toBe(data.name);
      expect(suite.datasetId).toBe(testDataset.id);
    });
  });

  describe("List Suites (EVAL-013)", () => {
    it("EVAL-013: lists suites for a prompt", async () => {
      const suites = await evalClient.listSuites(testPrompt.id);
      expect(Array.isArray(suites)).toBe(true);
      expect(suites.length).toBeGreaterThan(0);
    });
  });

  describe("Get Suite (EVAL-014)", () => {
    it("EVAL-014: gets a suite with its tests", async () => {
      const created = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
      const fetched = await evalClient.getSuite(testPrompt.id, created.id);

      expect(fetched).toBeDefined();
      expect(fetched.id).toBe(created.id);
      expect(fetched.tests).toBeDefined();
      expect(Array.isArray(fetched.tests)).toBe(true);
    });
  });

  describe("Delete Suite (EVAL-016)", () => {
    it("EVAL-016: deletes a suite", async () => {
      const created = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
      await evalClient.deleteSuite(testPrompt.id, created.id);

      try {
        await evalClient.getSuite(testPrompt.id, created.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Tests (EVAL-017)", () => {
    let testSuite: EvalSuite;

    beforeAll(async () => {
      testSuite = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
    });

    it("EVAL-017: creates a test with assertions", async () => {
      const data = evalTestData();
      const test = await evalClient.createTest(testPrompt.id, testSuite.id, data);

      expect(test).toBeDefined();
      expect(test.id).toBeDefined();
      expect(test.name).toBe(data.name);
      expect(test.type).toBe(data.type);
    });

    it("lists tests in a suite", async () => {
      const tests = await evalClient.listTests(testPrompt.id, testSuite.id);
      expect(Array.isArray(tests)).toBe(true);
      expect(tests.length).toBeGreaterThan(0);
    });

    it("deletes a test", async () => {
      const test = await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
      await evalClient.deleteTest(testPrompt.id, testSuite.id, test.id);

      try {
        await evalClient.getTest(testPrompt.id, testSuite.id, test.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

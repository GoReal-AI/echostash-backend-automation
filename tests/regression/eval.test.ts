import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { EvalClient } from "@clients/eval-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import {
  projectData,
  promptData,
  evalDatasetData,
  evalSuiteData,
  evalTestData,
  evalGateData,
} from "@fixtures/test-data";
import { EvalDatasetBuilder, EvalSuiteBuilder } from "@fixtures/builders";
import type { Project, Prompt, EvalDataset, EvalSuite } from "../../src/types/index.js";

describe("Eval Framework", () => {
  let api: ApiClient;
  let evalClient: EvalClient;
  let testProject: Project;
  let testPrompt: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    evalClient = new EvalClient(api);

    const projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());

    const promptsClient = new PromptsClient(api);
    testPrompt = await promptsClient.create(
      promptData(testProject.id, { content: "Hello {{name}}!" })
    );
  });

  afterAll(async () => {
    try {
      await new ProjectsClient(api).delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Datasets", () => {
    it("creates a dataset with items", async () => {
      const data = evalDatasetData();
      const dataset = await evalClient.createDataset(testPrompt.id, data);

      expect(dataset).toBeDefined();
      expect(dataset.id).toBeDefined();
      expect(dataset.name).toBe(data.name);
      expect(dataset.promptId).toBe(testPrompt.id);
      expect(Array.isArray(dataset.items)).toBe(true);
    });

    it("creates a dataset using builder", async () => {
      const data = new EvalDatasetBuilder()
        .withName("Builder Dataset")
        .withDescription("Created via builder")
        .addItem({ input: { name: "Test" }, expectedOutput: "Hello Test!" })
        .build();

      const dataset = await evalClient.createDataset(testPrompt.id, data);
      expect(dataset.name).toBe("Builder Dataset");
    });

    it("lists datasets for a prompt", async () => {
      const datasets = await evalClient.listDatasets(testPrompt.id);
      expect(Array.isArray(datasets)).toBe(true);
      expect(datasets.length).toBeGreaterThan(0);
    });

    it("gets a dataset by ID", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      const fetched = await evalClient.getDataset(testPrompt.id, created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.name).toBe(created.name);
    });

    it("updates a dataset", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      const updated = await evalClient.updateDataset(testPrompt.id, created.id, {
        name: "Updated Dataset Name",
      });
      expect(updated.name).toBe("Updated Dataset Name");
    });

    it("deletes a dataset", async () => {
      const created = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      await evalClient.deleteDataset(testPrompt.id, created.id);

      try {
        await evalClient.getDataset(testPrompt.id, created.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Suites", () => {
    let testDataset: EvalDataset;

    beforeAll(async () => {
      testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
    });

    it("creates a suite linked to a dataset", async () => {
      const data = evalSuiteData(testDataset.id);
      const suite = await evalClient.createSuite(testPrompt.id, data);

      expect(suite).toBeDefined();
      expect(suite.id).toBeDefined();
      expect(suite.name).toBe(data.name);
      expect(suite.datasetId).toBe(testDataset.id);
    });

    it("creates a suite using builder", async () => {
      const data = new EvalSuiteBuilder(testDataset.id)
        .withName("Builder Suite")
        .withDescription("Created via builder")
        .build();

      const suite = await evalClient.createSuite(testPrompt.id, data);
      expect(suite.name).toBe("Builder Suite");
    });

    it("lists suites for a prompt", async () => {
      const suites = await evalClient.listSuites(testPrompt.id);
      expect(Array.isArray(suites)).toBe(true);
      expect(suites.length).toBeGreaterThan(0);
    });

    it("gets a suite by ID", async () => {
      const created = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
      const fetched = await evalClient.getSuite(testPrompt.id, created.id);
      expect(fetched.id).toBe(created.id);
    });

    it("updates a suite", async () => {
      const created = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
      const updated = await evalClient.updateSuite(testPrompt.id, created.id, {
        name: "Renamed Suite",
      });
      expect(updated.name).toBe("Renamed Suite");
    });

    it("deletes a suite", async () => {
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

  describe("Tests", () => {
    let testDataset: EvalDataset;
    let testSuite: EvalSuite;

    beforeAll(async () => {
      testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      testSuite = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
    });

    it("creates a test in a suite", async () => {
      const data = evalTestData();
      const test = await evalClient.createTest(testPrompt.id, testSuite.id, data);

      expect(test).toBeDefined();
      expect(test.id).toBeDefined();
      expect(test.name).toBe(data.name);
      expect(test.type).toBe(data.type);
    });

    it("lists tests in a suite", async () => {
      await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
      const tests = await evalClient.listTests(testPrompt.id, testSuite.id);
      expect(Array.isArray(tests)).toBe(true);
      expect(tests.length).toBeGreaterThan(0);
    });

    it("gets a test by ID", async () => {
      const created = await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
      const fetched = await evalClient.getTest(testPrompt.id, testSuite.id, created.id);
      expect(fetched.id).toBe(created.id);
    });

    it("updates a test", async () => {
      const created = await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
      const updated = await evalClient.updateTest(testPrompt.id, testSuite.id, created.id, {
        name: "Renamed Test",
      });
      expect(updated.name).toBe("Renamed Test");
    });

    it("deletes a test", async () => {
      const created = await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
      await evalClient.deleteTest(testPrompt.id, testSuite.id, created.id);

      try {
        await evalClient.getTest(testPrompt.id, testSuite.id, created.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Runs", () => {
    let testDataset: EvalDataset;
    let testSuite: EvalSuite;

    beforeAll(async () => {
      testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      testSuite = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
      await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
    });

    it("starts an eval run", async () => {
      const run = await evalClient.startRun(testPrompt.id, testSuite.id);
      expect(run).toBeDefined();
      expect(run.id).toBeDefined();
      expect(run.status).toBeDefined();
    });

    it("lists runs for a suite", async () => {
      await evalClient.startRun(testPrompt.id, testSuite.id);
      const runs = await evalClient.listRuns(testPrompt.id, testSuite.id);
      expect(Array.isArray(runs)).toBe(true);
      expect(runs.length).toBeGreaterThan(0);
    });

    it("gets a run by ID", async () => {
      const run = await evalClient.startRun(testPrompt.id, testSuite.id);
      const fetched = await evalClient.getRun(testPrompt.id, testSuite.id, run.id);
      expect(fetched.id).toBe(run.id);
    });
  });

  describe("Gates", () => {
    let testDataset: EvalDataset;
    let testSuite: EvalSuite;

    beforeAll(async () => {
      testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
      testSuite = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
    });

    it("creates a gate", async () => {
      const data = evalGateData(testSuite.id);
      const gate = await evalClient.createGate(testPrompt.id, data);

      expect(gate).toBeDefined();
      expect(gate.id).toBeDefined();
      expect(gate.suiteId).toBe(testSuite.id);
      expect(gate.threshold).toBe(0.8);
      expect(gate.enabled).toBe(true);
    });

    it("lists gates for a prompt", async () => {
      const gates = await evalClient.listGates(testPrompt.id);
      expect(Array.isArray(gates)).toBe(true);
      expect(gates.length).toBeGreaterThan(0);
    });

    it("updates a gate", async () => {
      const created = await evalClient.createGate(testPrompt.id, evalGateData(testSuite.id));
      const updated = await evalClient.updateGate(testPrompt.id, created.id, {
        threshold: 0.95,
        enabled: false,
      });
      expect(updated.threshold).toBe(0.95);
      expect(updated.enabled).toBe(false);
    });

    it("deletes a gate", async () => {
      const created = await evalClient.createGate(testPrompt.id, evalGateData(testSuite.id));
      await evalClient.deleteGate(testPrompt.id, created.id);

      try {
        await evalClient.getGate(testPrompt.id, created.id);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });
});

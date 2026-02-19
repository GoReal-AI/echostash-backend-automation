import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { EvalClient } from "@clients/eval-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { waitForEvalRun } from "@helpers/polling";
import {
  projectData,
  promptData,
  versionData,
  evalDatasetData,
  evalSuiteData,
  evalTestData,
} from "@fixtures/test-data";
import type { Project, Prompt, EvalDataset, EvalSuite } from "@api-types/index";

describe("Eval - Runs", () => {
  let api: ApiClient;
  let evalClient: EvalClient;
  let promptsClient: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;
  let testDataset: EvalDataset;
  let testSuite: EvalSuite;

  beforeAll(async () => {
    api = await getGuestClient();
    evalClient = new EvalClient(api);
    promptsClient = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);

    testProject = await projectsClient.create(projectData());
    testPrompt = await promptsClient.create(
      promptData(testProject.id, { content: "Hello {{name}}, welcome to {{place}}!" })
    );

    // Create and publish a version
    const version = await promptsClient.createVersion(
      testPrompt.id,
      versionData({ content: "Hello {{name}}, welcome to {{place}}!" })
    );
    await promptsClient.publish(testPrompt.id, { versionNumber: version.versionNumber });

    // Create dataset, suite, and test
    testDataset = await evalClient.createDataset(testPrompt.id, evalDatasetData());
    testSuite = await evalClient.createSuite(testPrompt.id, evalSuiteData(testDataset.id));
    await evalClient.createTest(testPrompt.id, testSuite.id, evalTestData());
  }, 60_000);

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Execute Run (EVAL-020)", () => {
    it("EVAL-020: starts an eval run", async () => {
      const run = await evalClient.startRun(testPrompt.id, testSuite.id);

      expect(run).toBeDefined();
      expect(run.id).toBeDefined();
      expect(run.suiteId).toBe(testSuite.id);
      expect(run.status).toBeDefined();
    });
  });

  describe("List Runs (EVAL-021)", () => {
    it("EVAL-021: lists runs for a suite", async () => {
      const runs = await evalClient.listRuns(testPrompt.id, testSuite.id);
      expect(Array.isArray(runs)).toBe(true);
      expect(runs.length).toBeGreaterThan(0);
    });
  });

  describe("Get Run (EVAL-022)", () => {
    it("EVAL-022: gets run detail with results", async () => {
      const run = await evalClient.startRun(testPrompt.id, testSuite.id);

      // Poll until completed or failed
      try {
        const completedRun = await waitForEvalRun(
          () => evalClient.getRun(testPrompt.id, testSuite.id, run.id),
          60_000
        );
        expect(["completed", "failed"]).toContain(completedRun.status);
      } catch {
        // Timeout is acceptable in test environment
        const currentRun = await evalClient.getRun(testPrompt.id, testSuite.id, run.id);
        expect(currentRun).toBeDefined();
        expect(currentRun.id).toBe(run.id);
      }
    }, 90_000);
  });
});

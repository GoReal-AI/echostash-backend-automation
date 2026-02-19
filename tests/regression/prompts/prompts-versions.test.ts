import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiClient } from "@clients/api-client";
import { PromptsClient } from "@clients/prompts-client";
import { ProjectsClient } from "@clients/projects-client";
import { getGuestClient } from "@helpers/auth";
import { projectData, promptData, versionData } from "@fixtures/test-data";
import { uniqueId } from "@utils/index";
import type { Project, Prompt, PromptVersion } from "@api-types/index";

describe("Prompts - Versioning", () => {
  let api: ApiClient;
  let prompts: PromptsClient;
  let projectsClient: ProjectsClient;
  let testProject: Project;
  let testPrompt: Prompt;

  beforeAll(async () => {
    api = await getGuestClient();
    prompts = new PromptsClient(api);
    projectsClient = new ProjectsClient(api);
    testProject = await projectsClient.create(projectData());
    testPrompt = await prompts.create(promptData(testProject.id));
  });

  afterAll(async () => {
    try {
      await projectsClient.delete(testProject.id);
    } catch {
      // ignore
    }
  });

  describe("Create Versions (PRMT-015 through PRMT-018)", () => {
    it("PRMT-015: creates a version with text content", async () => {
      const version = await prompts.createVersion(
        testPrompt.id,
        versionData({ content: "Version content with {{variable}}" })
      );

      expect(version).toBeDefined();
      expect(version.promptId).toBe(testPrompt.id);
      expect(version.versionNumber).toBeGreaterThanOrEqual(1);
      expect(version.content).toBe("Version content with {{variable}}");
    });

    it("PRMT-018: creates a version with changelog message", async () => {
      const version = await prompts.createVersion(testPrompt.id, {
        content: `Changelog version ${uniqueId()}`,
        changeMessage: "Added new section about error handling",
      });

      expect(version).toBeDefined();
      expect(version.changeMessage).toBe("Added new section about error handling");
    });
  });

  describe("List Versions (PRMT-019)", () => {
    it("PRMT-019: lists all versions for a prompt", async () => {
      const versions = await prompts.listVersions(testPrompt.id);
      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
      versions.forEach((v) => {
        expect(v.promptId).toBe(testPrompt.id);
        expect(v.versionNumber).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe("Get Version (PRMT-020, PRMT-021)", () => {
    let knownVersion: PromptVersion;

    beforeAll(async () => {
      knownVersion = await prompts.createVersion(testPrompt.id, versionData());
    });

    it("PRMT-020: gets a specific version by number", async () => {
      const fetched = await prompts.getVersion(testPrompt.id, knownVersion.versionNumber);
      expect(fetched.versionNumber).toBe(knownVersion.versionNumber);
      expect(fetched.promptId).toBe(testPrompt.id);
      expect(fetched.content).toBe(knownVersion.content);
    });

    it("PRMT-021: returns 404 for non-existent version number", async () => {
      try {
        await prompts.getVersion(testPrompt.id, 99999);
        expect.fail("Expected 404");
      } catch (err: unknown) {
        const error = err as { response?: { status: number } };
        expect(error.response?.status).toBe(404);
      }
    });
  });

  describe("Version Number Sequencing", () => {
    it("creates multiple versions with incrementing version numbers", async () => {
      const freshPrompt = await prompts.create(promptData(testProject.id));
      const v1 = await prompts.createVersion(freshPrompt.id, versionData({ content: "v1" }));
      const v2 = await prompts.createVersion(freshPrompt.id, versionData({ content: "v2" }));
      const v3 = await prompts.createVersion(freshPrompt.id, versionData({ content: "v3" }));

      expect(v2.versionNumber).toBeGreaterThan(v1.versionNumber);
      expect(v3.versionNumber).toBeGreaterThan(v2.versionNumber);
    });
  });
});

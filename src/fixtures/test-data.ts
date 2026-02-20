import { uniqueId } from "../utils/index.js";
import type {
  CreateProjectRequest,
  CreatePromptRequest,
  CreateVersionRequest,
  CreateEvalDatasetRequest,
  CreateEvalSuiteRequest,
  CreateEvalTestRequest,
  UpdateEvalGateRequest,
  CreateCompositeRequest,
  CreateApiKeyRequest,
  CreateShortLinkRequest,
  CreateTagRequest,
  SharePromptRequest,
  EvalDatasetItem,
} from "../types/index.js";

// --- Project fixtures ---

export function projectData(overrides?: Partial<CreateProjectRequest>): CreateProjectRequest {
  return {
    name: `Test Project ${uniqueId()}`,
    description: "Auto-generated test project",
    ...overrides,
  };
}

// --- Prompt fixtures ---

export function promptData(
  projectId: number | string,
  overrides?: Partial<CreatePromptRequest>
): CreatePromptRequest {
  return {
    name: `Test Prompt ${uniqueId()}`,
    description: "An auto-generated test prompt",
    projectId,
    ...overrides,
  };
}

export function versionData(overrides?: Partial<CreateVersionRequest>): CreateVersionRequest {
  return {
    content: `Updated content v${uniqueId()}`,
    changeMessage: "Automated version bump",
    ...overrides,
  };
}

// --- Eval fixtures ---

export function evalDatasetItemData(overrides?: Partial<EvalDatasetItem>): EvalDatasetItem {
  return {
    input: { name: "Alice", place: "Wonderland" },
    expectedOutput: "Hello Alice, welcome to Wonderland!",
    ...overrides,
  };
}

export function evalDatasetData(
  overrides?: Partial<CreateEvalDatasetRequest>
): CreateEvalDatasetRequest {
  return {
    name: `Test Dataset ${uniqueId()}`,
    description: "Auto-generated eval dataset",
    items: [evalDatasetItemData(), evalDatasetItemData({ input: { name: "Bob", place: "Earth" } })],
    ...overrides,
  };
}

export function evalSuiteData(
  datasetId: string,
  overrides?: Partial<CreateEvalSuiteRequest>
): CreateEvalSuiteRequest {
  return {
    name: `Test Suite ${uniqueId()}`,
    description: "Auto-generated eval suite",
    datasetId,
    ...overrides,
  };
}

export function evalTestData(overrides?: Partial<CreateEvalTestRequest>): CreateEvalTestRequest {
  return {
    name: `Test Case ${uniqueId()}`,
    type: "exact_match",
    config: { caseSensitive: false },
    ...overrides,
  };
}

export function evalGateData(
  suiteId: number | string,
  overrides?: Partial<UpdateEvalGateRequest>
): UpdateEvalGateRequest {
  return {
    suiteId: Number(suiteId),
    threshold: 0.8,
    enabled: true,
    ...overrides,
  };
}

// --- Composite fixtures ---

export function compositeData(
  projectId: number | string,
  promptIds: (number | string)[],
  overrides?: Partial<CreateCompositeRequest>
): CreateCompositeRequest {
  return {
    name: `Test Composite ${uniqueId()}`,
    description: "Auto-generated composite prompt",
    items: promptIds.map((promptId, index) => ({
      itemType: "PROMPT",
      position: index + 1,
      promptId: Number(promptId),
    })),
    ...overrides,
  };
}

// --- API Key fixtures ---

export function apiKeyData(overrides?: Partial<CreateApiKeyRequest>): CreateApiKeyRequest {
  return {
    name: `test-key-${uniqueId()}`,
    ...overrides,
  };
}

// --- Admin fixtures ---

export function shortLinkData(overrides?: Partial<CreateShortLinkRequest>): CreateShortLinkRequest {
  return {
    code: `tst${uniqueId().slice(0, 6)}`,
    targetUrl: "https://echostash.com/test",
    ...overrides,
  };
}

export function tagData(overrides?: Partial<CreateTagRequest>): CreateTagRequest {
  return {
    name: `tag-${uniqueId()}`,
    color: "#3B82F6",
    ...overrides,
  };
}

// --- Public fixtures ---

export function shareData(promptId: string, overrides?: Partial<SharePromptRequest>): SharePromptRequest {
  return {
    promptId,
    slug: `test-share-${uniqueId()}`,
    ...overrides,
  };
}

// --- Test user data ---

export const testUser = {
  email: process.env.TEST_USER_EMAIL || "test@echostash-test.com",
  password: process.env.TEST_USER_PASSWORD || "",
};

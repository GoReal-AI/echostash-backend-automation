import { uniqueId } from "../utils/index.js";
import type {
  CreatePromptRequest,
  CreateProjectRequest,
  CreateCompositeRequest,
  CompositeStep,
  CreateEvalDatasetRequest,
  EvalDatasetItem,
  CreateEvalSuiteRequest,
} from "../types/index.js";

/**
 * Builder pattern for constructing CreatePromptRequest objects.
 *
 * Usage:
 *   const req = new PromptBuilder("project-123")
 *     .withName("My Prompt")
 *     .withContent("Hello {{user}}")
 *     .withVisibility("public")
 *     .build();
 */
export class PromptBuilder {
  private data: CreatePromptRequest;

  constructor(projectId: string) {
    this.data = {
      name: `Prompt ${uniqueId()}`,
      content: "Default content {{variable}}",
      projectId,
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withContent(content: string): this {
    this.data.content = content;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  withVisibility(visibility: string): this {
    this.data.visibility = visibility;
    return this;
  }

  build(): CreatePromptRequest {
    return { ...this.data };
  }
}

/**
 * Builder for CreateProjectRequest.
 */
export class ProjectBuilder {
  private data: CreateProjectRequest;

  constructor() {
    this.data = {
      name: `Project ${uniqueId()}`,
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  build(): CreateProjectRequest {
    return { ...this.data };
  }
}

/**
 * Builder for CreateCompositeRequest.
 */
export class CompositeBuilder {
  private data: CreateCompositeRequest;

  constructor(projectId: string) {
    this.data = {
      name: `Composite ${uniqueId()}`,
      projectId,
      steps: [],
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  addStep(step: CompositeStep): this {
    this.data.steps.push(step);
    return this;
  }

  withSteps(steps: CompositeStep[]): this {
    this.data.steps = steps;
    return this;
  }

  build(): CreateCompositeRequest {
    return { ...this.data };
  }
}

/**
 * Builder for CreateEvalDatasetRequest.
 */
export class EvalDatasetBuilder {
  private data: CreateEvalDatasetRequest;

  constructor() {
    this.data = {
      name: `Dataset ${uniqueId()}`,
      items: [],
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  addItem(item: EvalDatasetItem): this {
    this.data.items.push(item);
    return this;
  }

  withItems(items: EvalDatasetItem[]): this {
    this.data.items = items;
    return this;
  }

  build(): CreateEvalDatasetRequest {
    return { ...this.data };
  }
}

/**
 * Builder for CreateEvalSuiteRequest.
 */
export class EvalSuiteBuilder {
  private data: CreateEvalSuiteRequest;

  constructor(datasetId: string) {
    this.data = {
      name: `Suite ${uniqueId()}`,
      datasetId,
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  build(): CreateEvalSuiteRequest {
    return { ...this.data };
  }
}

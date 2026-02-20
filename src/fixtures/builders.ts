import { uniqueId } from "../utils/index.js";
import type {
  CreatePromptRequest,
  CreateProjectRequest,
  CreateCompositeRequest,
  CompositeItem,
  CreateEvalDatasetRequest,
  EvalDatasetItem,
  CreateEvalSuiteRequest,
} from "../types/index.js";

/**
 * Builder pattern for constructing CreatePromptRequest objects.
 */
export class PromptBuilder {
  private data: CreatePromptRequest;

  constructor(projectId: number | string) {
    this.data = {
      name: `Prompt ${uniqueId()}`,
      projectId,
    };
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withContent(_content: string): this {
    // Content is set on versions, not on create. Keep for builder API compat.
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
  private _items: CompositeItem[] = [];

  constructor(_projectId?: number | string) {
    this.data = {
      name: `Composite ${uniqueId()}`,
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

  addStep(step: { promptId: number | string; order: number }): this {
    this._items.push({
      itemType: "PROMPT",
      position: step.order,
      promptId: Number(step.promptId),
    });
    return this;
  }

  build(): CreateCompositeRequest {
    return { ...this.data, items: this._items };
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
    this.data.items!.push(item);
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

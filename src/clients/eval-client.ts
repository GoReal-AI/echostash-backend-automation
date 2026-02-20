import { ApiClient } from "./api-client.js";
import type {
  EvalDataset,
  CreateEvalDatasetRequest,
  UpdateEvalDatasetRequest,
  EvalSuite,
  CreateEvalSuiteRequest,
  UpdateEvalSuiteRequest,
  EvalTest,
  CreateEvalTestRequest,
  UpdateEvalTestRequest,
  EvalRun,
  EvalGate,
  UpdateEvalGateRequest,
  RunSuiteRequest,
  PaginatedResponse,
} from "../types/index.js";

export class EvalClient {
  constructor(private api: ApiClient) {}

  // --- Datasets ---

  async createDataset(promptId: number | string, data: CreateEvalDatasetRequest): Promise<EvalDataset> {
    const res = await this.api.post<EvalDataset>(`/api/prompts/${promptId}/eval/datasets`, data);
    return res.data;
  }

  async listDatasets(promptId: number | string): Promise<EvalDataset[]> {
    const res = await this.api.get<EvalDataset[]>(`/api/prompts/${promptId}/eval/datasets`);
    return res.data;
  }

  async getDataset(promptId: number | string, datasetId: string): Promise<EvalDataset> {
    const res = await this.api.get<EvalDataset>(`/api/prompts/${promptId}/eval/datasets/${datasetId}`);
    return res.data;
  }

  async updateDataset(promptId: number | string, datasetId: string, data: UpdateEvalDatasetRequest): Promise<EvalDataset> {
    const res = await this.api.put<EvalDataset>(`/api/prompts/${promptId}/eval/datasets/${datasetId}`, data);
    return res.data;
  }

  async deleteDataset(promptId: number | string, datasetId: string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/datasets/${datasetId}`);
  }

  // --- Suites ---

  async createSuite(promptId: number | string, data: CreateEvalSuiteRequest): Promise<EvalSuite> {
    const res = await this.api.post<EvalSuite>(`/api/prompts/${promptId}/eval/suites`, data);
    return res.data;
  }

  async listSuites(promptId: number | string): Promise<EvalSuite[]> {
    const res = await this.api.get<EvalSuite[]>(`/api/prompts/${promptId}/eval/suites`);
    return res.data;
  }

  async getSuite(promptId: number | string, suiteId: number | string): Promise<EvalSuite> {
    const res = await this.api.get<EvalSuite>(`/api/prompts/${promptId}/eval/suites/${suiteId}`);
    return res.data;
  }

  async updateSuite(promptId: number | string, suiteId: number | string, data: UpdateEvalSuiteRequest): Promise<EvalSuite> {
    const res = await this.api.put<EvalSuite>(`/api/prompts/${promptId}/eval/suites/${suiteId}`, data);
    return res.data;
  }

  async deleteSuite(promptId: number | string, suiteId: number | string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/suites/${suiteId}`);
  }

  // --- Tests ---

  async createTest(promptId: number | string, suiteId: number | string, data: CreateEvalTestRequest): Promise<EvalTest> {
    const res = await this.api.post<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests`,
      data
    );
    return res.data;
  }

  async listTests(promptId: number | string, suiteId: number | string): Promise<EvalTest[]> {
    const res = await this.api.get<EvalTest[]>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests`
    );
    return res.data;
  }

  async getTest(promptId: number | string, suiteId: number | string, testId: number | string): Promise<EvalTest> {
    const res = await this.api.get<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`
    );
    return res.data;
  }

  async updateTest(
    promptId: number | string,
    suiteId: number | string,
    testId: number | string,
    data: UpdateEvalTestRequest
  ): Promise<EvalTest> {
    const res = await this.api.put<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`,
      data
    );
    return res.data;
  }

  async deleteTest(promptId: number | string, suiteId: number | string, testId: number | string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`);
  }

  // --- Runs ---

  async startRun(promptId: number | string, suiteId: number | string, modelData?: Record<string, unknown>): Promise<EvalRun> {
    const body: RunSuiteRequest = { suiteId: Number(suiteId), modelData };
    const res = await this.api.post<EvalRun>(
      `/api/prompts/${promptId}/eval/run`,
      body
    );
    return res.data;
  }

  async listRuns(promptId: number | string, suiteId?: number | string): Promise<PaginatedResponse<EvalRun>> {
    const res = await this.api.get<PaginatedResponse<EvalRun>>(
      `/api/prompts/${promptId}/eval/runs`
    );
    return res.data;
  }

  async getRun(promptId: number | string, suiteId: number | string, runId: number | string): Promise<EvalRun> {
    const res = await this.api.get<EvalRun>(
      `/api/prompts/${promptId}/eval/runs/${runId}`
    );
    return res.data;
  }

  // --- Gate (singular) ---

  async getGate(promptId: number | string): Promise<EvalGate> {
    const res = await this.api.get<EvalGate>(`/api/prompts/${promptId}/eval/gate`);
    return res.data;
  }

  async updateGate(promptId: number | string, data: UpdateEvalGateRequest): Promise<EvalGate> {
    const res = await this.api.put<EvalGate>(`/api/prompts/${promptId}/eval/gate`, data);
    return res.data;
  }

  // Legacy aliases for backward compat with tests that pass gateId
  async createGate(promptId: number | string, data: UpdateEvalGateRequest): Promise<EvalGate> {
    return this.updateGate(promptId, data);
  }

  async listGates(promptId: number | string): Promise<EvalGate[]> {
    const gate = await this.getGate(promptId);
    return [gate];
  }

  async deleteGate(promptId: number | string, _gateId?: string): Promise<void> {
    // Reset gate to disabled
    await this.updateGate(promptId, { enabled: false });
  }
}

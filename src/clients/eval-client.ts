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
  CreateEvalGateRequest,
  UpdateEvalGateRequest,
} from "../types/index.js";

export class EvalClient {
  constructor(private api: ApiClient) {}

  // --- Datasets ---

  async createDataset(promptId: string, data: CreateEvalDatasetRequest): Promise<EvalDataset> {
    const res = await this.api.post<EvalDataset>(`/api/prompts/${promptId}/eval/datasets`, data);
    return res.data;
  }

  async listDatasets(promptId: string): Promise<EvalDataset[]> {
    const res = await this.api.get<EvalDataset[]>(`/api/prompts/${promptId}/eval/datasets`);
    return res.data;
  }

  async getDataset(promptId: string, datasetId: string): Promise<EvalDataset> {
    const res = await this.api.get<EvalDataset>(`/api/prompts/${promptId}/eval/datasets/${datasetId}`);
    return res.data;
  }

  async updateDataset(promptId: string, datasetId: string, data: UpdateEvalDatasetRequest): Promise<EvalDataset> {
    const res = await this.api.put<EvalDataset>(`/api/prompts/${promptId}/eval/datasets/${datasetId}`, data);
    return res.data;
  }

  async deleteDataset(promptId: string, datasetId: string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/datasets/${datasetId}`);
  }

  // --- Suites ---

  async createSuite(promptId: string, data: CreateEvalSuiteRequest): Promise<EvalSuite> {
    const res = await this.api.post<EvalSuite>(`/api/prompts/${promptId}/eval/suites`, data);
    return res.data;
  }

  async listSuites(promptId: string): Promise<EvalSuite[]> {
    const res = await this.api.get<EvalSuite[]>(`/api/prompts/${promptId}/eval/suites`);
    return res.data;
  }

  async getSuite(promptId: string, suiteId: string): Promise<EvalSuite> {
    const res = await this.api.get<EvalSuite>(`/api/prompts/${promptId}/eval/suites/${suiteId}`);
    return res.data;
  }

  async updateSuite(promptId: string, suiteId: string, data: UpdateEvalSuiteRequest): Promise<EvalSuite> {
    const res = await this.api.put<EvalSuite>(`/api/prompts/${promptId}/eval/suites/${suiteId}`, data);
    return res.data;
  }

  async deleteSuite(promptId: string, suiteId: string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/suites/${suiteId}`);
  }

  // --- Tests ---

  async createTest(promptId: string, suiteId: string, data: CreateEvalTestRequest): Promise<EvalTest> {
    const res = await this.api.post<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests`,
      data
    );
    return res.data;
  }

  async listTests(promptId: string, suiteId: string): Promise<EvalTest[]> {
    const res = await this.api.get<EvalTest[]>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests`
    );
    return res.data;
  }

  async getTest(promptId: string, suiteId: string, testId: string): Promise<EvalTest> {
    const res = await this.api.get<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`
    );
    return res.data;
  }

  async updateTest(
    promptId: string,
    suiteId: string,
    testId: string,
    data: UpdateEvalTestRequest
  ): Promise<EvalTest> {
    const res = await this.api.put<EvalTest>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`,
      data
    );
    return res.data;
  }

  async deleteTest(promptId: string, suiteId: string, testId: string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/suites/${suiteId}/tests/${testId}`);
  }

  // --- Runs ---

  async startRun(promptId: string, suiteId: string): Promise<EvalRun> {
    const res = await this.api.post<EvalRun>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/runs`
    );
    return res.data;
  }

  async listRuns(promptId: string, suiteId: string): Promise<EvalRun[]> {
    const res = await this.api.get<EvalRun[]>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/runs`
    );
    return res.data;
  }

  async getRun(promptId: string, suiteId: string, runId: string): Promise<EvalRun> {
    const res = await this.api.get<EvalRun>(
      `/api/prompts/${promptId}/eval/suites/${suiteId}/runs/${runId}`
    );
    return res.data;
  }

  // --- Gates ---

  async createGate(promptId: string, data: CreateEvalGateRequest): Promise<EvalGate> {
    const res = await this.api.post<EvalGate>(`/api/prompts/${promptId}/eval/gates`, data);
    return res.data;
  }

  async listGates(promptId: string): Promise<EvalGate[]> {
    const res = await this.api.get<EvalGate[]>(`/api/prompts/${promptId}/eval/gates`);
    return res.data;
  }

  async getGate(promptId: string, gateId: string): Promise<EvalGate> {
    const res = await this.api.get<EvalGate>(`/api/prompts/${promptId}/eval/gates/${gateId}`);
    return res.data;
  }

  async updateGate(promptId: string, gateId: string, data: UpdateEvalGateRequest): Promise<EvalGate> {
    const res = await this.api.put<EvalGate>(`/api/prompts/${promptId}/eval/gates/${gateId}`, data);
    return res.data;
  }

  async deleteGate(promptId: string, gateId: string): Promise<void> {
    await this.api.delete(`/api/prompts/${promptId}/eval/gates/${gateId}`);
  }
}

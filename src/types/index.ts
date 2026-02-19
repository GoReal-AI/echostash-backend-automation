// ============================================================
// Shared API types for the Echostash backend automation tests
// ============================================================

// --- Auth ---

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GuestAuthResponse {
  accessToken: string;
  refreshToken: string;
  userType: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: string;
  createdAt: string;
}

// --- Projects ---

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

// --- Prompts ---

export interface Prompt {
  id: string;
  name: string;
  content: string;
  description?: string;
  projectId: string;
  visibility?: string;
  tags?: Tag[];
  latestVersion?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromptRequest {
  name: string;
  content: string;
  description?: string;
  projectId: string;
  visibility?: string;
}

export interface UpdatePromptRequest {
  name?: string;
  content?: string;
  description?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  content: string;
  changeMessage?: string;
  createdAt: string;
}

export interface CreateVersionRequest {
  content: string;
  changeMessage?: string;
}

export interface PublishPromptRequest {
  versionNumber: number;
  releaseNotes?: string;
}

export interface PublishNewVersionRequest {
  content: string;
  changeMessage?: string;
  releaseNotes?: string;
}

export interface UpdateVisibilityRequest {
  visibility: string;
}

export interface PromptSearchParams {
  query?: string;
  projectId?: string;
  tags?: string[];
  visibility?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SemanticSearchParams {
  query: string;
  limit?: number;
}

// --- Tags ---

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
}

// --- API Keys ---

export interface ApiKey {
  id: string;
  name: string;
  key?: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface CreateApiKeyRequest {
  name: string;
}

// --- SDK ---

export interface SdkPromptResponse {
  id: string;
  name: string;
  content: string;
  version?: number;
  variables?: Record<string, string>;
}

export interface SdkRenderRequest {
  promptId: string;
  variables?: Record<string, string>;
}

export interface SdkBatchRenderRequest {
  items: SdkRenderItem[];
}

export interface SdkRenderItem {
  promptId: string;
  variables?: Record<string, string>;
}

export interface SdkRenderResponse {
  rendered: string;
  promptId: string;
  version: number;
}

// --- Eval ---

export interface EvalDataset {
  id: string;
  promptId: string;
  name: string;
  description?: string;
  items: EvalDatasetItem[];
  createdAt: string;
}

export interface EvalDatasetItem {
  id?: string;
  input: Record<string, string>;
  expectedOutput?: string;
}

export interface CreateEvalDatasetRequest {
  name: string;
  description?: string;
  items: EvalDatasetItem[];
}

export interface UpdateEvalDatasetRequest {
  name?: string;
  description?: string;
  items?: EvalDatasetItem[];
}

export interface EvalSuite {
  id: string;
  promptId: string;
  name: string;
  description?: string;
  datasetId: string;
  tests: EvalTest[];
  createdAt: string;
}

export interface CreateEvalSuiteRequest {
  name: string;
  description?: string;
  datasetId: string;
}

export interface UpdateEvalSuiteRequest {
  name?: string;
  description?: string;
}

export interface EvalTest {
  id: string;
  suiteId: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  createdAt: string;
}

export interface CreateEvalTestRequest {
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface UpdateEvalTestRequest {
  name?: string;
  type?: string;
  config?: Record<string, unknown>;
}

export interface EvalRun {
  id: string;
  suiteId: string;
  status: string;
  results?: EvalRunResult[];
  startedAt: string;
  completedAt?: string;
}

export interface EvalRunResult {
  testId: string;
  passed: boolean;
  score?: number;
  details?: Record<string, unknown>;
}

export interface EvalGate {
  id: string;
  promptId: string;
  suiteId: string;
  threshold: number;
  enabled: boolean;
  createdAt: string;
}

export interface CreateEvalGateRequest {
  suiteId: string;
  threshold: number;
  enabled?: boolean;
}

export interface UpdateEvalGateRequest {
  threshold?: number;
  enabled?: boolean;
}

// --- Composites ---

export interface Composite {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  steps: CompositeStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CompositeStep {
  promptId: string;
  order: number;
  inputMapping?: Record<string, string>;
}

export interface CreateCompositeRequest {
  name: string;
  description?: string;
  projectId: string;
  steps: CompositeStep[];
}

export interface UpdateCompositeRequest {
  name?: string;
  description?: string;
  steps?: CompositeStep[];
}

// --- Context Store ---

export interface ContextAsset {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
}

export interface ContextStoreUsage {
  totalAssets: number;
  totalSize: number;
  maxSize: number;
}

// --- Analytics ---

export interface AnalyticsOverview {
  totalPrompts: number;
  totalRenders: number;
  totalProjects: number;
  period: { from: string; to: string };
}

export interface PromptMetrics {
  promptId: string;
  renders: number;
  avgLatency: number;
  errorRate: number;
}

export interface TopPromptsParams {
  from?: string;
  to?: string;
  limit?: number;
}

export interface VariableUsageParams {
  from?: string;
  to?: string;
}

// --- Billing ---

export interface BillingProfile {
  id: string;
  plan: string;
  status: string;
}

export interface BillingPortal {
  url: string;
}

export interface BillingQuotas {
  prompts: { used: number; limit: number };
  renders: { used: number; limit: number };
  storage: { used: number; limit: number };
}

export interface SpendingData {
  currentMonth: number;
  limit: number;
}

export interface UpdateSpendingRequest {
  limit: number;
}

export interface SpendingHistoryEntry {
  month: string;
  amount: number;
}

// --- Public ---

export interface PublicPrompt {
  id: string;
  name: string;
  content: string;
  slug: string;
  author: string;
  views: number;
  upvotes: number;
  forks: number;
}

export interface PublicSearchParams {
  query?: string;
  tags?: string[];
  sort?: string;
  page?: number;
  size?: number;
}

export interface SharePromptRequest {
  promptId: string;
  slug?: string;
}

export interface PromptPack {
  id: string;
  name: string;
  description: string;
  prompts: PublicPrompt[];
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

// --- Admin ---

export interface ShortLink {
  id: string;
  code: string;
  targetUrl: string;
  clicks: number;
  createdAt: string;
}

export interface CreateShortLinkRequest {
  code: string;
  targetUrl: string;
}

// --- PLP ---

export interface PlpDiscovery {
  name: string;
  version: string;
  endpoints: Record<string, string>;
}

export interface PlpPrompt {
  id: string;
  name: string;
  content: string;
  version: string;
  metadata?: Record<string, unknown>;
}

export interface PlpSearchParams {
  query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// --- Common ---

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: string;
  timestamp?: string;
  path?: string;
}

// ============================================================
// Shared API types for the Echostash backend automation tests
// ============================================================

// --- Auth ---

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface GuestAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isFirstLogin: boolean;
}

export interface UserProfile {
  sub: string;
  acct_type: string;
  scope: string;
  exp: number;
  planName: string;
  email?: string;
  name?: string;
  picture?: string;
}

// --- Projects ---

export interface Project {
  id: string;
  name: string;
  description?: string;
  promptCount?: number;
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
  id: number;
  name: string;
  description?: string;
  projectId?: number;
  visibility?: string;
  publicSlug?: string;
  createdAt?: string;
  updatedAt?: string;
  // Only in detail response
  publishedVersion?: PromptVersionDetail | null;
  // Only in summary response
  viewCount?: number;
  upvoteCount?: number;
  forkCount?: number;
  // Only in create response
  content?: unknown;
  tags?: Tag[];
}

export interface CreatePromptRequest {
  name: string;
  description?: string;
  projectId: number | string;
  visibility?: string;
  publicSlug?: string;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
  visibility?: string;
}

export interface PromptVersionDetail {
  id: number;
  versionNo: number;
  content: unknown[];
  parameterSymbol?: string;
  promptMetaData?: Record<string, unknown>;
  createdAt: string;
  changelog?: string;
}

export interface PromptVersion {
  id: number;
  versionNo: number;
  createdAt: string;
  changelog?: string;
  // Full detail fields (only in getVersion response)
  content?: unknown[];
  parameterSymbol?: string;
  promptMetaData?: Record<string, unknown>;
}

export interface CreateVersionResponse {
  id: number;
  versionNo: number;
}

export interface CreateVersionRequest {
  content: string;
  changeMessage?: string;
}

export interface PublishPromptRequest {
  versionNo: number;
}

export interface PublishPromptResponse {
  promptId: number;
  versionId: number;
  versionNo: number;
}

export interface PublishNewVersionRequest {
  content: string;
  changeMessage?: string;
}

export interface UpdateVisibilityRequest {
  visibility: string;
}

export interface PromptSearchParams {
  name?: string;
  projectId?: number | string;
  tagIds?: number[];
  visibility?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

export interface SemanticSearchParams {
  query: string;
  limit?: number;
  threshold?: number;
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
  id: number;
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
  id: number;
  name: string;
  description?: string;
  content: unknown[] | null;
  parameterSymbol?: string;
  promptMetaData?: Record<string, unknown>;
  publishedVersionNo?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SdkVersionResponse {
  versionNo: number;
  content: unknown[];
  parameterSymbol?: string;
  promptMetaData?: Record<string, unknown>;
  createdAt: string;
}

export interface SdkRenderRequest {
  variables?: Record<string, string>;
  version?: string;
}

export interface SdkBatchRenderRequest {
  items: SdkRenderItem[];
}

export interface SdkRenderItem {
  promptId: number | string;
  version?: string;
  variables?: Record<string, string>;
}

export interface SdkRenderResponse {
  content: string;
  promptId: number;
  versionNo: number;
}

export interface SdkBatchRenderResponse {
  results: Record<string, { content?: string; versionNo?: number; error?: string }>;
  successCount: number;
  errorCount: number;
}

// --- Eval ---

export interface EvalDataset {
  id: string;
  promptId?: number;
  name: string;
  description?: string;
  items?: EvalDatasetItem[];
  cases?: EvalDatasetCase[];
  createdAt?: string;
}

export interface EvalDatasetItem {
  id?: string;
  input: Record<string, string>;
  expectedOutput?: string;
}

export interface EvalDatasetCase {
  name: string;
  variables: Record<string, string>;
  expectedOutput?: string;
}

export interface CreateEvalDatasetRequest {
  name: string;
  description?: string;
  items?: EvalDatasetItem[];
  cases?: EvalDatasetCase[];
}

export interface UpdateEvalDatasetRequest {
  name?: string;
  description?: string;
}

export interface EvalSuite {
  id: number;
  promptId?: number;
  name: string;
  description?: string;
  datasetId: string;
  tests?: EvalTest[];
  createdAt?: string;
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
  id: number;
  suiteId?: number;
  name: string;
  type: string;
  config?: Record<string, unknown>;
  createdAt?: string;
}

export interface CreateEvalTestRequest {
  name: string;
  type: string;
  config?: Record<string, unknown>;
}

export interface UpdateEvalTestRequest {
  name?: string;
  type?: string;
  config?: Record<string, unknown>;
}

export interface EvalRun {
  id: number;
  suiteId?: number;
  status: string;
  results?: EvalRunResult[];
  startedAt?: string;
  completedAt?: string;
}

export interface EvalRunResult {
  testId?: number;
  passed?: boolean;
  score?: number;
  details?: Record<string, unknown>;
}

export interface EvalGate {
  suiteId?: number;
  threshold?: number;
  enabled?: boolean;
}

export interface UpdateEvalGateRequest {
  suiteId?: number;
  threshold?: number;
  enabled?: boolean;
}

export interface RunSuiteRequest {
  suiteId: number;
  modelData?: Record<string, unknown>;
}

// --- Composites ---

export interface Composite {
  id?: number;
  compositeId?: number;
  versionNo?: number;
  name?: string;
  description?: string;
  ownerType?: string;
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
  latestVersionNo?: number;
  // Legacy fields for test compatibility
  projectId?: string | number;
  steps?: CompositeStep[];
}

export interface CompositeStep {
  itemType?: string;
  position?: number;
  promptId?: number | string;
  promptVersionNo?: number;
  required?: boolean;
  // Legacy
  order?: number;
}

export interface CompositeItem {
  itemType: string;
  position: number;
  promptId?: number;
  promptVersionNo?: number;
  required?: boolean;
}

export interface CreateCompositeRequest {
  name: string;
  description?: string;
  items?: CompositeItem[];
  modelData?: Record<string, unknown>;
  // Legacy
  projectId?: string | number;
  steps?: CompositeStep[];
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
  status: string;
  planName: string;
  managedByProvider: boolean;
  startedAt: string | null;
  expiresAt: string | null;
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
  name: string;
  metadata: {
    title: string;
    description: string;
    price: number | null;
    currency: string;
    badge?: string | null;
    ctaText?: string;
    isVisible: boolean;
    order: number;
  };
  billing: Record<string, unknown>;
  quotas: Record<string, unknown>;
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
  server_name: string;
  plp_version: string;
  capabilities: Record<string, unknown>;
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

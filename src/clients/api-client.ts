import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getEnvConfig } from "../config/index.js";

export interface ApiClientOptions {
  baseURL?: string;
  token?: string;
  apiKey?: string;
  timeout?: number;
  logging?: boolean;
  maxRetries?: number;
}

interface RequestMetadata {
  startTime: number;
}

const requestMetadata = new WeakMap<InternalAxiosRequestConfig, RequestMetadata>();

export class ApiClient {
  private client: AxiosInstance;
  private logging: boolean;
  private maxRetries: number;

  constructor(options: ApiClientOptions = {}) {
    const envConfig = getEnvConfig();
    this.logging = options.logging ?? envConfig.logging;
    this.maxRetries = options.maxRetries ?? envConfig.maxRetries;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }
    if (options.apiKey) {
      headers["X-API-KEY"] = options.apiKey;
    }

    this.client = axios.create({
      baseURL: options.baseURL || envConfig.apiUrl,
      timeout: options.timeout || envConfig.timeout,
      headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: logging + timing
    this.client.interceptors.request.use((config) => {
      requestMetadata.set(config, { startTime: Date.now() });
      if (this.logging) {
        const method = (config.method || "GET").toUpperCase();
        const url = config.url || "";
        console.log(`[API] --> ${method} ${url}`);
      }
      return config;
    });

    // Response interceptor: logging + timing
    this.client.interceptors.response.use(
      (response) => {
        if (this.logging) {
          const meta = requestMetadata.get(response.config);
          const elapsed = meta ? Date.now() - meta.startTime : 0;
          console.log(
            `[API] <-- ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${elapsed}ms)`
          );
        }
        return response;
      },
      (error: AxiosError) => {
        if (this.logging && error.response) {
          const meta = error.config ? requestMetadata.get(error.config) : undefined;
          const elapsed = meta ? Date.now() - meta.startTime : 0;
          console.log(
            `[API] <-- ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url} (${elapsed}ms)`
          );
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  setApiKey(apiKey: string): void {
    this.client.defaults.headers.common["X-API-KEY"] = apiKey;
  }

  /** Returns the elapsed time in ms for the last request in the response headers (approximation via interceptor). */
  getResponseTime(response: AxiosResponse): number {
    const meta = requestMetadata.get(response.config);
    return meta ? Date.now() - meta.startTime : -1;
  }

  private async withRetry<T>(fn: () => Promise<AxiosResponse<T>>): Promise<AxiosResponse<T>> {
    let lastError: AxiosError | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        const axiosErr = err as AxiosError;
        const status = axiosErr.response?.status;
        const isRetryable = status === 429 || (status !== undefined && status >= 500);
        if (!isRetryable || attempt >= this.maxRetries) {
          throw err;
        }
        lastError = axiosErr;
        const delay = Math.min(1000 * Math.pow(2, attempt), 10_000);
        if (this.logging) {
          console.log(`[API] Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms (status=${status})`);
        }
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastError;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() => this.client.get<T>(url, config));
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() => this.client.post<T>(url, data, config));
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() => this.client.put<T>(url, data, config));
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() => this.client.patch<T>(url, data, config));
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() => this.client.delete<T>(url, config));
  }

  /**
   * Upload a file using multipart/form-data.
   * @param url - endpoint path
   * @param formData - a FormData instance (or plain object for Node: key-value of field name to value/stream)
   * @param config - additional axios config
   */
  async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.withRetry(() =>
      this.client.post<T>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      })
    );
  }
}

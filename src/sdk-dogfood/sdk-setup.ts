/**
 * SDK Dogfood Setup
 *
 * This module provides infrastructure for testing the Echostash SDK client
 * against the live API. It mirrors how real SDK consumers would use the package.
 *
 * NOTE: The actual @echostash/sdk package may not be published yet.
 * When it becomes available, replace the placeholder import below with:
 *   import { EchostashClient } from "@echostash/sdk";
 */

import { getTestConfig } from "../config/index.js";

// --- Placeholder SDK types (replace with real SDK types when available) ---

export interface EchostashSdkOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface SdkPrompt {
  id: string;
  name: string;
  content: string;
  version: number;
}

export interface SdkRenderResult {
  rendered: string;
  promptId: string;
  version: number;
}

/**
 * Placeholder SDK client that wraps the real SDK.
 * Replace the implementation internals once the SDK is published.
 */
export class EchostashSdkClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: EchostashSdkOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || getTestConfig().env.apiUrl;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Placeholder: Fetch a prompt by ID.
   * Will delegate to the real SDK once available.
   */
  async getPrompt(_id: string): Promise<SdkPrompt> {
    throw new Error("SDK not yet available. Replace this placeholder with the real SDK import.");
  }

  /**
   * Placeholder: Render a prompt with variables.
   */
  async render(
    _promptId: string,
    _variables?: Record<string, string>
  ): Promise<SdkRenderResult> {
    throw new Error("SDK not yet available. Replace this placeholder with the real SDK import.");
  }
}

/**
 * Create a dogfood SDK client using the test API key from config.
 */
export function createDogfoodClient(apiKey?: string): EchostashSdkClient {
  const config = getTestConfig();
  return new EchostashSdkClient({
    apiKey: apiKey || config.testApiKey,
    baseUrl: config.env.apiUrl,
  });
}

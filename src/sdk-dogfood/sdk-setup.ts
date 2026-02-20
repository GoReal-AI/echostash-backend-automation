/**
 * SDK Dogfood Setup
 *
 * This module provides infrastructure for testing the Echostash SDK client
 * against the live API. It mirrors how real SDK consumers would use the package.
 */

import { Echostash, LoadedPrompt, EchostashError } from "@goreal-ai/echostash";
import { getTestConfig } from "../config/index.js";

export { Echostash, LoadedPrompt, EchostashError };

export type { RenderResponse } from "@goreal-ai/echostash";

/**
 * Create a dogfood SDK client using the test API key from config.
 */
export function createDogfoodClient(apiKey?: string): Echostash {
  const config = getTestConfig();
  return new Echostash(config.env.apiUrl, {
    apiKey: apiKey || config.testApiKey,
  });
}

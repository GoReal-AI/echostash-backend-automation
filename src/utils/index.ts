import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/index.js";

/**
 * Sleep for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random alphanumeric string.
 */
export function randomString(length: number = 8): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

/**
 * Generate a random email address for testing.
 */
export function randomEmail(): string {
  return `test_${randomString()}@echostash-test.com`;
}

/**
 * Generate a short unique identifier (8 chars).
 */
export function uniqueId(): string {
  return `${Date.now().toString(36)}${randomString(4)}`;
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD).
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Parse an Axios error into a structured ApiErrorResponse.
 * Returns undefined if the error is not an Axios error with a response.
 */
export function parseApiError(error: unknown): ApiErrorResponse | undefined {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Record<string, unknown> | undefined;
    return {
      status: error.response.status,
      message: (data?.message as string) || error.message,
      error: data?.error as string | undefined,
      timestamp: data?.timestamp as string | undefined,
      path: data?.path as string | undefined,
    };
  }
  return undefined;
}

/**
 * Retry a function with exponential backoff.
 * @param fn - Async function to retry
 * @param maxAttempts - Maximum number of attempts (default 3)
 * @param baseDelayMs - Base delay between retries in ms (default 1000)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

/**
 * Wait until a condition is met by polling.
 * @param fn - Async function that returns a value to check
 * @param predicate - Returns true when the condition is met
 * @param timeoutMs - Maximum time to wait (default 30s)
 * @param intervalMs - Polling interval (default 1s)
 */
export async function waitFor<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs: number = 30_000,
  intervalMs: number = 1_000
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await fn();
    if (predicate(value)) {
      return value;
    }
    await sleep(intervalMs);
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

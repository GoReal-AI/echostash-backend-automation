import { AxiosResponse, AxiosError } from "axios";
import { expect } from "vitest";
import type { PaginatedResponse, Prompt, Project } from "../types/index.js";

/**
 * Assert that the response has the expected HTTP status code.
 */
export function expectStatus(response: AxiosResponse, expectedStatus: number): void {
  expect(response.status).toBe(expectedStatus);
}

/**
 * Assert that the data looks like a valid Prompt object.
 */
export function expectValidPrompt(data: Prompt): void {
  expect(data).toBeDefined();
  expect(data.id).toBeDefined();
  expect(data.name).toBeDefined();
  expect(typeof data.name).toBe("string");
}

/**
 * Assert that the data looks like a valid Project object.
 */
export function expectValidProject(data: Project): void {
  expect(data).toBeDefined();
  expect(data.id).toBeDefined();
  expect(data.name).toBeDefined();
  expect(typeof data.name).toBe("string");
}

/**
 * Assert that the data is a valid paginated response.
 */
export function expectPaginated<T>(data: PaginatedResponse<T>): void {
  expect(data).toBeDefined();
  expect(Array.isArray(data.content)).toBe(true);
  expect(typeof data.totalElements).toBe("number");
  expect(typeof data.totalPages).toBe("number");
  expect(typeof data.number).toBe("number");
  expect(typeof data.size).toBe("number");
  expect(typeof data.first).toBe("boolean");
  expect(typeof data.last).toBe("boolean");
}

/**
 * Assert that a request failed with the expected status code and optional message.
 * Pass the error thrown by axios (or a caught AxiosError).
 */
export function expectError(error: unknown, statusCode: number, message?: string): void {
  expect(error).toBeDefined();
  const axiosError = error as AxiosError<{ message?: string }>;
  expect(axiosError.response).toBeDefined();
  expect(axiosError.response!.status).toBe(statusCode);
  if (message) {
    expect(axiosError.response!.data?.message).toContain(message);
  }
}

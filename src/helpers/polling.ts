/**
 * Poll a function until a predicate is satisfied or timeout is reached.
 * @param fn - Async function to call on each poll iteration
 * @param predicate - Returns true when polling should stop
 * @param timeoutMs - Maximum time to poll (default 30s)
 * @param intervalMs - Delay between polls (default 2s)
 * @returns The value that satisfied the predicate
 */
export async function pollUntil<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs: number = 30_000,
  intervalMs: number = 2_000
): Promise<T> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const value = await fn();
    if (predicate(value)) {
      return value;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(`pollUntil timed out after ${timeoutMs}ms`);
}

/**
 * Wait for an eval run to reach a terminal status (completed / failed).
 */
export async function waitForEvalRun(
  fetchRun: () => Promise<{ status: string }>,
  timeoutMs: number = 60_000,
  intervalMs: number = 3_000
): Promise<{ status: string }> {
  return pollUntil(
    fetchRun,
    (run) => run.status === "completed" || run.status === "failed",
    timeoutMs,
    intervalMs
  );
}

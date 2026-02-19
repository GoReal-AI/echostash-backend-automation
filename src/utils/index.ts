export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomString(length: number = 8): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

export function randomEmail(): string {
  return `test_${randomString()}@echostash-test.com`;
}

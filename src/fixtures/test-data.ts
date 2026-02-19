export const testPrompt = {
  name: "Test Prompt",
  content: "This is a test prompt created by automation",
  tags: ["test", "automation"],
};

export const testUser = {
  email: process.env.TEST_USER_EMAIL || "test@echostash-test.com",
  password: process.env.TEST_USER_PASSWORD || "",
};

export function uniqueName(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

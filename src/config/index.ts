import dotenv from "dotenv";
import path from "path";
import { getEnvConfig, type EnvConfig } from "./environments.js";

const envFile = process.env.ENV_FILE || ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export { getEnvConfig } from "./environments.js";
export type { EnvConfig } from "./environments.js";

export interface TestConfig {
  env: EnvConfig;
  testUserEmail: string;
  testUserPassword: string;
  testApiKey: string;
  googleTestToken: string;
  /** Feature flags */
  features: {
    evalEnabled: boolean;
    billingEnabled: boolean;
    plpEnabled: boolean;
    analyticsEnabled: boolean;
    contextStoreEnabled: boolean;
  };
}

export function getTestConfig(): TestConfig {
  const env = getEnvConfig();
  return {
    env,
    testUserEmail: process.env.TEST_USER_EMAIL || "test@echostash-test.com",
    testUserPassword: process.env.TEST_USER_PASSWORD || "",
    testApiKey: process.env.TEST_API_KEY || "",
    googleTestToken: process.env.GOOGLE_TEST_TOKEN || "",
    features: {
      evalEnabled: process.env.FEATURE_EVAL !== "false",
      billingEnabled: process.env.FEATURE_BILLING !== "false",
      plpEnabled: process.env.FEATURE_PLP !== "false",
      analyticsEnabled: process.env.FEATURE_ANALYTICS !== "false",
      contextStoreEnabled: process.env.FEATURE_CONTEXT_STORE !== "false",
    },
  };
}

export interface EnvConfig {
  apiUrl: string;
  env: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Whether to enable request/response logging */
  logging: boolean;
  /** Max retry attempts for 429/5xx responses */
  maxRetries: number;
}

const environments: Record<string, EnvConfig> = {
  local: {
    apiUrl: "http://localhost:8085",
    env: "local",
    timeout: 15_000,
    logging: true,
    maxRetries: 2,
  },
  stage: {
    apiUrl: "https://stage-api.echostash.com",
    env: "stage",
    timeout: 30_000,
    logging: false,
    maxRetries: 3,
  },
  prod: {
    apiUrl: "https://api.echostash.com",
    env: "prod",
    timeout: 30_000,
    logging: false,
    maxRetries: 3,
  },
};

export function getEnvConfig(): EnvConfig {
  const env = process.env.ENV || "local";
  const config = environments[env];
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }
  return config;
}

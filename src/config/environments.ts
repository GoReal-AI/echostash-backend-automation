export interface EnvConfig {
  apiUrl: string;
  env: string;
}

const environments: Record<string, EnvConfig> = {
  local: {
    apiUrl: "http://localhost:8085",
    env: "local",
  },
  stage: {
    apiUrl: "https://stage-api.echostash.com",
    env: "stage",
  },
  prod: {
    apiUrl: "https://api.echostash.com",
    env: "prod",
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

import dotenv from "dotenv";
import path from "path";

const envFile = process.env.ENV_FILE || ".env";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export { getEnvConfig } from "./environments.js";
export type { EnvConfig } from "./environments.js";

/**
 * Trigger Analytics Script
 *
 * Standalone script that uses the @goreal-ai/echostash SDK to trigger
 * analytics events by calling get() and render() on a prompt.
 *
 * Environment variables:
 *   API_KEY   (required) - Echostash API key
 *   PROMPT_ID (required) - Prompt ID to fetch/render
 *   BASE_URL  (optional) - API base URL (defaults to stage)
 *   VARIABLES (optional) - JSON string of variables for render
 */

import { Echostash } from "@goreal-ai/echostash";

const apiKey = process.env.API_KEY;
const promptId = process.env.PROMPT_ID;
const baseUrl =
  process.env.BASE_URL || "https://gra-echostash-be-stage.up.railway.app";
const variablesRaw = process.env.VARIABLES;

if (!apiKey) {
  console.error("ERROR: API_KEY environment variable is required");
  process.exit(1);
}

if (!promptId) {
  console.error("ERROR: PROMPT_ID environment variable is required");
  process.exit(1);
}

let variables: Record<string, string> | undefined;
if (variablesRaw) {
  try {
    variables = JSON.parse(variablesRaw);
  } catch {
    console.error("ERROR: VARIABLES must be a valid JSON string");
    process.exit(1);
  }
}

async function main() {
  console.log(`Connecting to ${baseUrl}`);
  console.log(`Prompt ID: ${promptId}`);
  if (variables) {
    console.log(`Variables: ${JSON.stringify(variables)}`);
  }

  const es = new Echostash(baseUrl, { apiKey });

  // Step 1: Fetch prompt (triggers analytics)
  console.log("\n--- Fetching prompt (get) ---");
  const prompt = await es.prompt(promptId!).get();
  console.log(`Prompt fetched: id=${prompt.id}, name=${prompt.name ?? "N/A"}`);

  // Step 2: Server-side render (triggers analytics)
  console.log("\n--- Rendering prompt (render) ---");
  const renderResult = await es
    .prompt(promptId!)
    .version("published")
    .render(variables ?? {});
  console.log(`Render result: promptId=${renderResult.promptId}, versionNo=${renderResult.versionNo}`);
  console.log(`Content preview: ${renderResult.content.slice(0, 200)}`);

  console.log("\nAnalytics triggers completed successfully.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});

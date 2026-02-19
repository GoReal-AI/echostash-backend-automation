import { ApiClient } from "../clients/api-client.js";
import { KeysClient } from "../clients/keys-client.js";
import { uniqueId } from "../utils/index.js";

/**
 * Create a new API key via the management API and return the raw key string.
 * Requires an authenticated ApiClient (JWT-based).
 */
export async function createAndGetApiKey(
  authenticatedApi: ApiClient,
  name?: string
): Promise<string> {
  const keysClient = new KeysClient(authenticatedApi);
  const created = await keysClient.create(name || `test-key-${uniqueId()}`);
  if (!created.key) {
    throw new Error("API key was created but the raw key was not returned");
  }
  return created.key;
}

/**
 * Create a new API key and return an ApiClient configured to use it.
 */
export async function getNewApiKeyClient(authenticatedApi: ApiClient): Promise<ApiClient> {
  const rawKey = await createAndGetApiKey(authenticatedApi);
  return new ApiClient({ apiKey: rawKey });
}

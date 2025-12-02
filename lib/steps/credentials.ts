/**
 * Step input enricher - adds API keys and credentials to step inputs
 * For test runs: uses user's stored credentials
 * For production: uses system environment variables
 *
 * Built-in actions (Log, HTTP Request, Condition) don't need credentials.
 * Learners will add credential enrichment when building the Resend plugin.
 */

export type CredentialSource = "user" | "system";

export type EnvVarConfig = {
  DATABASE_URL?: string;
  // Add plugin credentials here as you build them:
  // RESEND_API_KEY?: string;
  // RESEND_FROM_EMAIL?: string;
};

/**
 * Get credentials based on source
 */
export function getCredentials(
  source: CredentialSource,
  userEnvVars?: EnvVarConfig
): EnvVarConfig {
  if (source === "user" && userEnvVars) {
    return userEnvVars;
  }

  // For production, use system environment variables
  return {
    DATABASE_URL: process.env.DATABASE_URL,
  };
}

/**
 * Enrich step input with necessary credentials based on action type
 * Built-in actions don't need credential enrichment.
 * Add handlers here when building plugins.
 */
export function enrichStepInput(
  actionType: string,
  input: Record<string, unknown>,
  _credentials: EnvVarConfig
): Record<string, unknown> {
  const enrichedInput = { ...input };

  // Built-in actions (Log, HTTP Request, Condition) don't need credentials
  // Add plugin credential handlers here:
  // const actionHandlers: Record<string, () => void> = {
  //   "Send Email": () => enrichResendCredentials(enrichedInput, credentials),
  // };
  //
  // const handler = actionHandlers[actionType];
  // if (handler) {
  //   handler();
  // }

  return enrichedInput;
}

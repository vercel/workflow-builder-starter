/**
 * Simple Log action step for workflow execution
 * Logs a message to console and returns success
 *
 * This is the simplest possible action - useful for debugging
 * and demonstrating workflow execution without external dependencies.
 */
import "server-only";

export async function logActionStep(input: {
  message?: string;
  data?: unknown;
}) {
  "use step";

  const timestamp = new Date().toISOString();
  const message = input.message || "Log step executed";

  console.log(`[Log Action] ${timestamp}: ${message}`);

  if (input.data) {
    console.log("[Log Action] Data:", JSON.stringify(input.data, null, 2));
  }

  return {
    success: true,
    message,
    timestamp,
    data: input.data,
  };
}

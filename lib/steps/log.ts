/**
 * Log step - outputs a message to the console
 * The simplest possible action for debugging workflows
 */
import "server-only";

export async function logStep(input: {
  // Normalized format
  message?: string;
  level?: "info" | "warn" | "error";
  data?: unknown;
  // UI config format
  logMessage?: string;
  logLevel?: "info" | "warn" | "error";
}): Promise<{ success: true; logged: string; timestamp: string }> {
  "use step";

  // Accept both UI config format (logMessage, logLevel) and normalized format (message, level)
  const message = input.message || input.logMessage || "Log step executed";
  const level = input.level || input.logLevel || "info";
  const timestamp = new Date().toISOString();

  // Log with appropriate level
  const logFn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  logFn(`[Workflow Log] ${message}`, input.data ? { data: input.data } : "");

  return {
    success: true,
    logged: message,
    timestamp,
  };
}

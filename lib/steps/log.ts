/**
 * Log step - outputs a message to the console
 * The simplest possible action for debugging workflows
 */
import "server-only";

import { type StepInput, withStepLogging } from "./step-handler";

type LogInput = StepInput & {
  // Normalized format
  message?: string;
  level?: "info" | "warn" | "error";
  data?: unknown;
  // UI config format
  logMessage?: string;
  logLevel?: "info" | "warn" | "error";
};

type LogResult = {
  success: true;
  logged: string;
  timestamp: string;
};

function stepHandler(input: LogInput): LogResult {
  // Accept both UI config format (logMessage, logLevel) and normalized format (message, level)
  const message = input.message || input.logMessage || "Log step executed";
  const level = input.level || input.logLevel || "info";
  const timestamp = new Date().toISOString();

  // Log with appropriate level
  let logFn: typeof console.log;
  if (level === "error") {
    logFn = console.error;
  } else if (level === "warn") {
    logFn = console.warn;
  } else {
    logFn = console.log;
  }

  logFn(`[Workflow Log] ${message}`, input.data ? { data: input.data } : "");

  return {
    success: true,
    logged: message,
    timestamp,
  };
}

// biome-ignore lint/suspicious/useAwait: async required for workflow step signature
export async function logStep(input: LogInput): Promise<LogResult> {
  "use step";
  return withStepLogging(input, async () => stepHandler(input));
}

/**
 * Step registry - maps action types to executable step functions
 * This allows the workflow executor to call step functions directly
 * without code generation or eval()
 *
 * Built-in steps only. Plugin steps are added via the plugin system.
 */

import type { conditionStep } from "./condition";
import type { httpRequestStep } from "./http-request";
import type { logStep } from "./log";
import type { logNodeCompleteStep, logNodeStartStep } from "./logging";

// Step function type
export type StepFunction = (input: Record<string, unknown>) => Promise<unknown>;

// Registry of all available steps (built-in only)
// ┌────────────────────────────────────────────────────────────────────────┐
// │ LESSON 3: Add your Resend plugin step here                             │
// │ Example:                                                               │
// │   "Send Email": async (input) =>                                       │
// │     (await import("../../plugins/resend/steps/send-email/step"))       │
// │       .sendEmailStep(input as Parameters<typeof sendEmailStep>[0]),    │
// └────────────────────────────────────────────────────────────────────────┘
export const stepRegistry: Record<string, StepFunction> = {
  Log: async (input) =>
    (await import("./log")).logStep(input as Parameters<typeof logStep>[0]),
  "HTTP Request": async (input) =>
    (await import("./http-request")).httpRequestStep(
      input as Parameters<typeof httpRequestStep>[0]
    ),
  Condition: async (input) =>
    (await import("./condition")).conditionStep(
      input as Parameters<typeof conditionStep>[0]
    ),
  "Log Node Start": async (input) =>
    (await import("./logging")).logNodeStartStep(
      input as Parameters<typeof logNodeStartStep>[0]
    ),
  "Log Node Complete": async (input) =>
    (await import("./logging")).logNodeCompleteStep(
      input as Parameters<typeof logNodeCompleteStep>[0]
    ),
};

// Helper to check if a step exists
export function hasStep(actionType: string): boolean {
  return actionType in stepRegistry;
}

// Helper to get a step function
export function getStep(actionType: string): StepFunction | undefined {
  return stepRegistry[actionType];
}

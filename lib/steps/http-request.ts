/**
 * Executable step function for HTTP Request action
 */
import "server-only";

import { getErrorMessage } from "../utils";

type HttpRequestResult =
  | { success: true; data: unknown; status: number }
  | { success: false; error: string; status?: number };

/**
 * HTTP Request step
 * Accepts either UI config format (endpoint, httpMethod, httpBody) or
 * normalized format (url, method, body)
 */
export async function httpRequestStep(input: {
  // UI config format
  endpoint?: string;
  httpMethod?: string;
  httpBody?: string;
  httpHeaders?: string | Record<string, string>;
  // Normalized format
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Promise<HttpRequestResult> {
  "use step";

  // Normalize input - support both UI config and direct format
  const url = input.endpoint || input.url;
  const method = input.httpMethod || input.method || "POST";

  // Parse headers
  let headers: Record<string, string> = { "Content-Type": "application/json" };
  if (input.httpHeaders) {
    if (typeof input.httpHeaders === "string") {
      try {
        headers = { ...headers, ...JSON.parse(input.httpHeaders) };
      } catch {
        // Keep default headers
      }
    } else {
      headers = { ...headers, ...input.httpHeaders };
    }
  } else if (input.headers) {
    headers = { ...headers, ...input.headers };
  }

  // Parse body
  let body: string | undefined;
  if (method !== "GET") {
    if (input.httpBody) {
      body = typeof input.httpBody === "string" ? input.httpBody : JSON.stringify(input.httpBody);
    } else if (input.body) {
      body = typeof input.body === "string" ? input.body : JSON.stringify(input.body);
    }
  }

  if (!url) {
    return {
      success: false,
      error: "URL is required for HTTP Request",
    };
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        status: response.status,
      };
    }

    // Try JSON, fall back to text
    const contentType = response.headers.get("content-type");
    let data: unknown;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: `HTTP request failed: ${getErrorMessage(error)}`,
    };
  }
}

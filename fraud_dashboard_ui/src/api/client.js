/**
 * Minimal API client wrapper for the dashboard.
 * Uses fetch with timeouts, consistent error handling, and base URL via env var.
 */

const DEFAULT_TIMEOUT_MS = 30000;

function getApiBaseUrl() {
  // CRA requires REACT_APP_ prefix and only reads env vars at startup.
  // Trim trailing slashes so path concatenation is stable.
  return (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");
}

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);

  // If caller provides a signal, abort this controller when the caller aborts.
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }

  return { controller, cleanup: () => clearTimeout(timeout) };
}

async function readJsonOrText(resp) {
  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return resp.json();

  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isProbablyHtml(text) {
  return typeof text === "string" && /<\s*(!doctype|html|head|body)\b/i.test(text);
}

function summarizeHtmlError(text) {
  // Common Express error response includes "Cannot POST /path".
  const cannotMatch = typeof text === "string" ? text.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^\s<]+)/i) : null;
  if (cannotMatch) {
    return `Backend route not found: ${cannotMatch[0]}. Check REACT_APP_API_BASE_URL and that the backend is running.`;
  }

  // Generic HTML response (often a 404 page, proxy error, or app shell).
  return "Backend returned an HTML error page (likely wrong API base URL or missing route).";
}

class ApiError extends Error {
  constructor(message, { status, data, url, method }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.url = url;
    this.method = method;
  }
}

// PUBLIC_INTERFACE
export async function apiFetch(path, { method = "GET", headers, body, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = {}) {
  /** Fetch wrapper for REST endpoints with consistent errors and base URL handling. */
  const base = getApiBaseUrl();

  if (!base) {
    // Fail fast with a clear configuration message (common cause: calls going to :3000).
    throw new ApiError(
      "Missing REACT_APP_API_BASE_URL. Set it (e.g., http://localhost:3001) and restart the frontend dev server.",
      { status: 0, data: null, url: path, method }
    );
  }

  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const { controller, cleanup } = withTimeout(signal, timeoutMs);

  try {
    const resp = await fetch(url, {
      method,
      headers: {
        // For FormData, do not set Content-Type; the browser will set the multipart boundary.
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(headers || {})
      },
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal
    });

    const data = await readJsonOrText(resp);

    if (!resp.ok) {
      let msg =
        (data && typeof data === "object" && (data.error || data.message)) ||
        (typeof data === "string" && data) ||
        `Request failed with status ${resp.status}`;

      // If backend (or a proxy) returns HTML, show a more actionable summary.
      if (isProbablyHtml(data)) {
        msg = `${summarizeHtmlError(data)} (HTTP ${resp.status} ${method} ${url})`;
      } else if (typeof data === "string" && /Cannot\s+\w+\s+\//i.test(data)) {
        // Handles rare cases where "Cannot POST /..." comes as plain text.
        msg = `${summarizeHtmlError(data)} (HTTP ${resp.status} ${method} ${url})`;
      } else {
        // Add context for non-HTML errors too.
        msg = `${msg} (HTTP ${resp.status} ${method} ${url})`;
      }

      throw new ApiError(msg, { status: resp.status, data, url, method });
    }

    return data;
  } finally {
    cleanup();
  }
}

// PUBLIC_INTERFACE
export function getConfiguredApiBaseUrl() {
  /** Returns the configured backend base URL (useful for showing configuration hints). */
  return getApiBaseUrl();
}

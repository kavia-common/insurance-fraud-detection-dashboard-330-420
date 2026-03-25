/**
 * Minimal API client wrapper for the dashboard.
 * Uses fetch with timeouts, consistent error handling, and base URL via env var.
 */

const DEFAULT_TIMEOUT_MS = 30000;

function getApiBaseUrl() {
  // CRA requires REACT_APP_ prefix.
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
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const { controller, cleanup } = withTimeout(signal, timeoutMs);

  try {
    const resp = await fetch(url, {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(headers || {})
      },
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal
    });

    const data = await readJsonOrText(resp);

    if (!resp.ok) {
      const msg =
        (data && typeof data === "object" && (data.error || data.message)) ||
        (typeof data === "string" && data) ||
        `Request failed with status ${resp.status}`;
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

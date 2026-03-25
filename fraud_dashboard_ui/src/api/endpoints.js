import { apiFetch } from "./client";

// PUBLIC_INTERFACE
export async function uploadClaimsCsv(file) {
  /** Upload a CSV file to the backend for parsing/scoring. */
  const form = new FormData();
  form.append("file", file);
  return apiFetch("/api/claims/upload", { method: "POST", body: form });
}

// PUBLIC_INTERFACE
export async function listClaims({ q, riskBand, sortBy, sortDir } = {}) {
  /** List claims with optional query/filter/sort parameters. */
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (riskBand) params.set("riskBand", riskBand);
  if (sortBy) params.set("sortBy", sortBy);
  if (sortDir) params.set("sortDir", sortDir);
  const qs = params.toString();
  return apiFetch(`/api/claims${qs ? `?${qs}` : ""}`);
}

// PUBLIC_INTERFACE
export async function getClaimById(id) {
  /** Fetch a single claim by id. */
  return apiFetch(`/api/claims/${encodeURIComponent(id)}`);
}

// PUBLIC_INTERFACE
export async function submitClaimOutcome(id, { outcome, notes } = {}) {
  /** Submit investigator outcome for a claim. */
  return apiFetch(`/api/claims/${encodeURIComponent(id)}/outcome`, {
    method: "POST",
    body: { outcome, notes }
  });
}

// PUBLIC_INTERFACE
export async function getQueue() {
  /** Fetch investigator queue (prioritized claims). */
  return apiFetch("/api/queue");
}

// PUBLIC_INTERFACE
export async function getReportsSummary() {
  /** Fetch summary metrics used by reports and topbar. */
  return apiFetch("/api/reports/summary");
}

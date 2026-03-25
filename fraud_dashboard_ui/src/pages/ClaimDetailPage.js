import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getClaimById, submitClaimOutcome } from "../api/endpoints";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, RiskBadge, Select } from "../components/ui";

function safe(v) {
  return v == null || v === "" ? "—" : String(v);
}

function normalizeSignals(claim) {
  const signals = claim?.signals || claim?.fraudSignals || claim?.fraud_signals || [];
  if (Array.isArray(signals)) return signals;
  return [];
}

// PUBLIC_INTERFACE
export default function ClaimDetailPage() {
  /** Claim detail page with investigator review submission. */
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [claim, setClaim] = useState(null);

  const [outcome, setOutcome] = useState("confirmed_fraud");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getClaimById(id);
        if (!mounted) return;
        const c = data?.claim || data; // accept either envelope or direct claim
        setClaim(c);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load claim.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const signals = useMemo(() => normalizeSignals(claim), [claim]);

  const onSubmit = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      await submitClaimOutcome(id, { outcome, notes });
      setSaveSuccess("Outcome submitted.");
    } catch (e) {
      setSaveError(e?.message || "Failed to submit outcome.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="row row--spaceBetween row--wrap">
        <div className="row">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
        <div className="row">
          <Button variant="secondary" onClick={() => navigate("/queue")}>
            Queue
          </Button>
          <Button variant="secondary" onClick={() => navigate("/claims")}>
            Claims
          </Button>
        </div>
      </div>

      <div className="mt16">
        {loading ? (
          <LoadingState label="Loading claim…" />
        ) : error ? (
          <ErrorState title="Failed to load claim" message={error} />
        ) : !claim ? (
          <EmptyState title="Claim not found" message="The selected claim could not be loaded." />
        ) : (
          <>
            <Card
              title={`Claim ${safe(claim.claimNumber || claim.claim_no || claim.id)}`}
              subtitle={`Policy ${safe(claim.policyNumber || claim.policy_no)} • Loss date ${safe(
                claim.lossDate || claim.loss_date
              )}`}
              right={<RiskBadge riskScore={claim.riskScore ?? claim.risk_score ?? claim.risk} />}
            >
              <div className="grid grid--2">
                <div className="kv">
                  <div className="kv__k">Claimant</div>
                  <div className="kv__v">{safe(claim.claimantName || claim.claimant_name || claim.name)}</div>
                </div>
                <div className="kv">
                  <div className="kv__k">Status</div>
                  <div className="kv__v">
                    <Badge tone="neutral">{safe(claim.status)}</Badge>
                  </div>
                </div>
                <div className="kv">
                  <div className="kv__k">Amount</div>
                  <div className="kv__v">{safe(claim.amount || claim.claimAmount)}</div>
                </div>
                <div className="kv">
                  <div className="kv__k">Location</div>
                  <div className="kv__v">{safe(claim.location || claim.loss_location)}</div>
                </div>
              </div>

              <div className="mt16">
                <h3 className="h3">Fraud signals</h3>
                {signals.length === 0 ? (
                  <EmptyState title="No signals" message="No rule-based signals were attached to this claim." />
                ) : (
                  <ul className="signals">
                    {signals.map((s, idx) => {
                      const name = s.name || s.rule || s.signal || `Signal ${idx + 1}`;
                      const detail = s.detail || s.description || s.reason || "";
                      const severity = (s.severity || s.level || "").toLowerCase();
                      const tone = severity === "high" ? "danger" : severity === "medium" ? "warning" : "neutral";
                      return (
                        <li key={idx} className="signals__item">
                          <div className="signals__head">
                            <div className="signals__name">{safe(name)}</div>
                            <Badge tone={tone}>{safe(severity || "signal")}</Badge>
                          </div>
                          {detail && <div className="signals__detail">{detail}</div>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </Card>

            <div className="mt16">
              <Card title="Investigator review" subtitle="Record the investigation outcome and notes.">
                <div className="grid grid--2">
                  <label className="field">
                    <span className="field__label">Outcome</span>
                    <Select value={outcome} onChange={e => setOutcome(e.target.value)}>
                      <option value="confirmed_fraud">Confirmed fraud</option>
                      <option value="suspected_fraud">Suspected fraud</option>
                      <option value="no_fraud">No fraud</option>
                      <option value="needs_more_info">Needs more info</option>
                    </Select>
                  </label>

                  <label className="field">
                    <span className="field__label">Notes</span>
                    <textarea
                      className="textarea"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Write a short rationale, supporting evidence, and next steps…"
                      rows={5}
                    />
                    <span className="field__hint">Stored with the claim’s outcome for auditability.</span>
                  </label>
                </div>

                <div className="row row--right mt16">
                  <Button variant="primary" onClick={onSubmit} disabled={saving}>
                    {saving ? "Submitting…" : "Submit outcome"}
                  </Button>
                </div>

                {saveError && <div className="mt12"><ErrorState title="Submit failed" message={saveError} /></div>}
                {saveSuccess && (
                  <div className="mt12 state state--success" role="status" aria-live="polite">
                    {saveSuccess}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

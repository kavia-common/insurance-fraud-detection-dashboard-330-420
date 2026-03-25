import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listClaims } from "../api/endpoints";
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, RiskBadge, Select, Table } from "../components/ui";

function formatMoney(v) {
  const num = typeof v === "number" ? v : v ? Number(v) : null;
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function safe(v) {
  return v == null || v === "" ? "—" : String(v);
}

// PUBLIC_INTERFACE
export default function ClaimsPage() {
  /** Claims table with search/filter/sort and risk band indicators. */
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claims, setClaims] = useState([]);

  const q = searchParams.get("q") || "";
  const riskBand = searchParams.get("riskBand") || "";
  const sortBy = searchParams.get("sortBy") || "riskScore";
  const sortDir = searchParams.get("sortDir") || "desc";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listClaims({ q, riskBand, sortBy, sortDir });
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : data?.claims || [];
        setClaims(rows);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load claims.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [q, riskBand, sortBy, sortDir]);

  const columns = useMemo(
    () => [
      { key: "claimNumber", header: "Claim #", render: r => safe(r.claimNumber || r.claim_no || r.id) },
      { key: "policyNumber", header: "Policy", render: r => safe(r.policyNumber || r.policy_no) },
      { key: "lossDate", header: "Loss Date", render: r => safe(r.lossDate || r.loss_date) },
      { key: "amount", header: "Amount", className: "tRight", render: r => formatMoney(r.amount || r.claimAmount) },
      {
        key: "riskScore",
        header: "Risk",
        render: r => <RiskBadge riskScore={r.riskScore ?? r.risk_score ?? r.risk} />
      },
      { key: "status", header: "Status", render: r => safe(r.status || r.queueStatus) }
    ],
    []
  );

  const onRowClick = row => {
    const id = row.id || row.claimId || row.claim_id || row.claimNumber || row.claim_no;
    if (!id) return;
    navigate(`/claims/${encodeURIComponent(id)}`);
  };

  const applyParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "q") next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="page">
      <Card
        title="Claims"
        subtitle="Browse all ingested claims. Filter and prioritize by fraud risk signals."
        right={
          <Button variant="secondary" onClick={() => navigate("/upload")}>
            Upload more
          </Button>
        }
      >
        <div className="filters">
          <Input
            label="Search"
            value={q}
            onChange={e => applyParam("q", e.target.value)}
            placeholder="Claim #, policy #, name…"
          />

          <Select label="Risk band" value={riskBand} onChange={e => applyParam("riskBand", e.target.value)}>
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>

          <Select label="Sort by" value={sortBy} onChange={e => applyParam("sortBy", e.target.value)}>
            <option value="riskScore">Risk</option>
            <option value="amount">Amount</option>
            <option value="lossDate">Loss date</option>
          </Select>

          <Select label="Direction" value={sortDir} onChange={e => applyParam("sortDir", e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </Select>
        </div>

        <div className="mt16">
          {loading ? (
            <LoadingState label="Loading claims…" />
          ) : error ? (
            <ErrorState title="Failed to load claims" message={error} />
          ) : claims.length === 0 ? (
            <EmptyState
              title="No claims found"
              message="Try changing filters, or upload a claims CSV to get started."
              action={
                <Button variant="primary" onClick={() => navigate("/upload")}>
                  Go to Upload
                </Button>
              }
            />
          ) : (
            <Table columns={columns} rows={claims} getRowKey={r => r.id || r.claimId || r.claim_id || r.claim_no || r.claimNumber} onRowClick={onRowClick} />
          )}
        </div>
      </Card>
    </div>
  );
}

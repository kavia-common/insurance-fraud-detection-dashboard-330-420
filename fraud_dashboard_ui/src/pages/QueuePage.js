import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQueue } from "../api/endpoints";
import { Button, Card, EmptyState, ErrorState, LoadingState, RiskBadge, Table } from "../components/ui";

function safe(v) {
  return v == null || v === "" ? "—" : String(v);
}

// PUBLIC_INTERFACE
export default function QueuePage() {
  /** Investigator queue page showing prioritized items for review. */
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getQueue();
        if (!mounted) return;
        const rows = Array.isArray(data) ? data : data?.queue || [];
        setItems(rows);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load queue.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = useMemo(
    () => [
      { key: "priority", header: "Priority", render: r => safe(r.priority ?? r.rank ?? r.queueRank) },
      { key: "claimNumber", header: "Claim #", render: r => safe(r.claimNumber || r.claim_no || r.id) },
      { key: "reason", header: "Reason", render: r => safe(r.reason || r.topSignal || r.signal) },
      { key: "riskScore", header: "Risk", render: r => <RiskBadge riskScore={r.riskScore ?? r.risk_score ?? r.risk} /> },
      { key: "status", header: "Status", render: r => safe(r.status) }
    ],
    []
  );

  const onRowClick = row => {
    const id = row.id || row.claimId || row.claim_id || row.claimNumber || row.claim_no;
    if (!id) return;
    navigate(`/claims/${encodeURIComponent(id)}`);
  };

  return (
    <div className="page">
      <Card
        title="Investigator Queue"
        subtitle="High priority claims requiring investigator review."
        right={
          <Button variant="secondary" onClick={() => navigate("/claims")}>
            View all claims
          </Button>
        }
      >
        <div className="mt16">
          {loading ? (
            <LoadingState label="Loading queue…" />
          ) : error ? (
            <ErrorState title="Failed to load queue" message={error} />
          ) : items.length === 0 ? (
            <EmptyState
              title="Queue is empty"
              message="When high-risk claims are detected they will appear here."
              action={
                <Button variant="primary" onClick={() => navigate("/upload")}>
                  Upload claims
                </Button>
              }
            />
          ) : (
            <Table columns={columns} rows={items} getRowKey={r => r.id || r.claimId || r.claim_id || r.claim_no || r.claimNumber} onRowClick={onRowClick} />
          )}
        </div>
      </Card>
    </div>
  );
}

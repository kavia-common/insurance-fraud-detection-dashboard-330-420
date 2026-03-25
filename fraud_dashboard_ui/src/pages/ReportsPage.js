import React, { useEffect, useMemo, useState } from "react";
import { getReportsSummary } from "../api/endpoints";
import { Card, EmptyState, ErrorState, LoadingState } from "../components/ui";

function toPairs(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj);
}

// PUBLIC_INTERFACE
export default function ReportsPage() {
  /** Reports summary page showing aggregate metrics and distributions. */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getReportsSummary();
        if (!mounted) return;
        setSummary(data);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load report summary.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const riskBreakdown = useMemo(() => toPairs(summary?.riskBreakdown || summary?.risk_breakdown), [summary]);
  const outcomes = useMemo(() => toPairs(summary?.outcomes || summary?.outcomeBreakdown), [summary]);

  return (
    <div className="page">
      <Card title="Reports" subtitle="Summary analytics for risk signals and investigation outcomes.">
        {loading ? (
          <LoadingState label="Loading report summary…" />
        ) : error ? (
          <ErrorState title="Reports unavailable" message={error} />
        ) : !summary ? (
          <EmptyState title="No summary data" message="Upload claims and review items to generate report summaries." />
        ) : (
          <>
            <div className="grid grid--4">
              <div className="stat">
                <div className="stat__label">Total Claims</div>
                <div className="stat__value">{summary.totalClaims ?? "—"}</div>
              </div>
              <div className="stat">
                <div className="stat__label">High Risk</div>
                <div className="stat__value">{summary.highRisk ?? "—"}</div>
              </div>
              <div className="stat">
                <div className="stat__label">In Queue</div>
                <div className="stat__value">{summary.inQueue ?? "—"}</div>
              </div>
              <div className="stat">
                <div className="stat__label">Reviewed Today</div>
                <div className="stat__value">{summary.reviewedToday ?? "—"}</div>
              </div>
            </div>

            <div className="mt16 grid grid--2">
              <Card title="Risk breakdown" subtitle="Distribution across risk bands.">
                {riskBreakdown.length === 0 ? (
                  <EmptyState title="No breakdown" message="Backend did not return a risk breakdown yet." />
                ) : (
                  <div className="bars">
                    {riskBreakdown.map(([k, v]) => (
                      <div className="bar" key={k}>
                        <div className="bar__label">{k}</div>
                        <div className="bar__value">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Outcomes" subtitle="Investigator outcomes summary.">
                {outcomes.length === 0 ? (
                  <EmptyState title="No outcomes" message="Submit outcomes from claim review to populate this chart." />
                ) : (
                  <div className="bars">
                    {outcomes.map(([k, v]) => (
                      <div className="bar" key={k}>
                        <div className="bar__label">{k}</div>
                        <div className="bar__value">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="mt16">
              <Card title="Raw summary payload" subtitle="Useful while backend responses evolve.">
                <pre className="pre">{JSON.stringify(summary, null, 2)}</pre>
              </Card>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

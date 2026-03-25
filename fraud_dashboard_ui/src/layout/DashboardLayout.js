import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { getReportsSummary } from "../api/endpoints";
import { ErrorState, LoadingState } from "../components/ui";
import { getConfiguredApiBaseUrl } from "../api/client";

function usePageTitleFromRoute(pathname) {
  return useMemo(() => {
    if (pathname.startsWith("/upload")) return "Upload Claims";
    if (pathname.startsWith("/claims/")) return "Claim Review";
    if (pathname.startsWith("/claims")) return "Claims";
    if (pathname.startsWith("/queue")) return "Investigator Queue";
    if (pathname.startsWith("/reports")) return "Reports";
    return "Dashboard";
  }, [pathname]);
}

// PUBLIC_INTERFACE
export default function DashboardLayout() {
  /** App shell layout with left navigation and top metrics bar. */
  const location = useLocation();
  const title = usePageTitleFromRoute(location.pathname);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const data = await getReportsSummary();
        if (!mounted) return;
        setSummary(data);
      } catch (e) {
        if (!mounted) return;
        const base = getConfiguredApiBaseUrl();
        setSummaryError(
          `${e?.message || "Failed to load summary metrics."}${
            base ? "" : " (Missing REACT_APP_API_BASE_URL configuration)"
          }`
        );
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = [
    { key: "totalClaims", label: "Total Claims", value: summary?.totalClaims },
    { key: "highRisk", label: "High Risk", value: summary?.highRisk },
    { key: "inQueue", label: "In Queue", value: summary?.inQueue },
    { key: "reviewedToday", label: "Reviewed Today", value: summary?.reviewedToday }
  ];

  return (
    <div className="appShell">
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__brand">
          <div className="sidebar__logo">FS</div>
          <div className="sidebar__brandText">
            <div className="sidebar__brandTitle">Fraud Signals</div>
            <div className="sidebar__brandSub">Investigator Dashboard</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink className={({ isActive }) => `nav__link ${isActive ? "isActive" : ""}`} to="/upload">
            Upload
          </NavLink>
          <NavLink className={({ isActive }) => `nav__link ${isActive ? "isActive" : ""}`} to="/claims">
            Claims
          </NavLink>
          <NavLink className={({ isActive }) => `nav__link ${isActive ? "isActive" : ""}`} to="/queue">
            Queue
          </NavLink>
          <NavLink className={({ isActive }) => `nav__link ${isActive ? "isActive" : ""}`} to="/reports">
            Reports
          </NavLink>
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__hint">API:</div>
          <div className="sidebar__api">{getConfiguredApiBaseUrl() || "Not configured"}</div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__title">
            <h1 className="h1">{title}</h1>
            <div className="topbar__subtitle">Monitor risk signals, triage queue, and review outcomes.</div>
          </div>

          <div className="metrics" aria-label="Summary metrics">
            {summaryLoading ? (
              <div className="metrics__loading">
                <LoadingState label="Loading metrics…" />
              </div>
            ) : summaryError ? (
              <div className="metrics__error">
                <ErrorState title="Metrics unavailable" message={summaryError} />
              </div>
            ) : (
              metrics.map(m => (
                <div className="metric" key={m.key}>
                  <div className="metric__label">{m.label}</div>
                  <div className="metric__value">{m.value ?? "—"}</div>
                </div>
              ))
            )}
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

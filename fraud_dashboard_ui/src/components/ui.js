import React from "react";

// PUBLIC_INTERFACE
export function Card({ title, subtitle, right, children, className = "" }) {
  /** Presentational card used across dashboard pages. */
  return (
    <section className={`card ${className}`}>
      {(title || subtitle || right) && (
        <div className="card__header">
          <div className="card__headerText">
            {title && <h2 className="card__title">{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {right && <div className="card__headerRight">{right}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}

// PUBLIC_INTERFACE
export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  /** Standard button with variants and sizes. */
  return <button className={`btn btn--${variant} btn--${size} ${className}`} {...props} />;
}

// PUBLIC_INTERFACE
export function Input({ label, hint, className = "", ...props }) {
  /** Labeled input component. */
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <input className="input" {...props} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Select({ label, hint, className = "", children, ...props }) {
  /** Labeled select component. */
  return (
    <label className={`field ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <select className="select" {...props}>
        {children}
      </select>
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Badge({ tone = "neutral", children }) {
  /** Small badge for statuses and risk bands. */
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

// PUBLIC_INTERFACE
export function RiskBadge({ riskScore }) {
  /** Risk badge computed from numeric risk score (0..1 or 0..100). */
  const score = typeof riskScore === "number" ? riskScore : null;
  let normalized = score;
  if (score != null && score > 1) normalized = score / 100;

  const tone =
    normalized == null ? "neutral" : normalized >= 0.8 ? "danger" : normalized >= 0.5 ? "warning" : "success";
  const label =
    normalized == null ? "Unknown" : normalized >= 0.8 ? "High" : normalized >= 0.5 ? "Medium" : "Low";

  return (
    <span className="risk">
      <Badge tone={tone}>{label}</Badge>
      {normalized != null && <span className="risk__score">{Math.round(normalized * 100)}%</span>}
    </span>
  );
}

// PUBLIC_INTERFACE
export function LoadingState({ label = "Loading…" }) {
  /** Simple loading skeleton/indicator. */
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <div>{label}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function ErrorState({ title = "Something went wrong", message, action }) {
  /** Error message box. */
  return (
    <div className="state state--error" role="alert">
      <div className="state__title">{title}</div>
      {message && <div className="state__message">{message}</div>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

// PUBLIC_INTERFACE
export function EmptyState({ title = "Nothing here yet", message, action }) {
  /** Empty state prompt. */
  return (
    <div className="state state--empty">
      <div className="state__title">{title}</div>
      {message && <div className="state__message">{message}</div>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Table({ columns, rows, getRowKey, onRowClick }) {
  /** Generic table component with column definitions. */
  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className || ""}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={getRowKey(row)}
              className={onRowClick ? "table__rowClickable" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? e => {
                      if (e.key === "Enter" || e.key === " ") onRowClick(row);
                    }
                  : undefined
              }
              role={onRowClick ? "button" : undefined}
            >
              {columns.map(col => (
                <td key={col.key} className={col.className || ""}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

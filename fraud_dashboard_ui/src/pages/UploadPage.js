import React, { useCallback, useMemo, useRef, useState } from "react";
import { uploadClaimsCsv } from "../api/endpoints";
import { Button, Card, EmptyState, ErrorState, LoadingState } from "../components/ui";

function isCsv(file) {
  const name = (file?.name || "").toLowerCase();
  return name.endsWith(".csv") || file?.type === "text/csv";
}

// PUBLIC_INTERFACE
export default function UploadPage() {
  /** CSV Upload page (drag/drop) for ingesting claims into the system. */
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const canUpload = useMemo(() => !!file && isCsv(file) && status !== "uploading", [file, status]);

  const onPickFile = useCallback(e => {
    const f = e.target.files?.[0] || null;
    setResult(null);
    setError("");
    setStatus("idle");
    setFile(f);
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragOver(false);

    const f = e.dataTransfer.files?.[0] || null;
    setResult(null);
    setError("");
    setStatus("idle");
    setFile(f);
  }, []);

  const onUpload = useCallback(async () => {
    if (!canUpload) return;
    setStatus("uploading");
    setError("");
    setResult(null);
    try {
      const data = await uploadClaimsCsv(file);
      setResult(data);
      setStatus("success");
    } catch (e) {
      setError(e?.message || "Upload failed.");
      setStatus("error");
    }
  }, [canUpload, file]);

  return (
    <div className="page">
      <Card
        title="Upload claims CSV"
        subtitle="Drag & drop a CSV file to ingest claims and compute fraud risk signals."
        right={
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onPickFile}
          style={{ display: "none" }}
        />

        <div
          className={`dropzone ${dragOver ? "isDragOver" : ""}`}
          onDragOver={e => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload CSV dropzone"
        >
          <div className="dropzone__title">{file ? file.name : "Drop CSV here"}</div>
          <div className="dropzone__sub">
            {file ? `${Math.round((file.size || 0) / 1024)} KB` : "or click to select a file"}
          </div>

          {file && !isCsv(file) && (
            <div className="dropzone__error">Please select a .csv file.</div>
          )}
        </div>

        <div className="row row--right">
          <Button variant="primary" disabled={!canUpload} onClick={onUpload}>
            Upload & Process
          </Button>
        </div>

        <div className="mt16">
          {status === "uploading" && <LoadingState label="Uploading and processing…" />}
          {status === "error" && <ErrorState title="Upload failed" message={error} />}
          {status === "success" && result && (
            <Card title="Upload result" subtitle="Backend processing response">
              <pre className="pre">{JSON.stringify(result, null, 2)}</pre>
            </Card>
          )}
          {status === "idle" && !file && (
            <EmptyState
              title="No file selected"
              message="Upload a claims CSV to populate the dashboard with claims and fraud signals."
            />
          )}
        </div>
      </Card>
    </div>
  );
}

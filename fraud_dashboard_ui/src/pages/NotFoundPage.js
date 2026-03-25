import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 404 page for unknown routes within the SPA. */
  const navigate = useNavigate();
  return (
    <div className="page">
      <Card title="Page not found" subtitle="That route does not exist in the dashboard.">
        <div className="row">
          <Button variant="primary" onClick={() => navigate("/claims")}>
            Go to Claims
          </Button>
          <Button variant="secondary" onClick={() => navigate("/upload")}>
            Go to Upload
          </Button>
        </div>
      </Card>
    </div>
  );
}

import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./layout/DashboardLayout";
import UploadPage from "./pages/UploadPage";
import ClaimsPage from "./pages/ClaimsPage";
import QueuePage from "./pages/QueuePage";
import ClaimDetailPage from "./pages/ClaimDetailPage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

// PUBLIC_INTERFACE
function App() {
  /** Root application component configuring SPA routes and dashboard shell. */
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/claims" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from "react";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./AuthContext";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import ErrorBoundary from "./components/ErrorBoundary";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RecordsPage from "./pages/RecordsPage";
import IngestPage from "./pages/IngestPage";
import AuditPage from "./pages/AuditPage";

const ProtectedRoute = ({
  children,
}) => {

  const { user } = useAuth();

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="
      flex
      min-h-screen
      bg-slate-50
    ">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Layout */}

      <div className="
        flex-1
        flex
        flex-col
        min-w-0
      ">

        {/* Topbar */}

        <TopBar />

        {/* Main Content */}

        <main className="
          flex-1
          overflow-y-auto
          px-6
          py-8
          lg:px-10
          bg-gradient-to-br
          from-slate-50
          via-slate-50
          to-blue-50/30
        ">

          <div className="
            max-w-[1600px]
            mx-auto
          ">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {

  return (
    <ErrorBoundary>

      <Routes>

        {/* Login */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Default Redirect */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Records */}

        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <RecordsPage />
            </ProtectedRoute>
          }
        />

        {/* Ingest */}

        <Route
          path="/ingest"
          element={
            <ProtectedRoute>
              <IngestPage />
            </ProtectedRoute>
          }
        />

        {/* Audit */}

        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <AuditPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </ErrorBoundary>
  );
}
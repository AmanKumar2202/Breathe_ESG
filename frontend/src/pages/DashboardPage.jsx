import React from "react";

import { useQuery } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import {
  Cloud,
  AlertTriangle,
  FileCheck,
  UploadCloud,
  Database,
  Activity,
} from "lucide-react";

import { useAuth } from "../AuthContext";

import { get } from "../utils/client";
import { ENDPOINTS } from "../utils/endpoints";

import StatCard from "../components/StatCard";
import MonthlyTrendChart from "../components/MonthlyTrendChart";
import ScopeBreakdownChart from "../components/ScopeBreakdownChart";
import ReviewStatusBreakdown from "../components/ReviewStatusBreakdown";
import RecentJobsList from "../components/RecentJobsList";

export default function DashboardPage() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: () =>
      get(ENDPOINTS.DASHBOARD_SUMMARY),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-500 text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-red-500 text-lg">
        Error loading dashboard data.
      </div>
    );
  }

  const totalCO2e = Object.values(
    data?.total_co2e_by_scope || {}
  ).reduce(
    (a, b) => a + b,
    0
  );

  const totalRecords = Object.values(
    data?.review_status_counts || {}
  ).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

        <div>

          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
            ESG Intelligence Dashboard
          </h1>

          <p className="text-slate-500 leading-relaxed max-w-2xl">
            Monitor emissions, audit workflows,
            ingestion jobs, anomaly detection,
            and enterprise sustainability metrics.
          </p>
        </div>

        {user?.role !== "auditor" && (

          <button
            onClick={() =>
              navigate("/ingest")
            }
            className="
              inline-flex items-center gap-3
              bg-gradient-to-r from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              text-white font-semibold
              px-6 py-4 rounded-2xl
              transition-all duration-200
              shadow-lg shadow-blue-500/20
              hover:shadow-blue-500/30
              hover:-translate-y-0.5
            "
          >
            <UploadCloud size={20} />

            <span>
              Upload New Data
            </span>
          </button>
        )}
      </div>

      {/* Stats */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-6
      ">

        <StatCard
          title="Total Emissions"
          value={totalCO2e}
          unit="tCO₂e"
          icon={<Cloud size={22} />}
          colorClass="blue"
        />

        <StatCard
          title="Pending Review"
          value={
            data?.review_status_counts
              ?.PENDING || 0
          }
          unit="records"
          icon={<FileCheck size={22} />}
          colorClass="amber"
        />

        <StatCard
          title="Anomalies"
          value={
            data?.anomaly_count || 0
          }
          unit="flags"
          icon={
            <AlertTriangle size={22} />
          }
          colorClass="red"
        />

        <StatCard
          title="Total Records"
          value={totalRecords}
          unit="ingested"
          icon={<Database size={22} />}
          colorClass="green"
        />
      </div>

      {/* Main Grid */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-6
      ">

        {/* Left Side */}

        <div className="
          xl:col-span-2
          space-y-6
        ">

          {/* Monthly Trend */}

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            transition-all duration-300
          ">

            <div className="
              flex items-start justify-between
              mb-8
            ">

              <div>

                <h3 className="
                  text-2xl
                  font-bold
                  text-slate-900
                  mb-2
                ">
                  Monthly Emissions Trend
                </h3>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Emission activity over time
                </p>
              </div>

              <div className="
                w-12 h-12
                rounded-2xl
                bg-blue-50
                text-blue-600
                flex items-center justify-center
              ">
                <Activity size={20} />
              </div>
            </div>

            <MonthlyTrendChart
              data={
                data?.records_by_month || []
              }
            />
          </div>

          {/* Recent Jobs */}

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            transition-all duration-300
          ">

            <div className="mb-8">

              <h3 className="
                text-2xl
                font-bold
                text-slate-900
                mb-2
              ">
                Recent Ingestion Jobs
              </h3>

              <p className="
                text-sm
                text-slate-500
              ">
                Latest upload and parser activity
              </p>
            </div>

            <RecentJobsList
              jobs={
                data?.latest_jobs || []
              }
            />
          </div>
        </div>

        {/* Right Side */}

        <div className="space-y-6">

          {/* Scope Breakdown */}

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            transition-all duration-300
          ">

            <div className="mb-8">

              <h3 className="
                text-2xl
                font-bold
                text-slate-900
                mb-2
              ">
                Scope Breakdown
              </h3>

              <p className="
                text-sm
                text-slate-500
              ">
                Scope 1 / 2 / 3 distribution
              </p>
            </div>

            <ScopeBreakdownChart
              data={
                data?.total_co2e_by_scope || {}
              }
            />
          </div>

          {/* Review Status */}

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            transition-all duration-300
          ">

            <div className="mb-8">

              <h3 className="
                text-2xl
                font-bold
                text-slate-900
                mb-2
              ">
                Review Status
              </h3>

              <p className="
                text-sm
                text-slate-500
              ">
                Approval workflow overview
              </p>
            </div>

            <ReviewStatusBreakdown
              counts={
                data?.review_status_counts || {}
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
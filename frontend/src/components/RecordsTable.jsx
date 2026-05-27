import React from "react";

import {
  AlertTriangle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";

import {
  formatDate,
  formatActivity,
  formatCO2e,
  statusColor,
} from "../utils/formatters";

export default function RecordsTable({
  records,
  isLoading,
  selectedIds,
  setSelectedIds,
  onRowClick,
  page,
  setPage,
  totalPages,
}) {

  const handleSelectAll = (e) =>

    setSelectedIds(
      e.target.checked
        ? records.map((r) => r.id)
        : []
    );

  const handleSelectRow = (
    e,
    id
  ) => {

    e.stopPropagation();

    setSelectedIds((prev) =>

      e.target.checked
        ? [...prev, id]
        : prev.filter(
            (rowId) =>
              rowId !== id
          )
    );
  };

  const scopeColor = (s) =>
    ({
      1: `
        bg-blue-50
        text-blue-700
        border-blue-200
      `,

      2: `
        bg-emerald-50
        text-emerald-700
        border-emerald-200
      `,

      3: `
        bg-purple-50
        text-purple-700
        border-purple-200
      `,
    })[s];

  const sourceColor = (src) =>
    ({
      SAP: `
        bg-blue-50
        text-blue-700
        border-blue-200
      `,

      UTILITY: `
        bg-purple-50
        text-purple-700
        border-purple-200
      `,

      TRAVEL: `
        bg-cyan-50
        text-cyan-700
        border-cyan-200
      `,
    })[src];

  /* Loading State */

  if (isLoading) {

    return (
      <div className="
        bg-white
        border border-slate-200
        rounded-3xl
        overflow-hidden
        shadow-sm
      ">

        {[...Array(8)].map(
          (_, i) => (

          <div
            key={i}
            className="
              flex items-center gap-4
              p-5
              border-b border-slate-100
              animate-pulse
            "
          >

            <div className="
              w-5 h-5
              rounded
              bg-slate-200
            "></div>

            <div className="
              flex-1
              h-4
              rounded
              bg-slate-200
            "></div>

            <div className="
              w-32 h-4
              rounded
              bg-slate-200
            "></div>

            <div className="
              w-20 h-4
              rounded
              bg-slate-200
            "></div>
          </div>
        ))}
      </div>
    );
  }

  /* Empty State */

  if (!records.length) {

    return (
      <div className="
        bg-white
        border border-slate-200
        rounded-3xl
        p-16
        text-center
        shadow-sm
      ">

        <div className="
          w-20 h-20
          rounded-3xl
          bg-slate-100
          text-slate-400
          flex items-center justify-center
          mx-auto mb-6
        ">
          <Database size={36} />
        </div>

        <h3 className="
          text-2xl
          font-bold
          text-slate-900
          mb-3
        ">
          No Records Found
        </h3>

        <p className="
          text-slate-500
          max-w-md mx-auto
          leading-relaxed
        ">
          Try adjusting your filters
          or ingestion criteria to
          find matching emission records.
        </p>
      </div>
    );
  }

  return (
    <div className="
      bg-white
      border border-slate-200
      rounded-3xl
      overflow-hidden
      shadow-sm
    ">

      {/* Table */}

      <div className="
        overflow-x-auto
      ">

        <table className="
          w-full
          text-left
        ">

          {/* Header */}

          <thead className="
            sticky top-0 z-10
            bg-slate-50/95
            backdrop-blur-xl
            border-b border-slate-200
          ">

            <tr>

              <th className="
                px-6 py-5
                w-14
              ">

                <input
                  type="checkbox"
                  checked={
                    records.length > 0 &&
                    selectedIds.length ===
                      records.length
                  }

                  onChange={
                    handleSelectAll
                  }

                  className="
                    w-4 h-4
                    rounded
                    border-slate-300
                    text-blue-600
                    focus:ring-blue-500
                  "
                />
              </th>

              {[
                "Date",
                "Source",
                "Scope",
                "Description",
                "Activity",
                "CO₂e",
                "Status",
              ].map((head) => (

                <th
                  key={head}
                  className="
                    px-6 py-5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                    whitespace-nowrap
                  "
                >
                  {head}
                </th>
              ))}

              <th className="
                px-6 py-5
                w-14
              "></th>
            </tr>
          </thead>

          {/* Body */}

          <tbody>

            {records.map((r) => (

              <tr
                key={r.id}

                onClick={() =>
                  onRowClick(r.id)
                }

                className="
                  border-b border-slate-100
                  hover:bg-slate-50/70
                  transition-all duration-200
                  cursor-pointer
                  group
                "
              >

                {/* Checkbox */}

                <td
                  className="px-6 py-5"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  <input
                    type="checkbox"

                    checked={selectedIds.includes(
                      r.id
                    )}

                    onChange={(e) =>
                      handleSelectRow(
                        e,
                        r.id
                      )
                    }

                    className="
                      w-4 h-4
                      rounded
                      border-slate-300
                      text-blue-600
                      focus:ring-blue-500
                    "
                  />
                </td>

                {/* Date */}

                <td className="
                  px-6 py-5
                  whitespace-nowrap
                  text-sm
                  font-medium
                  text-slate-800
                ">
                  {formatDate(
                    r.activity_date
                  )}
                </td>

                {/* Source */}

                <td className="
                  px-6 py-5
                ">

                  <span
                    className={`
                      inline-flex
                      items-center
                      px-3 py-1.5
                      rounded-full
                      border
                      text-xs
                      font-semibold
                      ${sourceColor(
                        r.source_type
                      )}
                    `}
                  >
                    {r.source_type}
                  </span>
                </td>

                {/* Scope */}

                <td className="
                  px-6 py-5
                ">

                  <span
                    className={`
                      inline-flex
                      items-center
                      px-3 py-1.5
                      rounded-full
                      border
                      text-xs
                      font-bold
                      ${scopeColor(
                        r.scope
                      )}
                    `}
                  >
                    Scope {r.scope}
                  </span>
                </td>

                {/* Description */}

                <td
                  className="
                    px-6 py-5
                    max-w-[260px]
                    truncate
                    text-sm
                    text-slate-600
                  "

                  title={
                    r.activity_description
                  }
                >
                  {r.activity_description}
                </td>

                {/* Activity */}

                <td className="
                  px-6 py-5
                  whitespace-nowrap
                  text-sm
                  text-slate-700
                ">
                  {formatActivity(
                    r.activity_value,
                    r.activity_unit
                  )}
                </td>

                {/* CO2 */}

                <td className="
                  px-6 py-5
                  whitespace-nowrap
                  text-sm
                  font-bold
                  text-slate-900
                ">
                  {formatCO2e(
                    r.co2e_tonnes
                  )}
                </td>

                {/* Status */}

                <td className="
                  px-6 py-5
                ">

                  <span
                    className={`
                      inline-flex
                      items-center
                      px-3 py-1.5
                      rounded-full
                      border
                      text-[11px]
                      uppercase
                      tracking-wider
                      font-bold
                      ${statusColor(
                        r.review_status
                      )}
                    `}
                  >
                    {r.review_status}
                  </span>
                </td>

                {/* Action */}

                <td className="
                  px-6 py-5
                  text-center
                ">

                  {r.is_flagged_anomaly ? (

                    <AlertTriangle
                      size={18}
                      className="
                        text-amber-500
                        inline
                      "

                      title={
                        r.anomaly_reason ||
                        "Anomaly detected"
                      }
                    />

                  ) : (

                    <MoreVertical
                      size={18}
                      className="
                        text-slate-300
                        group-hover:text-slate-500
                        transition-colors
                        inline
                      "
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}

      <div className="
        px-6 py-5
        border-t border-slate-200
        flex flex-col sm:flex-row
        items-center justify-between
        gap-4
        bg-slate-50/50
      ">

        <div className="
          text-sm
          text-slate-500
        ">

          Showing page{" "}

          <span className="
            font-semibold
            text-slate-900
          ">
            {page}
          </span>

          {" "}of{" "}

          <span className="
            font-semibold
            text-slate-900
          ">
            {totalPages || 1}
          </span>
        </div>

        {/* Pagination */}

        <div className="
          flex items-center gap-3
        ">

          <button
            onClick={() =>
              setPage((p) =>
                Math.max(1, p - 1)
              )
            }

            disabled={page === 1}

            className="
              w-11 h-11
              rounded-2xl
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-600
              hover:bg-slate-100
              transition-all
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >

            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() =>
              setPage((p) =>
                Math.min(
                  totalPages,
                  p + 1
                )
              )
            }

            disabled={
              page === totalPages ||
              !totalPages
            }

            className="
              w-11 h-11
              rounded-2xl
              border border-slate-200
              bg-white
              flex items-center justify-center
              text-slate-600
              hover:bg-slate-100
              transition-all
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >

            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
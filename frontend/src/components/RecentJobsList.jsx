import React from "react";

import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Clock3,
  ChevronRight,
} from "lucide-react";

import {
  formatDate,
} from "../utils/formatters";

export default function RecentJobsList({
  jobs,
}) {

  const statusConfig = {

    PENDING: {
      badge: `
        bg-amber-50
        text-amber-700
        border-amber-200
      `,

      icon: (
        <Clock3
          size={14}
        />
      ),
    },

    PROCESSING: {
      badge: `
        bg-blue-50
        text-blue-700
        border-blue-200
      `,

      icon: (
        <Loader2
          size={14}
          className="
            animate-spin
          "
        />
      ),
    },

    COMPLETED: {
      badge: `
        bg-emerald-50
        text-emerald-700
        border-emerald-200
      `,

      icon: (
        <CheckCircle2
          size={14}
        />
      ),
    },

    FAILED: {
      badge: `
        bg-red-50
        text-red-700
        border-red-200
      `,

      icon: (
        <AlertTriangle
          size={14}
        />
      ),
    },

    PARTIAL: {
      badge: `
        bg-orange-50
        text-orange-700
        border-orange-200
      `,

      icon: (
        <AlertTriangle
          size={14}
        />
      ),
    },
  };

  return (
    <div className="
      bg-white
      border border-slate-200
      rounded-[2rem]
      shadow-sm
      overflow-hidden
    ">

      {/* Header */}

      <div className="
        px-7 py-6
        border-b border-slate-200

        flex items-center justify-between
      ">

        <div className="
          flex items-center gap-4
        ">

          <div className="
            w-14 h-14

            rounded-3xl

            bg-blue-50
            text-blue-600

            flex items-center justify-center

            ring-8 ring-blue-100
          ">

            <Database size={24} />
          </div>

          <div>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              Recent Ingestion Jobs
            </h3>

            <p className="
              text-sm
              text-slate-500
              mt-1
            ">
              Latest ESG parser and ingestion activity
            </p>
          </div>
        </div>

        <button className="
          hidden sm:flex
          items-center gap-2

          text-sm
          font-semibold
          text-blue-600

          hover:text-blue-700

          transition-colors
        ">

          <span>
            View All
          </span>

          <ChevronRight
            size={16}
          />
        </button>
      </div>

      {/* Empty */}

      {(!jobs || jobs.length === 0) ? (

        <div className="
          p-16
          text-center
        ">

          <div className="
            w-24 h-24

            rounded-[2rem]

            bg-slate-100
            text-slate-400

            flex items-center justify-center

            mx-auto mb-6
          ">

            <Database size={40} />
          </div>

          <h3 className="
            text-2xl
            font-bold
            text-slate-900
            mb-3
          ">
            No Ingestion Jobs
          </h3>

          <p className="
            text-slate-500
            max-w-md
            mx-auto
          ">
            Upload ESG datasets to begin ingestion tracking and parser monitoring.
          </p>
        </div>

      ) : (

        <div className="
          divide-y divide-slate-100
        ">

          {jobs.map((job) => {

            const status =
              statusConfig[
                job.status
              ];

            const totalRows =
              job.row_count_total ||

              (
                job.row_count_success +
                job.row_count_failed
              );

            const successPercent =
              totalRows > 0

                ? Math.round(
                    (
                      job.row_count_success /
                      totalRows
                    ) * 100
                  )

                : 0;

            return (
              <div
                key={job.id}

                className="
                  group

                  px-7 py-6

                  hover:bg-slate-50/80

                  transition-all duration-200
                "
              >

                <div className="
                  flex flex-col lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-6
                ">

                  {/* Left */}

                  <div className="
                    flex items-start gap-5
                    min-w-0
                  ">

                    {/* Source Icon */}

                    <div className="
                      w-14 h-14

                      rounded-3xl

                      bg-slate-100

                      text-slate-700

                      flex items-center justify-center

                      group-hover:bg-blue-50
                      group-hover:text-blue-600

                      transition-all
                    ">

                      <Database size={22} />
                    </div>

                    {/* Info */}

                    <div className="
                      min-w-0
                    ">

                      <div className="
                        flex flex-wrap
                        items-center gap-3
                        mb-2
                      ">

                        <h4 className="
                          text-lg
                          font-bold
                          text-slate-900
                        ">
                          {job.source_type} Import
                        </h4>

                        <span
                          className={`
                            inline-flex
                            items-center gap-2

                            px-3 py-1.5

                            rounded-full
                            border

                            text-xs
                            font-bold
                            uppercase
                            tracking-wider

                            ${status.badge}
                          `}
                        >

                          {status.icon}

                          <span>
                            {job.status}
                          </span>
                        </span>
                      </div>

                      <div className="
                        flex flex-wrap
                        items-center gap-3

                        text-sm
                        text-slate-500
                      ">

                        <span>
                          {formatDate(
                            job.started_at
                          )}
                        </span>

                        <span className="
                          w-1.5 h-1.5
                          rounded-full
                          bg-slate-300
                        "></span>

                        <span className="
                          truncate
                          max-w-[300px]
                        ">
                          {job.file_name}
                        </span>
                      </div>

                      {/* Progress */}

                      <div className="
                        mt-5
                      ">

                        <div className="
                          flex items-center justify-between
                          mb-2
                        ">

                          <span className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wide
                            text-slate-400
                          ">
                            Processing Success
                          </span>

                          <span className="
                            text-sm
                            font-bold
                            text-slate-700
                          ">
                            {successPercent}%
                          </span>
                        </div>

                        <div className="
                          w-full
                          h-3

                          rounded-full

                          bg-slate-100
                          overflow-hidden
                        ">

                          <div
                            className="
                              h-full

                              rounded-full

                              bg-gradient-to-r
                              from-blue-600
                              to-cyan-500

                              transition-all duration-500
                            "

                            style={{
                              width:
                                `${successPercent}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right */}

                  <div className="
                    flex flex-col
                    items-start lg:items-end
                    gap-2
                  ">

                    <div className="
                      text-3xl
                      font-bold
                      text-slate-900
                    ">

                      {
                        job.row_count_success
                      }

                      <span className="
                        text-slate-400
                        font-medium
                      ">
                        /{totalRows}
                      </span>
                    </div>

                    <p className="
                      text-sm
                      text-slate-500
                    ">
                      rows processed
                    </p>

                    {job.row_count_failed >
                      0 && (

                      <div className="
                        inline-flex
                        items-center gap-2

                        px-3 py-1.5

                        rounded-full

                        bg-red-50
                        border border-red-200

                        text-xs
                        font-semibold
                        text-red-700
                      ">

                        <AlertTriangle
                          size={13}
                        />

                        <span>
                          {
                            job.row_count_failed
                          } failed rows
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
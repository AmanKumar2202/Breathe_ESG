import React, {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import { get } from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  ChevronDown,
  ChevronRight,
  Activity,
  Database,
  ShieldAlert,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export default function JobStatusCard({
  jobId,
  onReset,
}) {

  const navigate =
    useNavigate();

  const [
    showErrors,
    setShowErrors,
  ] = useState(false);

  const {
    data: job,
    isLoading,
  } = useQuery({

    queryKey: [
      "job",
      jobId,
    ],

    queryFn: () =>
      get(
        `${ENDPOINTS.JOBS}${jobId}/`
      ),

    refetchInterval:
      (data) =>

        data?.status ===
          "PROCESSING" ||

        data?.status ===
          "PENDING"

          ? 2000

          : false,
  });

  if (isLoading || !job) {

    return (
      <div className="
        bg-white
        border border-slate-200
        rounded-[2rem]
        p-12
        shadow-sm
      ">

        <div className="
          flex flex-col
          items-center justify-center
          gap-5
        ">

          <div className="
            w-20 h-20

            rounded-3xl

            bg-blue-50
            text-blue-600

            flex items-center justify-center

            ring-8 ring-blue-100
          ">

            <Loader2
              size={34}
              className="
                animate-spin
              "
            />
          </div>

          <div className="
            text-center
          ">

            <h3 className="
              text-xl
              font-bold
              text-slate-900
              mb-2
            ">
              Processing Upload
            </h3>

            <p className="
              text-slate-500
            ">
              Initializing ingestion pipeline...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDone =
    job.status ===
      "COMPLETED" ||

    job.status ===
      "FAILED" ||

    job.status ===
      "PARTIAL";

  const statusStyles = {

    PROCESSING: {
      badge: `
        bg-blue-50
        text-blue-700
        border-blue-200
      `,

      icon: (
        <Loader2
          size={16}
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
        <CheckCircle
          size={16}
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
        <ShieldAlert
          size={16}
        />
      ),
    },

    PARTIAL: {
      badge: `
        bg-amber-50
        text-amber-700
        border-amber-200
      `,

      icon: (
        <AlertTriangle
          size={16}
        />
      ),
    },

    PENDING: {
      badge: `
        bg-slate-100
        text-slate-700
        border-slate-200
      `,

      icon: (
        <Activity
          size={16}
        />
      ),
    },
  };

  const currentStatus =
    statusStyles[
      job.status
    ];

  return (
    <div className="
      space-y-6
    ">

      {/* Header Card */}

      <div className="
        relative
        overflow-hidden

        rounded-[2rem]

        bg-gradient-to-br
        from-slate-900
        to-slate-800

        p-8

        text-white

        shadow-2xl
      ">

        {/* Glow */}

        <div className="
          absolute top-0 right-0

          w-72 h-72

          bg-blue-500/10

          rounded-full

          blur-3xl
        "></div>

        <div className="
          relative z-10
        ">

          <div className="
            flex flex-col lg:flex-row
            lg:items-start
            lg:justify-between
            gap-6
          ">

            {/* Left */}

            <div>

              <div className="
                flex items-center gap-3
                mb-4
              ">

                <div className="
                  w-14 h-14

                  rounded-3xl

                  bg-white/10

                  flex items-center justify-center

                  backdrop-blur-xl
                ">

                  <Database
                    size={24}
                  />
                </div>

                <div>

                  <h2 className="
                    text-3xl
                    font-bold
                    tracking-tight
                  ">
                    Ingestion Job
                  </h2>

                  <p className="
                    text-slate-400
                    mt-1
                  ">
                    Real-time ESG processing status
                  </p>
                </div>
              </div>

              <div className="
                flex flex-wrap
                items-center gap-3
              ">

                <span className="
                  inline-flex
                  items-center

                  px-4 py-2

                  rounded-full

                  bg-white/10

                  text-sm
                  font-medium

                  backdrop-blur-xl
                ">

                  ID: {
                    job.id.split("-")[0]
                  }
                </span>

                <span className="
                  inline-flex
                  items-center

                  px-4 py-2

                  rounded-full

                  bg-white/10

                  text-sm
                  font-medium

                  backdrop-blur-xl
                ">

                  {job.source_type}
                </span>
              </div>
            </div>

            {/* Status */}

            <div
              className={`
                inline-flex
                items-center gap-2

                px-5 py-3

                rounded-2xl
                border

                text-sm
                font-bold
                uppercase
                tracking-wider

                ${currentStatus.badge}
              `}
            >

              {currentStatus.icon}

              <span>
                {job.status}
              </span>
            </div>
          </div>

          {/* Filename */}

          <div className="
            mt-8
            pt-6
            border-t border-white/10
          ">

            <p className="
              text-sm
              text-slate-400
              mb-2
            ">
              Uploaded Dataset
            </p>

            <h3 className="
              text-lg
              font-semibold
              break-all
            ">
              {job.file_name}
            </h3>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="
        grid
        grid-cols-1 md:grid-cols-3
        gap-5
      ">

        {/* Total */}

        <div className="
          bg-white
          border border-slate-200
          rounded-3xl
          p-6
          shadow-sm
        ">

          <p className="
            text-sm
            text-slate-500
            mb-3
          ">
            Total Rows
          </p>

          <h3 className="
            text-4xl
            font-bold
            text-slate-900
          ">
            {
              job.row_count_total ||

              job.row_count_success +
              job.row_count_failed
            }
          </h3>
        </div>

        {/* Success */}

        <div className="
          bg-emerald-50
          border border-emerald-200
          rounded-3xl
          p-6
          shadow-sm
        ">

          <p className="
            text-sm
            text-emerald-700
            mb-3
          ">
            Successfully Processed
          </p>

          <h3 className="
            text-4xl
            font-bold
            text-emerald-700
          ">
            {job.row_count_success}
          </h3>
        </div>

        {/* Failed */}

        <div className="
          bg-red-50
          border border-red-200
          rounded-3xl
          p-6
          shadow-sm
        ">

          <p className="
            text-sm
            text-red-700
            mb-3
          ">
            Failed Rows
          </p>

          <h3 className="
            text-4xl
            font-bold
            text-red-700
          ">
            {job.row_count_failed}
          </h3>
        </div>
      </div>

      {/* Error Panel */}

      {job.error_log?.length >
        0 && (

        <div className="
          bg-white
          border border-red-200
          rounded-3xl
          overflow-hidden
          shadow-sm
        ">

          <button
            onClick={() =>
              setShowErrors(
                !showErrors
              )
            }

            className="
              w-full

              flex items-center justify-between

              px-6 py-5

              bg-red-50

              hover:bg-red-100

              transition-all
            "
          >

            <div className="
              flex items-center gap-3
            ">

              <div className="
                w-11 h-11

                rounded-2xl

                bg-red-100
                text-red-600

                flex items-center justify-center
              ">

                <AlertTriangle
                  size={20}
                />
              </div>

              <div className="
                text-left
              ">

                <h3 className="
                  text-lg
                  font-bold
                  text-red-700
                ">
                  Parser Errors
                </h3>

                <p className="
                  text-sm
                  text-red-600
                ">
                  {
                    job.error_log.length
                  } rows failed validation
                </p>
              </div>
            </div>

            {showErrors ? (

              <ChevronDown
                size={20}
                className="
                  text-red-600
                "
              />

            ) : (

              <ChevronRight
                size={20}
                className="
                  text-red-600
                "
              />
            )}
          </button>

          {showErrors && (

            <div className="
              max-h-[400px]
              overflow-y-auto
            ">

              <table className="
                w-full
                text-left
              ">

                <thead className="
                  sticky top-0

                  bg-slate-50

                  border-b border-slate-200
                ">

                  <tr>

                    <th className="
                      px-6 py-4

                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500

                      w-24
                    ">
                      Row
                    </th>

                    <th className="
                      px-6 py-4

                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                    ">
                      Validation Error
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {job.error_log.map(
                    (
                      err,
                      i
                    ) => (

                    <tr
                      key={i}

                      className="
                        border-b border-slate-100
                        hover:bg-slate-50
                      "
                    >

                      <td className="
                        px-6 py-4

                        text-sm
                        font-semibold
                        text-slate-600
                      ">
                        {err.row ||
                          "-"}
                      </td>

                      <td className="
                        px-6 py-4

                        text-sm
                        text-red-600

                        break-words
                      ">
                        {err.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer Buttons */}

      <div className="
        flex flex-col sm:flex-row
        gap-4
      ">

        <button
          onClick={onReset}

          className="
            flex-1

            border border-slate-200

            bg-white

            hover:bg-slate-100

            text-slate-700

            py-4
            rounded-2xl

            font-semibold

            transition-all
          "
        >
          Upload Another Dataset
        </button>

        {isDone &&
          job.row_count_success >
            0 && (

          <button
            onClick={() =>
              navigate(
                `/records?job_id=${job.id}`
              )
            }

            className="
              flex-1

              bg-gradient-to-r
              from-blue-600
              to-cyan-500

              hover:opacity-90

              text-white

              py-4
              rounded-2xl

              font-semibold

              flex items-center justify-center gap-3

              shadow-xl shadow-blue-500/20

              transition-all
            "
          >

            <FileText
              size={18}
            />

            <span>
              View Imported Records
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
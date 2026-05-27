import React, {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Download,
  ChevronRight,
  UploadCloud,
  Database,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { get } from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

import {
  formatDate,
} from "../utils/formatters";

import SourceSelector from "../components/SourceSelector";
import FileUploadZone from "../components/FileUploadZone";
import JobStatusCard from "../components/JobStatusCard";

export default function IngestPage() {

  const [
    selectedSource,
    setSelectedSource,
  ] = useState(null);

  const [
    activeJobId,
    setActiveJobId,
  ] = useState(null);

  const [page,
    setPage] =
      useState(1);

  const {
    data,
    isLoading,
  } = useQuery({

    queryKey: [
      "jobs",
      page,
    ],

    queryFn: () =>
      get(
        ENDPOINTS.JOBS,
        {
          params: { page },
        }
      ),

    refetchInterval: 5000,
  });

  const handleDownloadErrors =
    (job) => {

      if (
        !job.error_log ||
        job.error_log.length === 0
      )
        return;

      const blob = new Blob(
        [
          JSON.stringify(
            job.error_log,
            null,
            2
          ),
        ],

        {
          type:
            "application/json",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `job_${job.id.split("-")[0]}_errors.json`;

      a.click();

      URL.revokeObjectURL(url);
    };

  const statusColor = {

    PENDING: `
      bg-amber-50
      text-amber-700
      border-amber-200
    `,

    PROCESSING: `
      bg-blue-50
      text-blue-700
      border-blue-200
    `,

    COMPLETED: `
      bg-emerald-50
      text-emerald-700
      border-emerald-200
    `,

    FAILED: `
      bg-red-50
      text-red-700
      border-red-200
    `,

    PARTIAL: `
      bg-orange-50
      text-orange-700
      border-orange-200
    `,
  };

  return (
    <div className="
      space-y-8
    ">

      {/* Header */}

      <div className="
        flex flex-col lg:flex-row
        lg:items-center
        lg:justify-between
        gap-6
      ">

        <div>

          <div className="
            flex items-center gap-4
            mb-4
          ">

            <div className="
              w-16 h-16
              rounded-3xl
              bg-gradient-to-br
              from-blue-600
              to-cyan-500
              text-white
              flex items-center justify-center
              shadow-xl shadow-blue-500/20
            ">
              <UploadCloud size={28} />
            </div>

            <div>

              <h1 className="
                text-4xl
                font-bold
                text-slate-900
                tracking-tight
              ">
                Data Ingestion
              </h1>

              <p className="
                text-slate-500
                mt-1
              ">
                Upload and normalize enterprise ESG datasets
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}

        <div className="
          flex flex-wrap gap-4
        ">

          <div className="
            bg-white
            border border-slate-200
            rounded-2xl
            px-5 py-4
            shadow-sm
          ">

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-slate-400
              mb-1
            ">
              Total Jobs
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              {data?.count || 0}
            </h3>
          </div>

          <div className="
            bg-white
            border border-slate-200
            rounded-2xl
            px-5 py-4
            shadow-sm
          ">

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-slate-400
              mb-1
            ">
              Active Uploads
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-blue-600
            ">
              {
                data?.results?.filter(
                  (j) =>
                    j.status ===
                    "PROCESSING"
                ).length || 0
              }
            </h3>
          </div>
        </div>
      </div>

      {/* Main Layout */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-5
        gap-8
      ">

        {/* Left Side */}

        <div className="
          xl:col-span-2
          space-y-6
        ">

          {/* Upload Workflow */}

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
            p-7
            shadow-sm
          ">

            <div className="
              flex items-center gap-3
              mb-6
            ">

              <div className="
                w-12 h-12
                rounded-2xl
                bg-blue-50
                text-blue-600
                flex items-center justify-center
                ring-8 ring-blue-100
              ">
                <Activity size={20} />
              </div>

              <div>

                <h3 className="
                  text-xl
                  font-bold
                  text-slate-900
                ">
                  Upload Workflow
                </h3>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Process SAP, utility, and travel emissions data
                </p>
              </div>
            </div>

            {!selectedSource &&
              !activeJobId && (

              <SourceSelector
                onSelect={
                  setSelectedSource
                }
              />
            )}

            {selectedSource &&
              !activeJobId && (

              <FileUploadZone
                source={
                  selectedSource
                }

                onCancel={() =>
                  setSelectedSource(
                    null
                  )
                }

                onUploadSuccess={(
                  id
                ) =>
                  setActiveJobId(
                    id
                  )
                }
              />
            )}

            {activeJobId && (

              <JobStatusCard
                jobId={activeJobId}

                onReset={() => {

                  setActiveJobId(
                    null
                  );

                  setSelectedSource(
                    null
                  );
                }}
              />
            )}
          </div>
        </div>

        {/* Right Side */}

        <div className="
          xl:col-span-3
        ">

          <div className="
            bg-white
            border border-slate-200
            rounded-3xl
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
                flex items-center gap-3
              ">

                <div className="
                  w-12 h-12
                  rounded-2xl
                  bg-emerald-50
                  text-emerald-600
                  flex items-center justify-center
                  ring-8 ring-emerald-100
                ">
                  <Database size={20} />
                </div>

                <div>

                  <h3 className="
                    text-xl
                    font-bold
                    text-slate-900
                  ">
                    Ingestion History
                  </h3>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Latest parser and upload activity
                  </p>
                </div>
              </div>
            </div>

            {/* Loading */}

            {isLoading ? (

              <div className="
                p-12
                text-center
                text-slate-500
              ">
                Loading ingestion history...
              </div>

            ) : (

              <div className="
                overflow-x-auto
              ">

                <table className="
                  w-full
                  text-left
                ">

                  {/* Header */}

                  <thead className="
                    bg-slate-50
                    border-b border-slate-200
                  ">

                    <tr>

                      {[
                        "Date",
                        "Source",
                        "Status",
                        "Rows",
                        "Actions",
                      ].map((h) => (

                        <th
                          key={h}

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
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* Body */}

                  <tbody>

                    {data?.results?.map(
                      (job) => (

                      <tr
                        key={job.id}

                        className="
                          border-b border-slate-100
                          hover:bg-slate-50/60
                          transition-all duration-200
                          group
                        "
                      >

                        {/* Date */}

                        <td className="
                          px-6 py-5
                          whitespace-nowrap
                          text-sm
                          font-medium
                          text-slate-800
                        ">
                          {formatDate(
                            job.started_at
                          )}
                        </td>

                        {/* Source */}

                        <td className="
                          px-6 py-5
                        ">

                          <span className="
                            inline-flex
                            items-center

                            px-3 py-1.5

                            rounded-full

                            bg-slate-100
                            border border-slate-200

                            text-xs
                            font-semibold
                            text-slate-700
                          ">
                            {
                              job.source_type
                            }
                          </span>
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

                              text-xs
                              font-bold
                              uppercase
                              tracking-wider

                              ${
                                statusColor[
                                  job.status
                                ]
                              }
                            `}
                          >
                            {job.status}
                          </span>
                        </td>

                        {/* Rows */}

                        <td className="
                          px-6 py-5
                        ">

                          <div>

                            <div className="
                              text-sm
                              font-semibold
                              text-slate-900
                            ">

                              {
                                job.row_count_success
                              }

                              {" / "}

                              {job.row_count_total ||
                                job.row_count_success +
                                job.row_count_failed}
                            </div>

                            {job.row_count_failed >
                              0 && (

                              <div className="
                                flex items-center gap-1
                                text-xs
                                text-red-500
                                mt-1
                              ">

                                <AlertTriangle
                                  size={12}
                                />

                                <span>
                                  {
                                    job.row_count_failed
                                  } failed
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}

                        <td className="
                          px-6 py-5
                        ">

                          <div className="
                            flex items-center justify-end gap-3
                            opacity-0
                            group-hover:opacity-100
                            transition-opacity
                          ">

                            {job.error_log
                              ?.length >
                              0 && (

                              <button
                                onClick={() =>
                                  handleDownloadErrors(
                                    job
                                  )
                                }

                                className="
                                  w-10 h-10
                                  rounded-xl

                                  border border-red-200
                                  bg-red-50

                                  text-red-500

                                  hover:bg-red-100

                                  flex items-center justify-center

                                  transition-all
                                "
                              >

                                <Download
                                  size={16}
                                />
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setActiveJobId(
                                  job.id
                                )
                              }

                              className="
                                w-10 h-10
                                rounded-xl

                                border border-slate-200
                                bg-white

                                text-slate-600

                                hover:bg-slate-100

                                flex items-center justify-center

                                transition-all
                              "
                            >

                              <ChevronRight
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Empty */}

                    {(!data?.results ||
                      data.results.length ===
                        0) && (

                      <tr>

                        <td
                          colSpan="5"

                          className="
                            p-16
                            text-center
                          "
                        >

                          <div className="
                            flex flex-col
                            items-center
                            gap-4
                          ">

                            <div className="
                              w-20 h-20
                              rounded-3xl
                              bg-slate-100
                              text-slate-400
                              flex items-center justify-center
                            ">

                              <Database
                                size={34}
                              />
                            </div>

                            <div>

                              <h3 className="
                                text-xl
                                font-bold
                                text-slate-900
                                mb-2
                              ">
                                No Jobs Found
                              </h3>

                              <p className="
                                text-slate-500
                              ">
                                Upload ESG datasets to begin ingestion
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}

            {data?.count > 50 && (

              <div className="
                px-6 py-5
                border-t border-slate-200
                bg-slate-50/50

                flex items-center justify-between
              ">

                <span className="
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
                </span>

                <div className="
                  flex items-center gap-3
                ">

                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.max(
                          1,
                          p - 1
                        )
                      )
                    }

                    disabled={
                      page === 1
                    }

                    className="
                      px-4 py-2

                      rounded-xl

                      border border-slate-200

                      bg-white

                      hover:bg-slate-100

                      text-sm
                      font-medium

                      disabled:opacity-40

                      transition-all
                    "
                  >
                    Previous
                  </button>

                  <button
                    onClick={() =>
                      setPage((p) =>
                        p + 1
                      )
                    }

                    disabled={
                      data.next ===
                      null
                    }

                    className="
                      px-4 py-2

                      rounded-xl

                      border border-slate-200

                      bg-white

                      hover:bg-slate-100

                      text-sm
                      font-medium

                      disabled:opacity-40

                      transition-all
                    "
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
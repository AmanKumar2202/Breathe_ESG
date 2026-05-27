import React, {
  useMemo,
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  ShieldCheck,
  Filter,
  Calendar,
  Activity,
  Search,
} from "lucide-react";

import { get } from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

export default function AuditPage() {

  const [
    actionFilter,
    setActionFilter,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const {
    data,
    isLoading,
    isError,
  } = useQuery({

    queryKey: [
      "auditLogs",
    ],

    queryFn: () =>
      get(
        ENDPOINTS.AUDIT
      ),
  });

  const logs =
    data?.results ||
    data ||
    [];

  const filteredLogs =
    useMemo(() => {

      return logs.filter(
        (log) => {

          const matchesAction =

            !actionFilter ||

            log.action ===
              actionFilter;

          const logDate =
            new Date(
              log.timestamp
            );

          const matchesStart =

            !startDate ||

            logDate >=
              new Date(
                startDate
              );

          const matchesEnd =

            !endDate ||

            logDate <=
              new Date(
                endDate
              );

          return (
            matchesAction &&
            matchesStart &&
            matchesEnd
          );
        }
      );

    }, [
      logs,
      actionFilter,
      startDate,
      endDate,
    ]);

  const uniqueActions = [

    ...new Set(
      logs.map(
        (log) =>
          log.action
      )
    ),
  ];

  /* Loading */

  if (isLoading) {

    return (
      <div className="
        bg-white
        border border-slate-200
        rounded-[2rem]
        p-16
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

            <Activity
              size={34}
              className="
                animate-pulse
              "
            />
          </div>

          <div className="
            text-center
          ">

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
              mb-2
            ">
              Loading Audit Logs
            </h3>

            <p className="
              text-slate-500
            ">
              Fetching governance activity and compliance records...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* Error */

  if (isError) {

    return (
      <div className="
        bg-red-50
        border border-red-200
        rounded-3xl
        p-10
        text-center
      ">

        <h3 className="
          text-2xl
          font-bold
          text-red-700
          mb-3
        ">
          Failed To Load Audit Logs
        </h3>

        <p className="
          text-red-600
        ">
          The governance audit service is currently unavailable.
        </p>
      </div>
    );
  }

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
              from-emerald-600
              to-green-500

              text-white

              flex items-center justify-center

              shadow-xl shadow-emerald-500/20
            ">

              <ShieldCheck
                size={30}
              />
            </div>

            <div>

              <h1 className="
                text-4xl
                font-bold
                text-slate-900
                tracking-tight
              ">
                Audit Logs
              </h1>

              <p className="
                text-slate-500
                mt-1
              ">
                Immutable operational governance & compliance trail
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
              Total Events
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              {logs.length}
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
              Filtered Results
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-emerald-600
            ">
              {filteredLogs.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div className="
        bg-white
        border border-slate-200
        rounded-[2rem]
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

            <Filter size={20} />
          </div>

          <div>

            <h3 className="
              text-xl
              font-bold
              text-slate-900
            ">
              Compliance Filters
            </h3>

            <p className="
              text-sm
              text-slate-500
            ">
              Narrow governance activity using action and date ranges
            </p>
          </div>
        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
        ">

          {/* Action */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              Action Type
            </label>

            <div className="
              relative
            ">

              <Search
                size={18}
                className="
                  absolute
                  left-4 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={actionFilter}

                onChange={(e) =>
                  setActionFilter(
                    e.target.value
                  )
                }

                className="
                  w-full

                  bg-slate-50

                  border border-slate-200

                  rounded-2xl

                  pl-12 pr-4 py-3

                  text-sm
                  text-slate-700

                  outline-none

                  focus:ring-4
                  focus:ring-blue-100
                  focus:border-blue-500

                  transition-all
                "
              >

                <option value="">
                  All Actions
                </option>

                {uniqueActions.map(
                  (action) => (

                  <option
                    key={action}
                    value={action}
                  >
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              Start Date
            </label>

            <div className="
              relative
            ">

              <Calendar
                size={18}
                className="
                  absolute
                  left-4 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"

                value={startDate}

                onChange={(e) =>
                  setStartDate(
                    e.target.value
                  )
                }

                className="
                  w-full

                  bg-slate-50

                  border border-slate-200

                  rounded-2xl

                  pl-12 pr-4 py-3

                  text-sm
                  text-slate-700

                  outline-none

                  focus:ring-4
                  focus:ring-blue-100
                  focus:border-blue-500

                  transition-all
                "
              />
            </div>
          </div>

          {/* End */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              End Date
            </label>

            <div className="
              relative
            ">

              <Calendar
                size={18}
                className="
                  absolute
                  left-4 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="date"

                value={endDate}

                onChange={(e) =>
                  setEndDate(
                    e.target.value
                  )
                }

                className="
                  w-full

                  bg-slate-50

                  border border-slate-200

                  rounded-2xl

                  pl-12 pr-4 py-3

                  text-sm
                  text-slate-700

                  outline-none

                  focus:ring-4
                  focus:ring-blue-100
                  focus:border-blue-500

                  transition-all
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}

      {filteredLogs.length ===
      0 ? (

        <div className="
          bg-white
          border border-slate-200
          rounded-[2rem]
          p-20
          text-center
          shadow-sm
        ">

          <div className="
            w-24 h-24

            rounded-[2rem]

            bg-slate-100
            text-slate-400

            flex items-center justify-center

            mx-auto mb-8
          ">

            <ShieldCheck
              size={42}
            />
          </div>

          <h3 className="
            text-3xl
            font-bold
            text-slate-900
            mb-4
          ">
            No Audit Logs Found
          </h3>

          <p className="
            text-slate-500
            max-w-lg
            mx-auto
            leading-relaxed
          ">
            No governance activity matched the current compliance filters.
          </p>
        </div>

      ) : (

        <div className="
          bg-white
          border border-slate-200
          rounded-[2rem]
          shadow-sm
          overflow-hidden
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
                bg-slate-50
                border-b border-slate-200
              ">

                <tr>

                  {[
                    "Timestamp",
                    "Actor",
                    "Action",
                    "Target",
                    "Notes",
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
                      "
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}

              <tbody>

                {filteredLogs.map(
                  (log) => (

                  <tr
                    key={log.id}

                    className="
                      border-b border-slate-100

                      hover:bg-slate-50

                      transition-all duration-200
                    "
                  >

                    {/* Timestamp */}

                    <td className="
                      px-6 py-5

                      whitespace-nowrap

                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      {new Date(
                        log.timestamp
                      ).toLocaleString()}
                    </td>

                    {/* Actor */}

                    <td className="
                      px-6 py-5
                    ">

                      <div className="
                        flex items-center gap-3
                      ">

                        <div className="
                          w-10 h-10

                          rounded-2xl

                          bg-slate-100
                          text-slate-600

                          flex items-center justify-center

                          font-bold
                        ">

                          {
                            log.actor_name?.[0]
                          }
                        </div>

                        <div>

                          <p className="
                            font-semibold
                            text-slate-900
                          ">
                            {
                              log.actor_name
                            }
                          </p>

                          <p className="
                            text-xs
                            text-slate-500
                          ">
                            ESG Operator
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Action */}

                    <td className="
                      px-6 py-5
                    ">

                      <span className="
                        inline-flex
                        items-center

                        px-3 py-1.5

                        rounded-full

                        bg-blue-50
                        border border-blue-200

                        text-xs
                        font-bold
                        uppercase
                        tracking-wider

                        text-blue-700
                      ">

                        {log.action}
                      </span>
                    </td>

                    {/* Target */}

                    <td className="
                      px-6 py-5

                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      {log.target_model}
                    </td>

                    {/* Notes */}

                    <td className="
                      px-6 py-5

                      text-sm
                      text-slate-500

                      max-w-[400px]
                    ">

                      {log.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
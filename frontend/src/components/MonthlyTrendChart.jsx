import React from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  TrendingUp,
} from "lucide-react";

export default function MonthlyTrendChart({
  data,
}) {

  /* Transform Data */

  const chartData =
    data.reduce(
      (acc, curr) => {

        const existing =
          acc.find(
            (item) =>
              item.month ===
              curr.month
          );

        if (existing) {

          existing[
            `Scope ${curr.scope}`
          ] = curr.co2e;

        } else {

          acc.push({

            month:
              curr.month,

            [`Scope ${curr.scope}`]:
              curr.co2e,
          });
        }

        return acc;
      },

      []
    );

  /* Total Emissions */

  const totalEmissions =
    chartData.reduce(
      (sum, row) =>

        sum +

        (
          row["Scope 1"] ||
          0
        ) +

        (
          row["Scope 2"] ||
          0
        ) +

        (
          row["Scope 3"] ||
          0
        ),

      0
    );

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

        flex flex-col lg:flex-row
        lg:items-center
        lg:justify-between

        gap-6
      ">

        {/* Left */}

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

            <TrendingUp size={24} />
          </div>

          <div>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              Monthly Emissions Trend
            </h3>

            <p className="
              text-sm
              text-slate-500
              mt-1
            ">
              Scope-wise carbon emissions over time
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="
          flex items-center gap-8
        ">

          <div>

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-slate-400
              mb-1
            ">
              Total Emissions
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">

              {totalEmissions.toFixed(
                2
              )}{" "}

              <span className="
                text-base
                font-medium
                text-slate-400
              ">
                tCO₂e
              </span>
            </h3>
          </div>

          <div>

            <p className="
              text-xs
              uppercase
              tracking-wide
              text-slate-400
              mb-1
            ">
              Reporting Months
            </p>

            <h3 className="
              text-2xl
              font-bold
              text-blue-600
            ">
              {chartData.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart */}

      <div className="
        p-6
        h-[420px]
      ">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart
            data={chartData}

            margin={{
              top: 20,
              right: 10,
              left: -10,
              bottom: 10,
            }}
          >

            {/* Grid */}

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            {/* X Axis */}

            <XAxis
              dataKey="month"

              tickLine={false}

              axisLine={false}

              tick={{
                fill: "#64748b",
                fontSize: 12,
                fontWeight: 500,
              }}
            />

            {/* Y Axis */}

            <YAxis
              tickLine={false}

              axisLine={false}

              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}

              tickFormatter={(val) =>
                `${val}t`
              }
            />

            {/* Tooltip */}

            <Tooltip

              cursor={{
                fill:
                  "rgba(59,130,246,0.05)",
              }}

              contentStyle={{
                backgroundColor:
                  "#0f172a",

                border:
                  "1px solid #1e293b",

                borderRadius:
                  "20px",

                color:
                  "#f8fafc",

                boxShadow:
                  "0 20px 60px rgba(15,23,42,0.35)",

                padding:
                  "14px 18px",
              }}

              labelStyle={{
                color:
                  "#cbd5e1",

                fontWeight: 700,

                marginBottom: 10,
              }}
            />

            {/* Legend */}

            <Legend

              iconType="circle"

              wrapperStyle={{
                paddingTop: 20,
                fontSize: "13px",
                color: "#475569",
              }}
            />

            {/* Scope 1 */}

            <Bar
              dataKey="Scope 1"

              stackId="a"

              fill="#f97316"

              radius={[
                0,
                0,
                6,
                6,
              ]}

              maxBarSize={46}
            />

            {/* Scope 2 */}

            <Bar
              dataKey="Scope 2"

              stackId="a"

              fill="#8b5cf6"

              maxBarSize={46}
            />

            {/* Scope 3 */}

            <Bar
              dataKey="Scope 3"

              stackId="a"

              fill="#0ea5e9"

              radius={[
                6,
                6,
                0,
                0,
              ]}

              maxBarSize={46}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
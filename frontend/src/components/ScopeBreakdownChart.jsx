import React from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Layers3,
  TrendingUp,
} from "lucide-react";

const COLORS = [
  "#f97316",
  "#8b5cf6",
  "#0ea5e9",
];

export default function ScopeBreakdownChart({
  data,
}) {

  const chartData = [

    {
      name: "Scope 1",

      value:
        data.scope1 || 0,

      description:
        "Direct emissions from owned operations",
    },

    {
      name: "Scope 2",

      value:
        data.scope2 || 0,

      description:
        "Indirect electricity & energy emissions",
    },

    {
      name: "Scope 3",

      value:
        data.scope3 || 0,

      description:
        "Value chain & business travel emissions",
    },
  ].filter(
    (d) => d.value > 0
  );

  const total =
    chartData.reduce(
      (sum, item) =>
        sum + item.value,
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

        flex items-center justify-between
      ">

        <div className="
          flex items-center gap-4
        ">

          <div className="
            w-14 h-14

            rounded-3xl

            bg-purple-50
            text-purple-600

            flex items-center justify-center

            ring-8 ring-purple-100
          ">

            <Layers3 size={24} />
          </div>

          <div>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              Emissions By Scope
            </h3>

            <p className="
              text-sm
              text-slate-500
              mt-1
            ">
              Scope-wise carbon footprint distribution
            </p>
          </div>
        </div>

        <div className="
          text-right
        ">

          <p className="
            text-xs
            uppercase
            tracking-wide
            text-slate-400
            mb-1
          ">
            Total
          </p>

          <h3 className="
            text-2xl
            font-bold
            text-slate-900
          ">
            {total.toFixed(2)}

            <span className="
              text-base
              font-medium
              text-slate-400
              ml-1
            ">
              tCO₂e
            </span>
          </h3>
        </div>
      </div>

      {/* Chart */}

      <div className="
        relative
        h-[340px]
        pt-6
      ">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={chartData}

              cx="50%"
              cy="44%"

              innerRadius={82}
              outerRadius={118}

              paddingAngle={4}

              dataKey="value"

              stroke="none"
            >

              {chartData.map(
                (
                  entry,
                  index
                ) => (

                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[
                      index %
                      COLORS.length
                    ]
                  }
                />
              ))}
            </Pie>

            {/* Tooltip */}

            <Tooltip

              formatter={(val) => [
                `${Number(
                  val
                ).toFixed(2)} tCO₂e`,
                "Emissions",
              ]}

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
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center */}

        <div className="
          absolute
          left-1/2 top-[41%]
          -translate-x-1/2
          -translate-y-1/2

          flex flex-col
          items-center
          text-center
          pointer-events-none
        ">

          <div className="
            w-14 h-14

            rounded-3xl

            bg-slate-100
            text-slate-700

            flex items-center justify-center

            mb-4
          ">

            <TrendingUp
              size={24}
            />
          </div>

          <h3 className="
            text-3xl
            font-bold
            text-slate-900
            leading-none
          ">

            {total.toFixed(1)}
          </h3>

          <p className="
            text-sm
            text-slate-500
            mt-2
          ">
            Total tCO₂e
          </p>
        </div>
      </div>

      {/* Legend */}

      <div className="
        px-7 pb-7
        space-y-4
      ">

        {chartData.map(
          (
            item,
            index
          ) => {

            const percent =
              total > 0

                ? (
                    (
                      item.value /
                      total
                    ) * 100
                  ).toFixed(1)

                : 0;

            return (
              <div
                key={item.name}

                className="
                  flex items-center justify-between

                  p-4

                  rounded-2xl

                  border border-slate-200

                  hover:bg-slate-50

                  transition-all
                "
              >

                {/* Left */}

                <div className="
                  flex items-center gap-4
                ">

                  <div
                    className="
                      w-4 h-4
                      rounded-full
                    "

                    style={{
                      backgroundColor:
                        COLORS[index],
                    }}
                  ></div>

                  <div>

                    <h4 className="
                      text-sm
                      font-bold
                      text-slate-900
                    ">
                      {item.name}
                    </h4>

                    <p className="
                      text-xs
                      text-slate-500
                      mt-1
                    ">
                      {
                        item.description
                      }
                    </p>
                  </div>
                </div>

                {/* Right */}

                <div className="
                  text-right
                ">

                  <h4 className="
                    text-lg
                    font-bold
                    text-slate-900
                  ">
                    {item.value.toFixed(
                      2
                    )}
                  </h4>

                  <p className="
                    text-xs
                    font-semibold
                    text-slate-500
                  ">
                    {percent}% of total
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
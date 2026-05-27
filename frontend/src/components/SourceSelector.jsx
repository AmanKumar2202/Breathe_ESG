import React from "react";

import {
  Database,
  Zap,
  Plane,
  ChevronRight,
} from "lucide-react";

export default function SourceSelector({
  onSelect,
}) {

  const sources = [

    {
      id: "SAP",

      title:
        "SAP Fuel & Procurement",

      desc:
        "Upload SAP MM exports, fuel transactions, and procurement activity records for Scope 1 processing.",

      formats:
        ".csv, .txt",

      scope: 1,

      icon: Database,

      gradient:
        "from-blue-500 to-cyan-500",

      glow:
        "shadow-blue-500/20",

      bg:
        "bg-blue-50",

      iconColor:
        "text-blue-600",
    },

    {
      id: "UTILITY",

      title:
        "Utility Data",

      desc:
        "Process electricity consumption exports from providers like ENERGY STAR, E.ON, and British Gas.",

      formats:
        ".csv",

      scope: 2,

      icon: Zap,

      gradient:
        "from-emerald-500 to-green-500",

      glow:
        "shadow-emerald-500/20",

      bg:
        "bg-emerald-50",

      iconColor:
        "text-emerald-600",
    },

    {
      id: "TRAVEL",

      title:
        "Corporate Travel",

      desc:
        "Import travel activity from Navan, Concur, flights, hotels, and transport systems.",

      formats:
        ".json",

      scope: 3,

      icon: Plane,

      gradient:
        "from-purple-500 to-pink-500",

      glow:
        "shadow-purple-500/20",

      bg:
        "bg-purple-50",

      iconColor:
        "text-purple-600",
    },
  ];

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

  return (
    <div className="
      space-y-5
    ">

      {/* Header */}

      <div>

        <h2 className="
          text-2xl
          font-bold
          text-slate-900
          mb-2
        ">
          Select Data Source
        </h2>

        <p className="
          text-sm
          text-slate-500
          leading-relaxed
        ">
          Choose the ESG dataset source you want to upload and process.
        </p>
      </div>

      {/* Cards */}

      <div className="
        space-y-5
      ">

        {sources.map((src) => {

          const Icon = src.icon;

          return (
            <button
              key={src.id}

              onClick={() =>
                onSelect(src)
              }

              className={`
                group
                relative
                overflow-hidden

                w-full
                text-left

                bg-white

                border border-slate-200

                rounded-3xl

                p-6

                hover:-translate-y-1
                hover:shadow-2xl

                transition-all duration-300
              `}
            >

              {/* Gradient Glow */}

              <div
                className={`
                  absolute inset-0
                  opacity-0
                  group-hover:opacity-100

                  bg-gradient-to-br
                  ${src.gradient}

                  transition-opacity duration-300
                `}
                style={{
                  opacity: 0.04,
                }}
              ></div>

              {/* Main Content */}

              <div className="
                relative z-10
                flex gap-5
              ">

                {/* Icon */}

                <div
                  className={`
                    w-16 h-16

                    rounded-3xl

                    flex items-center justify-center

                    ${src.bg}
                    ${src.iconColor}

                    shadow-xl
                    ${src.glow}

                    transition-transform duration-300
                    group-hover:scale-110
                  `}
                >
                  <Icon size={28} />
                </div>

                {/* Text */}

                <div className="
                  flex-1
                ">

                  <div className="
                    flex flex-col sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                    mb-3
                  ">

                    <div>

                      <h3 className="
                        text-xl
                        font-bold
                        text-slate-900
                        group-hover:text-blue-600
                        transition-colors
                        mb-1
                      ">
                        {src.title}
                      </h3>

                      <p className="
                        text-sm
                        text-slate-500
                      ">
                        Accepted formats:{" "}

                        <span className="
                          font-semibold
                          text-slate-700
                        ">
                          {src.formats}
                        </span>
                      </p>
                    </div>

                    <span
                      className={`
                        inline-flex
                        items-center

                        px-4 py-2

                        rounded-full
                        border

                        text-xs
                        font-bold
                        uppercase
                        tracking-wider

                        ${scopeColor(
                          src.scope
                        )}
                      `}
                    >
                      Scope {src.scope}
                    </span>
                  </div>

                  <p className="
                    text-sm
                    leading-relaxed
                    text-slate-600
                    max-w-2xl
                  ">
                    {src.desc}
                  </p>

                  {/* Footer */}

                  <div className="
                    mt-5
                    flex items-center justify-between
                  ">

                    <div className="
                      flex items-center gap-2
                    ">

                      <div className="
                        w-2 h-2
                        rounded-full
                        bg-emerald-500
                      "></div>

                      <span className="
                        text-xs
                        text-slate-500
                      ">
                        Parser ready for ingestion
                      </span>
                    </div>

                    <div className="
                      flex items-center gap-2

                      text-sm
                      font-semibold
                      text-slate-500

                      group-hover:text-blue-600

                      transition-colors
                    ">

                      <span>
                        Continue
                      </span>

                      <ChevronRight
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
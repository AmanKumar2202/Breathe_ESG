import React from "react";

import {
  ShieldCheck,
  Clock3,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export default function ReviewStatusBreakdown({
  counts,
}) {

  const approved =
    counts.APPROVED || 0;

  const pending =
    counts.PENDING || 0;

  const flagged =
    counts.FLAGGED || 0;

  const rejected =
    counts.REJECTED || 0;

  const total =
    approved +
    pending +
    flagged +
    rejected || 1;

  const percentage = (v) =>
    (
      (v / total) * 100
    ).toFixed(1);

  const statusData = [

    {
      label: "Approved",

      value: approved,

      icon: CheckCircle2,

      color: `
        bg-emerald-500
      `,

      soft: `
        bg-emerald-50
        border-emerald-200
      `,

      text: `
        text-emerald-700
      `,
    },

    {
      label: "Pending",

      value: pending,

      icon: Clock3,

      color: `
        bg-blue-500
      `,

      soft: `
        bg-blue-50
        border-blue-200
      `,

      text: `
        text-blue-700
      `,
    },

    {
      label: "Flagged",

      value: flagged,

      icon: AlertTriangle,

      color: `
        bg-amber-500
      `,

      soft: `
        bg-amber-50
        border-amber-200
      `,

      text: `
        text-amber-700
      `,
    },

    {
      label: "Rejected",

      value: rejected,

      icon: XCircle,

      color: `
        bg-red-500
      `,

      soft: `
        bg-red-50
        border-red-200
      `,

      text: `
        text-red-700
      `,
    },
  ];

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

            bg-emerald-50
            text-emerald-600

            flex items-center justify-center

            ring-8 ring-emerald-100
          ">

            <ShieldCheck
              size={24}
            />
          </div>

          <div>

            <h3 className="
              text-2xl
              font-bold
              text-slate-900
            ">
              Review Workflow
            </h3>

            <p className="
              text-sm
              text-slate-500
              mt-1
            ">
              Governance approval and validation status
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
            Total Records
          </p>

          <h3 className="
            text-2xl
            font-bold
            text-slate-900
          ">
            {total}
          </h3>
        </div>
      </div>

      {/* Progress */}

      <div className="
        px-7 pt-7
      ">

        <div className="
          flex items-center justify-between
          mb-4
        ">

          <div className="
            flex items-center gap-2
          ">

            <TrendingUp
              size={16}
              className="
                text-slate-400
              "
            />

            <span className="
              text-sm
              font-semibold
              text-slate-700
            ">
              Workflow Distribution
            </span>
          </div>

          <span className="
            text-sm
            text-slate-500
          ">
            ESG review pipeline
          </span>
        </div>

        {/* Main Progress */}

        <div className="
          w-full
          h-5

          rounded-full

          overflow-hidden

          bg-slate-100

          flex
        ">

          <div
            style={{
              width:
                `${percentage(
                  approved
                )}%`,
            }}

            className="
              bg-emerald-500
              h-full
              transition-all duration-700
            "
          ></div>

          <div
            style={{
              width:
                `${percentage(
                  pending
                )}%`,
            }}

            className="
              bg-blue-500
              h-full
              transition-all duration-700
            "
          ></div>

          <div
            style={{
              width:
                `${percentage(
                  flagged
                )}%`,
            }}

            className="
              bg-amber-500
              h-full
              transition-all duration-700
            "
          ></div>

          <div
            style={{
              width:
                `${percentage(
                  rejected
                )}%`,
            }}

            className="
              bg-red-500
              h-full
              transition-all duration-700
            "
          ></div>
        </div>
      </div>

      {/* Cards */}

      <div className="
        p-7

        grid
        grid-cols-1 sm:grid-cols-2
        gap-5
      ">

        {statusData.map(
          (item) => {

            const Icon =
              item.icon;

            return (
              <div
                key={item.label}

                className={`
                  border

                  rounded-3xl

                  p-5

                  transition-all duration-200

                  hover:-translate-y-1
                  hover:shadow-lg

                  ${item.soft}
                `}
              >

                <div className="
                  flex items-start justify-between
                  gap-4
                ">

                  {/* Left */}

                  <div>

                    <div className="
                      flex items-center gap-3
                      mb-4
                    ">

                      <div
                        className={`
                          w-12 h-12

                          rounded-2xl

                          flex items-center justify-center

                          text-white

                          ${item.color}
                        `}
                      >

                        <Icon size={22} />
                      </div>

                      <div>

                        <p className="
                          text-sm
                          text-slate-500
                        ">
                          {item.label}
                        </p>

                        <h3 className="
                          text-3xl
                          font-bold
                          text-slate-900
                        ">
                          {item.value}
                        </h3>
                      </div>
                    </div>

                    <div className="
                      text-sm
                      font-semibold
                      text-slate-600
                    ">

                      {percentage(
                        item.value
                      )}% of workflow
                    </div>
                  </div>

                  {/* Percentage */}

                  <div
                    className={`
                      px-3 py-2

                      rounded-2xl

                      text-sm
                      font-bold

                      bg-white

                      border border-white/60

                      ${item.text}
                    `}
                  >

                    {percentage(
                      item.value
                    )}%
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
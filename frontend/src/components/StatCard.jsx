import React, {
  useState,
  useEffect,
} from "react";

export default function StatCard({
  title,
  value,
  unit,
  icon,
  colorClass = "blue",
}) {

  const [displayValue, setDisplayValue] =
    useState(0);

  useEffect(() => {

    const target =
      parseFloat(value) || 0;

    const duration = 1200;

    const steps = 40;

    const increment =
      target / steps;

    let current = 0;

    const timer = setInterval(() => {

      current += increment;

      if (current >= target) {

        setDisplayValue(target);

        clearInterval(timer);

      } else {

        setDisplayValue(current);
      }

    }, duration / steps);

    return () =>
      clearInterval(timer);

  }, [value]);

  const isFloat =
    String(value).includes(".");

  const colorMap = {

    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      ring: "ring-blue-100",
      gradient:
        "from-blue-500/10 to-blue-100/40",
    },

    green: {
      bg: "bg-emerald-50",
      icon: "text-emerald-600",
      ring: "ring-emerald-100",
      gradient:
        "from-emerald-500/10 to-emerald-100/40",
    },

    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      ring: "ring-amber-100",
      gradient:
        "from-amber-500/10 to-amber-100/40",
    },

    red: {
      bg: "bg-red-50",
      icon: "text-red-600",
      ring: "ring-red-100",
      gradient:
        "from-red-500/10 to-red-100/40",
    },
  };

  const styles =
    colorMap[colorClass] ||
    colorMap.blue;

  return (
    <div className="
      group
      relative
      overflow-hidden
      bg-white
      border border-slate-200
      rounded-3xl
      p-6
      shadow-sm
      hover:shadow-2xl
      transition-all duration-300
      hover:-translate-y-1
    ">

      {/* Hover Glow */}

      <div
        className={`
          absolute inset-0
          opacity-0
          group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-br
          ${styles.gradient}
        `}
      ></div>

      {/* Main Content */}

      <div className="relative z-10">

        <div className="
          flex items-start justify-between
          mb-8
        ">

          {/* Text */}

          <div>

            <p className="
              text-sm
              font-medium
              text-slate-500
              mb-3
            ">
              {title}
            </p>

            <div className="
              flex items-end gap-2
            ">

              <h2 className="
                text-4xl
                font-bold
                text-slate-900
                tracking-tight
              ">

                {isFloat
                  ? displayValue.toFixed(2)
                  : Math.floor(
                      displayValue
                    ).toLocaleString()}
              </h2>

              {unit && (

                <span className="
                  text-sm
                  text-slate-400
                  mb-1
                ">
                  {unit}
                </span>
              )}
            </div>
          </div>

          {/* Icon */}

          <div
            className={`
              w-16 h-16
              rounded-2xl
              flex items-center justify-center
              ring-8
              transition-all duration-300
              group-hover:scale-110
              ${styles.bg}
              ${styles.icon}
              ${styles.ring}
            `}
          >
            {icon}
          </div>
        </div>

        {/* Footer */}

        <div className="
          flex items-center gap-2
        ">

          <div className="
            w-2 h-2
            rounded-full
            bg-emerald-500
          "></div>

          <p className="
            text-xs
            text-slate-500
          ">
            Updated from latest ingestion cycle
          </p>
        </div>
      </div>
    </div>
  );
}
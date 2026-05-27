import React from "react";

import {
  AlertTriangle,
  RefreshCcw,
  ShieldAlert,
  Activity,
} from "lucide-react";

class ErrorBoundary extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      hasError: false,

      error: null,
    };
  }

  static getDerivedStateFromError(error) {

    return {

      hasError: true,

      error,
    };
  }

  componentDidCatch(
    error,
    errorInfo
  ) {

    console.error(
      "Application Crash:",
      error,
      errorInfo
    );
  }

  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div className="
          min-h-screen

          relative
          overflow-hidden

          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-slate-950

          flex items-center justify-center

          px-6
        ">

          {/* Background Glow */}

          <div className="
            absolute inset-0
            overflow-hidden
            pointer-events-none
          ">

            <div className="
              absolute
              -top-24
              -right-24

              w-[420px]
              h-[420px]

              rounded-full

              bg-red-500/10

              blur-3xl
            "></div>

            <div className="
              absolute
              bottom-0
              left-0

              w-[320px]
              h-[320px]

              rounded-full

              bg-blue-500/10

              blur-3xl
            "></div>
          </div>

          {/* Card */}

          <div className="
            relative z-10

            w-full
            max-w-2xl

            bg-white/5
            backdrop-blur-2xl

            border border-white/10

            rounded-[2.5rem]

            p-10 lg:p-14

            shadow-2xl
          ">

            {/* Top */}

            <div className="
              flex flex-col
              items-center
              text-center
            ">

              {/* Icon */}

              <div className="
                relative
                mb-8
              ">

                <div className="
                  absolute inset-0

                  rounded-full

                  bg-red-500/20

                  blur-2xl
                "></div>

                <div className="
                  relative

                  w-28 h-28

                  rounded-[2rem]

                  bg-gradient-to-br
                  from-red-500
                  to-red-600

                  text-white

                  flex items-center justify-center

                  shadow-2xl shadow-red-500/30
                ">

                  <ShieldAlert
                    size={52}
                  />
                </div>
              </div>

              {/* Heading */}

              <h1 className="
                text-5xl
                font-bold
                text-white
                tracking-tight
                mb-5
              ">
                System Error
              </h1>

              <p className="
                text-slate-300
                text-lg
                leading-relaxed
                max-w-xl
                mb-10
              ">
                The ESG platform encountered an unexpected runtime issue while processing the current workflow.
              </p>
            </div>

            {/* Info Grid */}

            <div className="
              grid
              grid-cols-1 md:grid-cols-3
              gap-5
              mb-10
            ">

              {/* Status */}

              <div className="
                bg-white/5

                border border-white/10

                rounded-3xl

                p-5
              ">

                <div className="
                  w-12 h-12

                  rounded-2xl

                  bg-red-500/10
                  text-red-400

                  flex items-center justify-center

                  mb-4
                ">

                  <AlertTriangle
                    size={22}
                  />
                </div>

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                  mb-2
                ">
                  Severity
                </p>

                <h3 className="
                  text-lg
                  font-bold
                  text-white
                ">
                  Critical
                </h3>
              </div>

              {/* Service */}

              <div className="
                bg-white/5

                border border-white/10

                rounded-3xl

                p-5
              ">

                <div className="
                  w-12 h-12

                  rounded-2xl

                  bg-blue-500/10
                  text-blue-400

                  flex items-center justify-center

                  mb-4
                ">

                  <Activity
                    size={22}
                  />
                </div>

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                  mb-2
                ">
                  Service
                </p>

                <h3 className="
                  text-lg
                  font-bold
                  text-white
                ">
                  ESG Platform
                </h3>
              </div>

              {/* Recovery */}

              <div className="
                bg-white/5

                border border-white/10

                rounded-3xl

                p-5
              ">

                <div className="
                  w-12 h-12

                  rounded-2xl

                  bg-emerald-500/10
                  text-emerald-400

                  flex items-center justify-center

                  mb-4
                ">

                  <RefreshCcw
                    size={22}
                  />
                </div>

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                  mb-2
                ">
                  Recovery
                </p>

                <h3 className="
                  text-lg
                  font-bold
                  text-white
                ">
                  Available
                </h3>
              </div>
            </div>

            {/* Error Details */}

            {this.state.error && (

              <div className="
                mb-10

                bg-black/30

                border border-white/10

                rounded-3xl

                p-6
              ">

                <p className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-slate-500
                  mb-3
                ">
                  Technical Details
                </p>

                <pre className="
                  text-sm
                  text-red-300

                  overflow-x-auto

                  whitespace-pre-wrap
                  break-words
                ">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {/* Actions */}

            <div className="
              flex flex-col sm:flex-row
              gap-4
            ">

              <button
                onClick={() =>
                  window.location.reload()
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

                  shadow-2xl shadow-blue-500/20

                  transition-all duration-200

                  hover:-translate-y-1
                "
              >

                <RefreshCcw
                  size={20}
                />

                <span>
                  Reload Application
                </span>
              </button>

              <button
                onClick={() =>
                  window.location.href = "/dashboard"
                }

                className="
                  flex-1

                  border border-white/10

                  bg-white/5

                  hover:bg-white/10

                  text-white

                  py-4

                  rounded-2xl

                  font-semibold

                  transition-all duration-200
                "
              >
                Return To Dashboard
              </button>
            </div>

            {/* Footer */}

            <div className="
              text-center
              mt-10
            ">

              <p className="
                text-sm
                text-slate-500
              ">
                Breathe ESG • Enterprise Carbon Intelligence Platform
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
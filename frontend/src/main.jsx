import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";

import App from "./App.jsx";

import {
  AuthProvider,
} from "./AuthContext.jsx";

import "./index.css";

/* ========================================
   REACT QUERY CONFIG
======================================== */

const queryClient =
  new QueryClient({

    defaultOptions: {

      queries: {

        staleTime:
          1000 * 60 * 5,

        refetchOnWindowFocus:
          false,

        retry: 1,

        suspense: false,
      },

      mutations: {

        retry: 1,
      },
    },
  });

/* ========================================
   ROOT
======================================== */

ReactDOM
  .createRoot(
    document.getElementById("root")
  )

  .render(

    <React.StrictMode>

      <QueryClientProvider
        client={queryClient}
      >

        <BrowserRouter>

          <AuthProvider>

            {/* App Shell */}

            <div className="
              min-h-screen

              bg-gradient-to-b
              from-slate-50
              via-slate-50
              to-slate-100

              text-slate-900

              antialiased
            ">

              {/* Background Blur Orbs */}

              <div className="
                fixed
                inset-0
                overflow-hidden
                pointer-events-none
                z-0
              ">

                <div className="
                  absolute
                  -top-32
                  -right-32

                  w-[420px]
                  h-[420px]

                  rounded-full

                  bg-blue-500/10

                  blur-3xl
                "></div>

                <div className="
                  absolute
                  bottom-0
                  left-0

                  w-[340px]
                  h-[340px]

                  rounded-full

                  bg-cyan-400/10

                  blur-3xl
                "></div>

                <div className="
                  absolute
                  top-1/3
                  left-1/3

                  w-[280px]
                  h-[280px]

                  rounded-full

                  bg-purple-500/5

                  blur-3xl
                "></div>
              </div>

              {/* Main App */}

              <div className="
                relative
                z-10
              ">

                <App />
              </div>
            </div>

          </AuthProvider>

        </BrowserRouter>

        {/* React Query Devtools */}

        <ReactQueryDevtools
          initialIsOpen={false}
        />

      </QueryClientProvider>

    </React.StrictMode>
  );
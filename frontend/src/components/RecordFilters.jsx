import React from "react";

import {
  Search,
  X,
  SlidersHorizontal,
  Filter,
} from "lucide-react";

export default function RecordFilters({
  searchParams,
  setSearchParams,
}) {

  const updateFilter = (
    key,
    value
  ) => {

    const params =
      new URLSearchParams(
        searchParams
      );

    if (value) {

      params.set(key, value);

    } else {

      params.delete(key);
    }

    params.set("page", "1");

    setSearchParams(params);
  };

  const handleStatusToggle = (
    status
  ) => {

    const current =
      searchParams
        .get("review_status")
        ?.split(",") || [];

    const updated =
      current.includes(status)

        ? current.filter(
            (s) =>
              s !== status
          )

        : [...current, status];

    updateFilter(
      "review_status",
      updated.join(",")
    );
  };

  const clearFilters = () => {

    setSearchParams(
      new URLSearchParams()
    );
  };

  const activeStatus =
    searchParams.get(
      "review_status"
    ) || "";

  return (
    <div className="
      bg-white
      border border-slate-200
      rounded-3xl
      p-6
      shadow-sm
    ">

      {/* Header */}

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
          <SlidersHorizontal size={20} />
        </div>

        <div>

          <h3 className="
            text-lg
            font-bold
            text-slate-900
          ">
            Filters & Search
          </h3>

          <p className="
            text-sm
            text-slate-500
          ">
            Narrow down emission records
            using scopes, sources, and status
          </p>
        </div>
      </div>

      {/* Main Grid */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-3
        gap-6
      ">

        {/* Left Side */}

        <div className="
          xl:col-span-2
          space-y-6
        ">

          {/* Scope Filter */}

          <div>

            <div className="
              flex items-center gap-2
              mb-3
            ">

              <Filter
                size={16}
                className="text-slate-400"
              />

              <span className="
                text-sm
                font-semibold
                text-slate-700
              ">
                Emission Scope
              </span>
            </div>

            <div className="
              flex flex-wrap gap-3
            ">

              {[
                "All",
                "1",
                "2",
                "3",
              ].map((scope) => {

                const isActive =
                  searchParams.get(
                    "scope"
                  ) ===
                  (scope === "All"
                    ? null
                    : scope);

                return (
                  <button
                    key={scope}

                    onClick={() =>
                      updateFilter(
                        "scope",
                        scope === "All"
                          ? ""
                          : scope
                      )
                    }

                    className={`
                      px-5 py-3
                      rounded-2xl
                      text-sm
                      font-semibold
                      transition-all duration-200
                      border

                      ${
                        isActive

                          ? `
                            bg-blue-600
                            text-white
                            border-blue-600
                            shadow-lg
                            shadow-blue-500/20
                          `

                          : `
                            bg-slate-50
                            text-slate-600
                            border-slate-200
                            hover:bg-slate-100
                          `
                      }
                    `}
                  >
                    {scope === "All"
                      ? "All Scopes"
                      : `Scope ${scope}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Dropdown */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              Source Type
            </label>

            <select
              value={
                searchParams.get(
                  "source_type"
                ) || ""
              }

              onChange={(e) =>
                updateFilter(
                  "source_type",
                  e.target.value
                )
              }

              className="
                w-full
                bg-slate-50
                border border-slate-200
                rounded-2xl
                px-4 py-3
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
                All Sources
              </option>

              <option value="SAP">
                SAP
              </option>

              <option value="UTILITY">
                Utility
              </option>

              <option value="TRAVEL">
                Travel
              </option>
            </select>
          </div>

          {/* Status Chips */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              Review Status
            </label>

            <div className="
              flex flex-wrap gap-3
            ">

              {[
                "PENDING",
                "APPROVED",
                "FLAGGED",
                "REJECTED",
              ].map((status) => {

                const active =
                  activeStatus.includes(
                    status
                  );

                return (
                  <button
                    key={status}

                    onClick={() =>
                      handleStatusToggle(
                        status
                      )
                    }

                    className={`
                      px-4 py-2.5
                      rounded-full
                      border
                      text-sm
                      font-semibold
                      transition-all duration-200

                      ${
                        active

                          ? `
                            bg-slate-900
                            text-white
                            border-slate-900
                          `

                          : `
                            bg-white
                            text-slate-600
                            border-slate-200
                            hover:bg-slate-50
                          `
                      }
                    `}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side */}

        <div className="
          flex flex-col
          justify-between
          gap-6
        ">

          {/* Search */}

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-slate-700
              mb-3
            ">
              Search Description
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

              <input
                type="text"

                placeholder="Search records..."

                value={
                  searchParams.get(
                    "search"
                  ) || ""
                }

                onChange={(e) =>
                  updateFilter(
                    "search",
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
                  placeholder:text-slate-400
                  outline-none
                  focus:ring-4
                  focus:ring-blue-100
                  focus:border-blue-500
                  transition-all
                "
              />
            </div>
          </div>

          {/* Clear */}

          {searchParams.toString() &&
            searchParams.toString() !==
              "page=1" && (

            <button
              onClick={
                clearFilters
              }

              className="
                flex items-center justify-center gap-2

                w-full

                border border-red-200
                bg-red-50

                text-red-600

                hover:bg-red-100

                rounded-2xl

                px-4 py-3

                font-medium

                transition-all duration-200
              "
            >

              <X size={18} />

              <span>
                Clear All Filters
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
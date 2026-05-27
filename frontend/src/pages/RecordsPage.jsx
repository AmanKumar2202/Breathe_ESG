import React, {
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  get,
  post,
} from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

import { useAuth } from "../AuthContext";

import {
  CheckCircle,
  AlertTriangle,
  Database,
} from "lucide-react";

import RecordFilters from "../components/RecordFilters";
import RecordsTable from "../components/RecordsTable";
import RecordDetailDrawer from "../components/RecordDetailDrawer";

export default function RecordsPage() {

  const { user } = useAuth();

  const queryClient =
    useQueryClient();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);

  const [
    drawerRecordId,
    setDrawerRecordId,
  ] = useState(null);

  const [toast, setToast] =
    useState(null);

  const showToast = (
    message,
    type = "success"
  ) => {

    setToast({
      message,
      type,
    });

    setTimeout(
      () => setToast(null),
      4000
    );
  };

  const page = parseInt(
    searchParams.get("page") || "1"
  );

  const searchFilters =
    Object.fromEntries(
      searchParams.entries()
    );

  if (searchFilters.search) {

    searchFilters.activity_description__icontains =
      searchFilters.search;

    delete searchFilters.search;
  }

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: [
      "records",
      searchParams.toString(),
    ],

    queryFn: () =>
      get(
        ENDPOINTS.RECORDS,
        {
          params:
            searchFilters,
        }
      ),

    keepPreviousData: true,
  });

  const bulkReviewMutation =
    useMutation({

      mutationFn: (action) =>
        post(
          ENDPOINTS.RECORDS_BULK_REVIEW,
          {
            record_ids:
              selectedIds,

            action,

            review_notes:
              "Bulk action",
          }
        ),

      onMutate:
        async (action) => {

          await queryClient.cancelQueries([
            "records",
            searchParams.toString(),
          ]);

          const prev =
            queryClient.getQueryData([
              "records",
              searchParams.toString(),
            ]);

          queryClient.setQueryData(
            [
              "records",
              searchParams.toString(),
            ],

            (old) => ({
              ...old,

              results:
                old.results.map(
                  (r) =>
                    selectedIds.includes(
                      r.id
                    )
                      ? {
                          ...r,
                          review_status:
                            action,
                          is_locked:
                            action ===
                            "APPROVE",
                        }
                      : r
                ),
            })
          );

          return { prev };
        },

      onError:
        (
          err,
          newTodo,
          context
        ) => {

          queryClient.setQueryData(
            [
              "records",
              searchParams.toString(),
            ],
            context.prev
          );

          showToast(
            "Bulk action failed.",
            "error"
          );
        },

      onSuccess:
        (data, action) => {

          setSelectedIds([]);

          showToast(
            `Successfully marked records as ${action}.`,
            "success"
          );
        },

      onSettled: () =>
        queryClient.invalidateQueries([
          "records",
        ]),
    });

  const handleBulkAction = (
    action
  ) => {

    if (
      confirm(
        `Are you sure you want to ${action} ${selectedIds.length} records?`
      )
    ) {

      bulkReviewMutation.mutate(
        action
      );
    }
  };

  return (
    <div className="
      relative
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
              w-14 h-14
              rounded-2xl
              bg-blue-50
              text-blue-600
              flex items-center justify-center
              ring-8 ring-blue-100
            ">
              <Database size={24} />
            </div>

            <div>

              <h1 className="
                text-4xl
                font-bold
                text-slate-900
                tracking-tight
              ">
                Emission Records
              </h1>

              <p className="
                text-slate-500
                mt-1
              ">
                Review, audit, and manage
                enterprise carbon activity records
              </p>
            </div>
          </div>
        </div>

        <div className="
          flex items-center gap-3
        ">

          <div className="
            bg-white
            border border-slate-200
            rounded-2xl
            px-5 py-3
            shadow-sm
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
              {data?.count || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div className="
        bg-white
        border border-slate-200
        rounded-3xl
        p-6
        shadow-sm
      ">
        <RecordFilters
          searchParams={
            searchParams
          }

          setSearchParams={
            setSearchParams
          }
        />
      </div>

      {/* Table */}

      <div className="
        bg-white
        border border-slate-200
        rounded-3xl
        shadow-sm
        overflow-hidden
      ">

        <RecordsTable
          records={
            data?.results || []
          }

          isLoading={
            isLoading
          }

          selectedIds={
            selectedIds
          }

          setSelectedIds={
            setSelectedIds
          }

          onRowClick={
            setDrawerRecordId
          }

          page={page}

          setPage={(p) => {

            const prm =
              new URLSearchParams(
                searchParams
              );

            prm.set(
              "page",
              p
            );

            setSearchParams(
              prm
            );
          }}

          totalPages={Math.ceil(
            (data?.count || 0) / 50
          )}
        />
      </div>

      {/* Bulk Action Bar */}

      {selectedIds.length > 0 &&
        user?.role !== "auditor" && (

        <div className="
          fixed
          bottom-8
          left-1/2
          -translate-x-1/2
          z-50

          bg-white/90
          backdrop-blur-xl

          border border-slate-200

          shadow-2xl

          rounded-3xl

          px-6 py-4

          flex flex-col sm:flex-row
          items-center
          gap-5
        ">

          <div className="
            flex items-center gap-3
          ">

            <div className="
              w-10 h-10
              rounded-2xl
              bg-blue-50
              text-blue-600
              flex items-center justify-center
            ">
              <CheckCircle size={18} />
            </div>

            <div>

              <p className="
                text-xs
                uppercase
                tracking-wide
                text-slate-400
              ">
                Selected
              </p>

              <h3 className="
                text-sm
                font-semibold
                text-slate-900
              ">
                {selectedIds.length} records
              </h3>
            </div>
          </div>

          <div className="
            flex items-center gap-3
          ">

            <button
              onClick={() =>
                handleBulkAction(
                  "APPROVE"
                )
              }
              className="
                px-5 py-3
                rounded-2xl
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                font-medium
                transition-all
              "
            >
              Approve
            </button>

            <button
              onClick={() =>
                handleBulkAction(
                  "FLAG"
                )
              }
              className="
                px-5 py-3
                rounded-2xl
                bg-amber-500
                hover:bg-amber-600
                text-white
                font-medium
                transition-all
              "
            >
              Flag
            </button>

            <button
              onClick={() =>
                handleBulkAction(
                  "REJECT"
                )
              }
              className="
                px-5 py-3
                rounded-2xl
                bg-red-500
                hover:bg-red-600
                text-white
                font-medium
                transition-all
              "
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Drawer */}

      {drawerRecordId && (

        <RecordDetailDrawer
          recordId={
            drawerRecordId
          }

          onClose={() =>
            setDrawerRecordId(
              null
            )
          }

          showToast={
            showToast
          }
        />
      )}

      {/* Toast */}

      {toast && (

        <div
          className={`
            fixed top-6 right-6 z-[100]

            px-6 py-4
            rounded-2xl

            shadow-2xl
            border

            flex items-center gap-4

            backdrop-blur-xl

            animate-in slide-in-from-top-4

            ${
              toast.type ===
              "success"

                ? `
                  bg-emerald-50/90
                  border-emerald-200
                  text-emerald-700
                `

                : `
                  bg-red-50/90
                  border-red-200
                  text-red-700
                `
            }
          `}
        >

          {toast.type ===
          "success" ? (

            <CheckCircle
              size={20}
            />

          ) : (

            <AlertTriangle
              size={20}
            />
          )}

          <span className="
            font-medium
          ">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
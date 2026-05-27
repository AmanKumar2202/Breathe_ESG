import React, {
  useState,
  useEffect,
} from "react";

import {
  X,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileEdit,
  Calendar,
  Database,
  Pencil,
} from "lucide-react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  get,
  patch,
} from "../utils/client";

import { ENDPOINTS } from "../utils/endpoints";

import { useAuth } from "../AuthContext";

import {
  formatCO2e,
  formatActivity,
  formatDateRange,
  statusColor,
} from "../utils/formatters";

import ReviewActions from "./ReviewActions";

export default function RecordDetailDrawer({
  recordId,
  onClose,
  showToast,
}) {

  const { user } = useAuth();

  const queryClient =
    useQueryClient();

  const [isEditing,
    setIsEditing] =
      useState(false);

  const [editForm,
    setEditForm] =
      useState({});

  const [
    reviewActionType,
    setReviewActionType,
  ] = useState(null);

  const {
    data: record,
    isLoading,
  } = useQuery({
    queryKey: [
      "record",
      recordId,
    ],

    queryFn: () =>
      get(
        `${ENDPOINTS.RECORDS}${recordId}/`
      ),

    enabled: !!recordId,
  });

  useEffect(() => {

    if (record) {

      setEditForm({
        activity_value:
          record.activity_value,

        activity_unit:
          record.activity_unit,

        activity_description:
          record.activity_description,

        review_notes: "",
      });
    }

  }, [record]);

  const updateMutation =
    useMutation({

      mutationFn: (data) =>
        patch(
          `${ENDPOINTS.RECORDS}${recordId}/`,
          data
        ),

      onSuccess: () => {

        queryClient.invalidateQueries([
          "record",
          recordId,
        ]);

        queryClient.invalidateQueries([
          "records",
        ]);

        setIsEditing(false);

        showToast(
          "Record updated successfully.",
          "success"
        );
      },

      onError: () =>

        showToast(
          "Failed to update record.",
          "error"
        ),
    });

  if (!recordId)
    return null;

  return (
    <div className="
      fixed inset-0 z-50
      flex justify-end
    ">

      {/* Overlay */}

      <div
        onClick={onClose}

        className="
          absolute inset-0
          bg-slate-950/40
          backdrop-blur-sm
        "
      ></div>

      {/* Drawer */}

      <div className="
        relative
        w-full max-w-2xl
        h-full
        bg-white
        border-l border-slate-200
        shadow-2xl
        flex flex-col
        animate-in slide-in-from-right
        duration-300
      ">

        {/* Header */}

        <div className="
          sticky top-0 z-20
          bg-white/90
          backdrop-blur-xl
          border-b border-slate-200
          px-8 py-6
        ">

          <div className="
            flex items-start justify-between
          ">

            <div>

              <div className="
                flex items-center gap-3
                mb-2
              ">

                <div className="
                  w-12 h-12
                  rounded-2xl
                  bg-blue-50
                  text-blue-600
                  flex items-center justify-center
                  ring-8 ring-blue-100
                ">
                  <Database size={20} />
                </div>

                <div>

                  <h2 className="
                    text-2xl
                    font-bold
                    text-slate-900
                  ">
                    Record Details
                  </h2>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    ESG activity inspection & review
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}

              className="
                w-11 h-11
                rounded-2xl
                border border-slate-200
                bg-white
                flex items-center justify-center
                text-slate-500
                hover:bg-slate-100
                hover:text-slate-900
                transition-all
              "
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Loading */}

        {isLoading ? (

          <div className="
            flex-1
            flex items-center justify-center
            text-slate-500
          ">
            Loading record details...
          </div>

        ) : (

          <div className="
            flex-1
            overflow-y-auto
            px-8 py-8
            space-y-8
          ">

            {/* Summary Card */}

            <div className="
              bg-gradient-to-br
              from-slate-900
              to-slate-800
              rounded-3xl
              p-8
              text-white
              shadow-2xl
            ">

              <div className="
                flex items-start justify-between
                gap-6
              ">

                <div>

                  <p className="
                    text-sm
                    text-slate-400
                    uppercase
                    tracking-wider
                    mb-3
                  ">
                    Total Emissions
                  </p>

                  <h1 className="
                    text-5xl
                    font-bold
                    tracking-tight
                    mb-3
                  ">
                    {formatCO2e(
                      record.co2e_tonnes
                    )}
                  </h1>

                  <div className="
                    flex items-center gap-3
                  ">

                    <span
                      className={`
                        px-4 py-2
                        rounded-full
                        text-xs
                        font-bold
                        border
                        ${statusColor(
                          record.review_status
                        )}
                      `}
                    >
                      {record.review_status}
                    </span>

                    {record?.is_locked && (

                      <div className="
                        flex items-center gap-2
                        text-amber-300
                        text-sm
                      ">

                        <Lock size={16} />

                        <span>
                          Locked Record
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}

            <div className="
              bg-white
              border border-slate-200
              rounded-3xl
              p-7
              shadow-sm
            ">

              <div className="
                flex items-center justify-between
                mb-8
              ">

                <div>

                  <h3 className="
                    text-xl
                    font-bold
                    text-slate-900
                    mb-1
                  ">
                    Activity Details
                  </h3>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Emission metadata and activity values
                  </p>
                </div>

                {record.is_editable &&
                  user?.role !== "auditor" &&
                  !isEditing && (

                  <button
                    onClick={() =>
                      setIsEditing(true)
                    }

                    className="
                      flex items-center gap-2

                      px-4 py-3

                      rounded-2xl

                      border border-slate-200

                      bg-white

                      hover:bg-slate-100

                      text-slate-700

                      font-medium

                      transition-all
                    "
                  >

                    <Pencil size={16} />

                    <span>
                      Edit
                    </span>
                  </button>
                )}
              </div>

              <div className="
                space-y-7
              ">

                {/* Description */}

                <div>

                  <label className="
                    block
                    text-sm
                    font-semibold
                    text-slate-700
                    mb-3
                  ">
                    Description
                  </label>

                  {isEditing ? (

                    <textarea
                      rows={4}

                      value={
                        editForm.activity_description
                      }

                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          activity_description:
                            e.target.value,
                        })
                      }

                      className="
                        w-full
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-3
                        outline-none
                        focus:ring-4
                        focus:ring-blue-100
                        focus:border-blue-500
                      "
                    />

                  ) : (

                    <div className="
                      bg-slate-50
                      border border-slate-200
                      rounded-2xl
                      p-5
                      text-slate-700
                      leading-relaxed
                    ">
                      {
                        record.activity_description
                      }
                    </div>
                  )}
                </div>

                {/* Grid */}

                <div className="
                  grid
                  grid-cols-1 md:grid-cols-2
                  gap-6
                ">

                  {/* Activity */}

                  <div>

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-3
                    ">
                      Activity Value
                    </label>

                    {isEditing ? (

                      <input
                        type="number"

                        value={
                          editForm.activity_value
                        }

                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            activity_value:
                              e.target.value,
                          })
                        }

                        className="
                          w-full
                          rounded-2xl
                          border border-slate-200
                          bg-slate-50
                          px-4 py-3
                          outline-none
                          focus:ring-4
                          focus:ring-blue-100
                          focus:border-blue-500
                        "
                      />

                    ) : (

                      <div className="
                        bg-slate-50
                        border border-slate-200
                        rounded-2xl
                        p-5
                        text-slate-900
                        font-semibold
                      ">
                        {formatActivity(
                          record.activity_value,
                          record.activity_unit
                        )}
                      </div>
                    )}
                  </div>

                  {/* Period */}

                  <div>

                    <label className="
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      mb-3
                    ">
                      Reporting Period
                    </label>

                    <div className="
                      bg-slate-50
                      border border-slate-200
                      rounded-2xl
                      p-5
                      flex items-center gap-3
                    ">

                      <Calendar
                        size={18}
                        className="
                          text-slate-400
                        "
                      />

                      <span className="
                        text-slate-700
                        font-medium
                      ">
                        {formatDateRange(
                          record.period_start,
                          record.period_end
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}

                {isEditing && (

                  <div className="
                    flex items-center gap-4
                    pt-4
                  ">

                    <button
                      onClick={() =>
                        updateMutation.mutate(
                          editForm
                        )
                      }

                      className="
                        flex-1
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        font-semibold
                        py-4
                        rounded-2xl
                        transition-all
                      "
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() =>
                        setIsEditing(false)
                      }

                      className="
                        flex-1
                        border border-slate-200
                        bg-white
                        hover:bg-slate-100
                        text-slate-700
                        font-semibold
                        py-4
                        rounded-2xl
                        transition-all
                      "
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}

            {!record.is_locked &&
              user?.role !== "auditor" && (

              <div className="
                bg-white
                border border-slate-200
                rounded-3xl
                p-7
                shadow-sm
              ">

                <h3 className="
                  text-xl
                  font-bold
                  text-slate-900
                  mb-2
                ">
                  Analyst Review
                </h3>

                <p className="
                  text-sm
                  text-slate-500
                  mb-6
                ">
                  Approve, flag, or reject this record
                </p>

                <div className="
                  grid
                  grid-cols-1 sm:grid-cols-3
                  gap-4
                ">

                  <button
                    onClick={() =>
                      setReviewActionType(
                        "APPROVE"
                      )
                    }

                    className="
                      flex items-center justify-center gap-2

                      bg-emerald-600
                      hover:bg-emerald-700

                      text-white

                      py-4
                      rounded-2xl

                      font-semibold

                      transition-all
                    "
                  >

                    <CheckCircle size={18} />

                    <span>
                      Approve
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setReviewActionType(
                        "FLAG"
                      )
                    }

                    className="
                      flex items-center justify-center gap-2

                      bg-amber-500
                      hover:bg-amber-600

                      text-white

                      py-4
                      rounded-2xl

                      font-semibold

                      transition-all
                    "
                  >

                    <AlertTriangle size={18} />

                    <span>
                      Flag
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setReviewActionType(
                        "REJECT"
                      )
                    }

                    className="
                      flex items-center justify-center gap-2

                      bg-red-500
                      hover:bg-red-600

                      text-white

                      py-4
                      rounded-2xl

                      font-semibold

                      transition-all
                    "
                  >

                    <X size={18} />

                    <span>
                      Reject
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}

      {reviewActionType && (

        <ReviewActions
          recordId={record.id}

          actionType={
            reviewActionType
          }

          onClose={() =>
            setReviewActionType(
              null
            )
          }

          onSuccess={() => {

            setReviewActionType(
              null
            );

            queryClient.invalidateQueries([
              "record",
              recordId,
            ]);

            queryClient.invalidateQueries([
              "records",
            ]);

            showToast(
              `Record marked as ${reviewActionType}`,
              "success"
            );
          }}
        />
      )}
    </div>
  );
}
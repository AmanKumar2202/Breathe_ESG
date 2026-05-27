import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { get, post, patch } from "../utils/client";
import { ENDPOINTS } from "../utils/endpoints";

export default function ReviewActions({
  recordId,
  actionType,
  onClose,
  onSuccess,
}) {
  const [notes, setNotes] = useState("");

  const reviewMutation = useMutation({
    mutationFn: () =>
      post(ENDPOINTS.RECORD_REVIEW(recordId), {
        action: actionType,
        review_notes: notes,
      }),
    onSuccess,
  });

  const isDestructive = actionType === "REJECT" || actionType === "FLAG";
  const submitBtnClass =
    actionType === "APPROVE"
      ? "bg-accent-green hover:bg-emerald-600 text-white"
      : actionType === "FLAG"
        ? "bg-accent-amber hover:bg-amber-600 text-white"
        : "bg-accent-red hover:bg-red-600 text-white";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border p-6 rounded-xl w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-text-primary mb-2 capitalize">
          {actionType} Record
        </h2>
        <p className="text-text-secondary text-sm mb-4">
          {actionType === "APPROVE"
            ? "This will lock the record for audit. Are you sure?"
            : "Please provide a reason for this decision."}
        </p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add optional review notes..."
          rows={3}
          className="w-full bg-surface-elevated border border-border rounded-lg p-3 text-text-primary text-sm mb-6 outline-none focus:border-accent-blue resize-none"
        />

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-elevated transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => reviewMutation.mutate()}
            disabled={
              reviewMutation.isPending ||
              (actionType === "REJECT" && !notes.trim())
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${submitBtnClass}`}
          >
            {reviewMutation.isPending ? "Saving..." : `Confirm ${actionType}`}
          </button>
        </div>
      </div>
    </div>
  );
}

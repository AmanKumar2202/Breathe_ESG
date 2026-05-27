// Ensure endpoints do NOT use a leading slash or an /api/ prefix
export const ENDPOINTS = {
  TOKEN: "auth/token/",
  TOKEN_REFRESH: "auth/token/refresh/",
  JOBS: "jobs/",
  JOB_RETRY: (id) => `jobs/${id}/retry/`,
  RECORDS: "records/",
  RECORD_REVIEW: (id) => `records/${id}/review/`,
  RECORDS_BULK_REVIEW: "records/bulk_review/",
  DASHBOARD_SUMMARY: "dashboard/summary/",
  AUDIT: "audit/",
};
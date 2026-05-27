export const formatCO2e = (value) => {
  const tonnes = parseFloat(value);
  if (isNaN(tonnes)) return "0.00 tCO2e";
  if (tonnes >= 1) return `${tonnes.toFixed(2)} tCO2e`;
  if (tonnes >= 0.001) return `${(tonnes * 1000).toFixed(1)} kgCO2e`;
  return `${(tonnes * 1000000).toFixed(0)} gCO2e`;
};

export const formatActivity = (value, unit) => {
  const num = parseFloat(value);
  if (isNaN(num)) return `0 ${unit || ""}`;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  const capUnit = unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : "";
  return `${formatted} ${capUnit}`;
};

export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateRange = (start, end) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const sDay = s.toLocaleDateString("en-US", { day: "numeric" });
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eDay = e.toLocaleDateString("en-US", { day: "numeric" });
  const eMonth = e.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear())
    return `${sDay} – ${eDay} ${eMonth}`;
  return `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
};

export const statusColor = (status) => {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "bg-accent-green/10 text-accent-green border-accent-green/20";
    case "PENDING":
      return "bg-accent-amber/10 text-accent-amber border-accent-amber/20";
    case "FLAGGED":
      return "bg-accent-red/10 text-accent-red border-accent-red/20";
    case "REJECTED":
      return "bg-gray-500/10 text-text-secondary border-border";
    default:
      return "bg-surface-elevated text-text-secondary border-border";
  }
};

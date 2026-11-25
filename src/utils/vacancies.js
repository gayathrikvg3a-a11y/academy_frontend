import { format } from "date-fns";

// ================= VACANCY OPTIONS =================
//
// Job types mirror the backend's JOB_TYPE choices. The value → label lookup is
// needed by the form, the filter bar and the table, so it lives here instead
// of being restated in three files and drifting apart.

export const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

export const JOB_TYPE_LABELS = Object.fromEntries(
  JOB_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

// ================= DERIVED STATUS =================
//
// The API keeps `is_active` and `close_date` apart, but every screen shows a
// single chip, so the two collapse into one status here. A vacancy the backend
// never sent `is_active` for is treated as live.

export function getVacancyStatus(vacancy) {
  if (vacancy.is_active === false) {
    return "INACTIVE";
  }

  // Local date, not toISOString's UTC one, which is yesterday before 5:30 AM IST.
  const today = format(new Date(), "yyyy-MM-dd");

  if (vacancy.close_date && vacancy.close_date < today) {
    return "CLOSED";
  }

  return "OPEN";
}

// ================= DATE =================

export function formatCloseDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

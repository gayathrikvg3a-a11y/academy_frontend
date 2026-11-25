// ================= STAFF OPTIONS =================
//
// Roles and domains mirror the backend's ROLE_CHOICES and DOMAIN_CHOICES. The
// form, the filter bar and the table all need the value → label lookup, so it
// lives here once.

export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "TRAINER", label: "Trainer" },
  { value: "COUNSELLOR", label: "Counsellor" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "MARKETING", label: "Marketing" },
  { value: "RECEPTIONIST", label: "Receptionist" },
];

export const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map((option) => [option.value, option.label])
);

export const DOMAIN_OPTIONS = [
  { value: "PYTHON", label: "Python Full Stack" },
  { value: "FLUTTER", label: "Flutter Development" },
  { value: "MERN", label: "MERN Stack" },
  { value: "JAVA", label: "Java Full Stack" },
  { value: "UIUX", label: "UI/UX Design" },
  { value: "DIGITAL_MARKETING", label: "Digital Marketing" },
  { value: "DATA_ANALYTICS", label: "Data Analytics" },
  { value: "TESTING", label: "Software Testing" },
  { value: "DEVOPS", label: "DevOps" },
  { value: "OTHER", label: "Other" },
];

export const DOMAIN_LABELS = Object.fromEntries(
  DOMAIN_OPTIONS.map((option) => [option.value, option.label])
);

// The login name may come flat or on the linked user.
export const usernameOf = (staff) =>
  staff?.username ?? staff?.user?.username ?? "";

// ================= DATE =================

// "2026-09-23" → "23 Sep 2026".
export function formatJoiningDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

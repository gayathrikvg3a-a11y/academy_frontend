// ================= WEBSITE ENQUIRY HELPERS =================

// What an enquiry's status can be set to, in the order it moves through them:
// the same stages as the CRM's own enquiries (see EnquiryForm). Each has its
// badge's tone (see StatusBadge): purple for a new one, still to be picked
// up; amber while it's being followed up; green once it's gone well; red once
// it hasn't.
export const WEBSITE_ENQUIRY_STATUSES = [
  { value: "NEW", label: "New", tone: "default" },
  { value: "CONTACTED", label: "Contacted", tone: "warning" },
  { value: "FOLLOW_UP", label: "Follow Up", tone: "warning" },
  { value: "INTERESTED", label: "Interested", tone: "success" },
  { value: "NOT_INTERESTED", label: "Not Interested", tone: "destructive" },
  { value: "CONVERTED", label: "Converted", tone: "success" },
];

const statusOption = (status) =>
  WEBSITE_ENQUIRY_STATUSES.find((option) => option.value === status);

// The badge tone for an enquiry's status.
export const enquiryStatusTone = (status) => statusOption(status)?.tone;

// How an enquiry's status reads, such as "Follow Up"; one this list doesn't
// know shows as the API sent it.
export const enquiryStatusLabel = (status) => statusOption(status)?.label || status;

// `course_name` only comes with an enquiry that names a course; the website
// sends none when the visitor picks "Not sure yet".
export const enquiryCourse = (enquiry) =>
  enquiry.course_name || (enquiry.course ? `Course #${enquiry.course}` : "Not sure yet");

// What the enquiry is about: an internship, or the course (an enquiry from
// before the website asked counts as one about a course).
export const enquiryInterest = (enquiry) =>
  enquiry.enquiry_type === "INTERNSHIP" ? "Internship" : enquiryCourse(enquiry);

// Whoever is following the enquiry up, by name from `users` (the CRM's staff);
// empty when no one is yet.
export const enquiryResponsible = (enquiry, users) => {
  if (!enquiry.responsible_person) return "";

  const user = users.find((person) => person.id === enquiry.responsible_person);

  return enquiry.responsible_person_name || user?.full_name || `User #${enquiry.responsible_person}`;
};

import api from "./axios";

// Enquiries sent from the website's contact form. They're kept apart from the
// CRM's own enquiries (enquiries/), which carry follow-ups and call history.
const BASE_URL = "/enquiry-new/";

// =======================
// Get Website Enquiries
// =======================
// Paginated: { count, next, previous, results }, newest first.
export const getWebsiteEnquiries = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Website Enquiry
// =======================
// The same fields the website sends; `course` is an id or null.
export const createWebsiteEnquiry = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Website Enquiry
// =======================
// The follow-up on an enquiry: `feedback`, `recommended_by`, and
// `responsible_person` (a user's id, or null).
export const updateWebsiteEnquiry = (id, data) => {
    return api.put(`${BASE_URL}${id}/`, data);
};

// =======================
// Update Website Enquiry Status
// =======================
// Such as "CONTACTED" once someone has been in touch.
export const updateWebsiteEnquiryStatus = (id, status) => {
    return api.patch(`${BASE_URL}${id}/`, { status });
};

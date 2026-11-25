import api from "./axios";

const BASE_URL = "/case-studies/";

// =======================
// Get All Case Studies
// =======================
export const getCaseStudies = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Case Study
// =======================
export const createCaseStudy = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Case Study
// =======================
// A PATCH rather than a PUT: the image is only sent when a new one was
// picked, and leaving it out of a PATCH keeps the one already saved.
export const updateCaseStudy = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Case Study
// =======================
export const deleteCaseStudy = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

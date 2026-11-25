import api from "./axios";

const BASE_URL = "/testimonials/";

// =======================
// Get Testimonials
// =======================
export const getTestimonials = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Testimonial
// =======================
export const createTestimonial = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Testimonial
// =======================
export const updateTestimonial = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Testimonial
// =======================
export const deleteTestimonial = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

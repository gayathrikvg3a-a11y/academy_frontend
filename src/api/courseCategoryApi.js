import api from "./axios";

const BASE_URL = "/course-category/";

// =======================
// Get All Course Categories
// =======================
export const getCourseCategories = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Get One Course Category
// =======================
// Unlike the list, this carries the category's courses.
export const getCourseCategory = (id) => {
    return api.get(`${BASE_URL}${id}/`);
};

// =======================
// Create Course Category
// =======================
export const createCourseCategory = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Course Category
// =======================
export const updateCourseCategory = (id, data) => {
    return api.put(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Course Category
// =======================
export const deleteCourseCategory = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

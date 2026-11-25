import api from "./axios";

/**
 * Get all courses
 */
export const getCourses = (params = {}) => {
  return api.get("/courses/", { params });
};

/**
 * Get single course by ID
 */
export const getCourseById = (id) => {
  return api.get(`/courses/${id}/`);
};

/**
 * Create new course
 */
export const createCourse = (data) => {
  return api.post("/courses/", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Update existing course
 */
export const updateCourse = (id, data) => {
  return api.put(`/courses/${id}/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Delete course
 */
export const deleteCourse = (id) => {
  return api.delete(`/courses/${id}/`);
};

/**
 * Toggle Active/Inactive
 * (Optional - only use if your backend supports it)
 */
export const toggleCourseStatus = (id, isActive) => {
  return api.patch(`/courses/${id}/`, {
    is_active: isActive,
  });
};

// ================= FEE OPTIONS (DISCOUNTS) =================
//
// Discount tiers a counsellor can pick at enrollment — each one is an
// { option_name, fee } pair nested under the course it belongs to.

/**
 * List a course's discounts
 */
export const getCourseFeeOptions = (courseId) => {
  return api.get(`/courses/${courseId}/fee-options/`);
};

/**
 * Create a discount on a course
 */
export const createCourseFeeOption = (courseId, data) => {
  return api.post(`/courses/${courseId}/fee-options/`, data);
};

/**
 * Update one existing discount
 */
export const updateCourseFeeOption = (courseId, optionId, data) => {
  return api.put(
    `/courses/${courseId}/fee-options/${optionId}/`,
    data
  );
};

/**
 * Delete one discount
 */
export const deleteCourseFeeOption = (courseId, optionId) => {
  return api.delete(
    `/courses/${courseId}/fee-options/${optionId}/`
  );
};
import api from "./axios";

const BASE_URL = "/staffs/";

// =======================
// Get Staff
// =======================
export const getStaff = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Staff
// =======================
// Also creates their login, so it takes username, password and
// confirm_password alongside the staff details.
export const createStaff = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Staff
// =======================
// A PATCH, so the password can be left out to keep the current one.
export const updateStaff = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Staff
// =======================
export const deleteStaff = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

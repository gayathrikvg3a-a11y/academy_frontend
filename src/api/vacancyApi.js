import api from "./axios";

const BASE_URL = "/vacancies/";

// =======================
// Get All Vacancies
// =======================
export const getVacancies = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Vacancy
// =======================
export const createVacancy = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Vacancy
// =======================
// The form always submits every field, so this is a full replace rather
// than a PATCH.
export const updateVacancy = (id, data) => {
    return api.put(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Vacancy
// =======================
export const deleteVacancy = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

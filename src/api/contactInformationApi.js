import api from "./axios";

const BASE_URL = "/contact-information/";

// =======================
// Get Contact Information
// =======================
// A list, though it holds the one record the website's footer and contact
// page show.
export const getContactInformation = () => {
    return api.get(BASE_URL);
};

// =======================
// Create Contact Information
// =======================
// Only for the first save, while the list is still empty.
export const createContactInformation = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Contact Information
// =======================
export const updateContactInformation = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

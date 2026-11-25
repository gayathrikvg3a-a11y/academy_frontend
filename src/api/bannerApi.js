import api from "./axios";

const BASE_URL = "/banners/";

// =======================
// Get All Banners
// =======================
export const getBanners = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Banner
// =======================
export const createBanner = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Banner
// =======================
// A PATCH rather than a PUT: the image is only sent when a new one was
// picked, and leaving it out of a PATCH keeps the one already saved.
export const updateBanner = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Banner
// =======================
export const deleteBanner = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

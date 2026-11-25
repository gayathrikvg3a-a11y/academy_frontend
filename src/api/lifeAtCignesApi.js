import api from "./axios";

const BASE_URL = "/life-at-cignes/";

// =======================
// Get Life at Cignes Photos
// =======================
export const getLifeAtCignesPhotos = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Photo
// =======================
export const createLifeAtCignesPhoto = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Photo
// =======================
// A PATCH rather than a PUT: the image is only sent when a new one was
// picked, and leaving it out of a PATCH keeps the one already saved.
export const updateLifeAtCignesPhoto = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Photo
// =======================
export const deleteLifeAtCignesPhoto = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

// =======================
// Select Photos
// =======================
// The photos the website's Life at Cignes section shows, by id.
export const selectLifeAtCignesPhotos = (imageIds) => {
    return api.post("/life-at-cignes-select/", { image_ids: imageIds });
};

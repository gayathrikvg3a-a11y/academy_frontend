import api from "./axios";

const BASE_URL = "/announcements/";

// =======================
// Get Announcements
// =======================
export const getAnnouncements = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Announcement
// =======================
export const createAnnouncement = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Announcement
// =======================
export const updateAnnouncement = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Announcement
// =======================
export const deleteAnnouncement = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

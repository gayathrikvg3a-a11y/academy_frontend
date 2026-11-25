import api from "./axios";

const BASE_URL = "/blogs/";

// =======================
// Get All Blogs
// =======================
export const getBlogs = (params = {}) => {
    return api.get(BASE_URL, { params });
};

// =======================
// Create Blog
// =======================
export const createBlog = (data) => {
    return api.post(BASE_URL, data);
};

// =======================
// Update Blog
// =======================
// A PATCH rather than a PUT: the image is only sent when a new one was
// picked, and leaving it out of a PATCH keeps the one already saved.
export const updateBlog = (id, data) => {
    return api.patch(`${BASE_URL}${id}/`, data);
};

// =======================
// Delete Blog
// =======================
export const deleteBlog = (id) => {
    return api.delete(`${BASE_URL}${id}/`);
};

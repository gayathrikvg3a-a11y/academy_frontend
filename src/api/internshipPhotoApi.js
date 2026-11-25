import api from "./axios";

// The Academic and Industry Internship photos have the same endpoints, each
// under its own name: /academic-internships/, /academic-internships-select/
// and so on.
const internshipPhotoApi = (name) => {
    const BASE_URL = `/${name}/`;

    return {
        // =======================
        // Get Photos
        // =======================
        getPhotos: (params = {}) => {
            return api.get(BASE_URL, { params });
        },

        // =======================
        // Get Selected Photos
        // =======================
        // The ones the website's page shows, in its order.
        getSelectedPhotos: () => {
            return api.get(`/${name}-selected/`);
        },

        // =======================
        // Create Photo
        // =======================
        createPhoto: (data) => {
            return api.post(BASE_URL, data);
        },

        // =======================
        // Update Photo
        // =======================
        // A PATCH rather than a PUT: the image is only sent when a new one was
        // picked, and leaving it out of a PATCH keeps the one already saved.
        updatePhoto: (id, data) => {
            return api.patch(`${BASE_URL}${id}/`, data);
        },

        // =======================
        // Delete Photo
        // =======================
        deletePhoto: (id) => {
            return api.delete(`${BASE_URL}${id}/`);
        },

        // =======================
        // Select Photos
        // =======================
        // The photos the website's page shows, by id.
        selectPhotos: (internshipIds) => {
            return api.post(`/${name}-select/`, { internship_ids: internshipIds });
        },
    };
};

export const academicInternshipApi = internshipPhotoApi("academic-internships");

export const industryInternshipApi = internshipPhotoApi("industry-internships");

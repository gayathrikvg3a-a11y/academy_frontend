import axiosInstance from "./axios";

const BASE_URL = "/internship-students/";

// =======================
// Get All Internship Students
// =======================
export const getInternshipStudents = (params = {}) => {
    return axiosInstance.get(BASE_URL, { params });
};

// =======================
// Get Single Student
// =======================
export const getInternshipStudent = (id) => {
    return axiosInstance.get(`${BASE_URL}${id}/`);
};

// =======================
// Create Student
// =======================
export const createInternshipStudent = (data) => {
    return axiosInstance.post(BASE_URL, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// =======================
// Update Student
// =======================
export const updateInternshipStudent = (id, data) => {
    return axiosInstance.patch(`${BASE_URL}${id}/`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// =======================
// Delete Student
// =======================
export const deleteInternshipStudent = (id) => {
    return axiosInstance.delete(`${BASE_URL}${id}/`);
};
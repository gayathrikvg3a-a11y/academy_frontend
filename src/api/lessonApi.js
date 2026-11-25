import api from "./axios";

export const createLesson = (data) =>
    api.post("/lessons/", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const updateLesson = (id, data) =>
    api.put(`/lessons/${id}/`, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

export const deleteLesson = (id) =>
    api.delete(`/lessons/${id}/`);
import api from "./axios";

export const getModules = (courseId) =>
    api.get("/curriculum-modules/", {
        params: { course: courseId },
    });

export const createModule = (data) =>
    api.post("/curriculum-modules/", data);

export const updateModule = (id, data) =>
    api.put(`/curriculum-modules/${id}/`, data);

export const deleteModule = (id) =>
    api.delete(`/curriculum-modules/${id}/`);

export const getTopics = (moduleId) =>
    api.get("/curriculum-topics/", {
        params: { module: moduleId },
    });

export const createTopic = (data) =>
    api.post("/curriculum-topics/", data);

export const updateTopic = (id, data) =>
    api.put(`/curriculum-topics/${id}/`, data);

export const deleteTopic = (id) =>
    api.delete(`/curriculum-topics/${id}/`);

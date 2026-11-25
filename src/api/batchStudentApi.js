import axios from "./axios";

const BASE_URL = "/batch-students/";

export const getBatchStudents = (params = {}) =>
  axios.get(BASE_URL, { params });

export const getBatchStudent = (id) =>
  axios.get(`${BASE_URL}${id}/`);

export const createBatchStudent = (data) =>
  axios.post(BASE_URL, data);

export const updateBatchStudent = (id, data) =>
  axios.put(`${BASE_URL}${id}/`, data);

export const deleteBatchStudent = (id) =>
  axios.delete(`${BASE_URL}${id}/`);
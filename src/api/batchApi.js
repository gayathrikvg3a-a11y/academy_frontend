import axios from "./axios";

const BASE_URL = "/batches/";

export const getBatches = (params = {}) =>
  axios.get(BASE_URL, { params });

export const getBatch = (id) =>
  axios.get(`${BASE_URL}${id}/`);

export const createBatch = (data) =>
  axios.post(BASE_URL, data);

export const updateBatch = (id, data) =>
  axios.put(`${BASE_URL}${id}/`, data);

export const deleteBatch = (id) =>
  axios.delete(`${BASE_URL}${id}/`);
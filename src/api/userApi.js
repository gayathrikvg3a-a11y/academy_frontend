import api from "./axios";

// =======================
// Get Users
// =======================
// The CRM's staff, such as whoever is responsible for an enquiry.
export const getUsers = () => {
    return api.get("users/");
};

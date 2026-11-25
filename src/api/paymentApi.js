import api from "./axios";

/* ============================
   Get All Payments
============================ */

export const getPayments = async (params = {}) => {
    const response = await api.get("/payments/", {
        params,
    });
    return response.data;
};

/* ============================
   Get Single Payment
============================ */

export const getPayment = async (id) => {
    const response = await api.get(`/payments/${id}/`);
    return response.data;
};

/* ============================
   Create Payment
============================ */

export const createPayment = async (paymentData) => {
    const response = await api.post(
        "/payments/",
        paymentData
    );
    return response.data;
};

/* ============================
   Update Payment
============================ */

export const updatePayment = async (
    id,
    paymentData
) => {
    const response = await api.put(
        `/payments/${id}/`,
        paymentData
    );

    return response.data;
};

/* ============================
   Delete Payment
============================ */

export const deletePayment = async (id) => {
    const response = await api.delete(
        `/payments/${id}/`
    );

    return response.data;
};

/* ============================
   Payment Slip PDF
============================ */

export const getPaymentSlip = (id) => {
    return `${api.defaults.baseURL}/payments/${id}/payment-slip/`;
};
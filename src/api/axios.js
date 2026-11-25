import axios from "axios";

// export const API_BASE_URL = "https://cacrm.fleetnflow.com/api/";
export const API_BASE_URL = "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ================= REQUEST INTERCEPTOR =================

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================= REFRESH TOKEN CLIENT =================

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
});

// ================= RESPONSE INTERCEPTOR =================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // A 401 from the login request means a wrong password, not an expired
    // session, so it goes straight back to the login form to show.
    const isLoginRequest = originalRequest?.url?.includes("auth/login/");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (!refreshToken) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        // The login page: /admin/, not the site's home page.
        window.location.href = import.meta.env.BASE_URL;

        return Promise.reject(error);
      }

      try {
        const response = await refreshApi.post(
          "auth/refresh/",
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        localStorage.setItem(
          "access",
          newAccessToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Refresh token expired or invalid:",
          refreshError
        );

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");

        window.location.href = import.meta.env.BASE_URL;

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
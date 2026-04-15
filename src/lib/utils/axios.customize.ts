import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api",
  timeout: 10000,
});

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);
instance.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    const errorData = error?.response?.data;

    if (errorData) {
      return Promise.reject(errorData);
    }

    return Promise.reject({
      success: false,
      message: error.message || "Lỗi kết nối Server",
      errors: null,
    });
  },
);
export default instance;

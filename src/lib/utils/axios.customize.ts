import { KEY_STORAGE } from '@/consts/storage';
import axios from 'axios';
import type { IBackendRes } from '@/types/global';

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

const refreshInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

let isRefreshing = false;
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(KEY_STORAGE.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response.data ?? response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(
        error?.response?.data ?? {
          success: false,
          message: error.message || 'Lỗi kết nối Server',
          errors: null,
        }
      );
    }

    // Nếu đang refresh → đưa request vào queue chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(instance(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await refreshInstance.post<
        unknown,
        { data: IBackendRes<{ accessToken: string }> }
      >('/refresh');
      const newToken = res.data.data.accessToken;

      localStorage.setItem(KEY_STORAGE.ACCESS_TOKEN, newToken);
      instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return instance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh thất bại → xóa token, redirect login
      localStorage.removeItem(KEY_STORAGE.ACCESS_TOKEN);
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;

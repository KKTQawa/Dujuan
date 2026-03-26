import axios from 'axios';
import { useUserStore } from '../store/userStore';

const serverUrl = 'https://jiuljiul.com/api';

const api = axios.create({
  baseURL: serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useUserStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const get = async (endpoint: string, params?: object) => {
  //console.log(`[API GET] ${endpoint}`, params);
  const response = await api.get(endpoint, { params });
  //console.log(`[API RESPONSE] ${endpoint}:`, response.data);
  return response.data;
};

export const post = async (endpoint: string, data: object) => {
  //console.log(`[API POST] ${endpoint}`, data);
  const response = await api.post(endpoint, data);
  //console.log(`[API RESPONSE] ${endpoint}:`, response.data);
  return response.data;
};

export const postFile = async (endpoint: string, formData: FormData) => {
  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
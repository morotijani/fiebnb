import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Assuming you are testing on an Android Emulator.
// If using physical device, change to your local IP address (e.g., 192.168.x.x)
const API_URL = 'http://10.0.2.2:3000/api'; 

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const refresh_token = await SecureStore.getItemAsync('refresh_token');
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token });

        await SecureStore.setItemAsync('access_token', data.access_token);
        await SecureStore.setItemAsync('refresh_token', data.refresh_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user');
        // Will be handled by Context to trigger re-render and navigate to Auth Stack
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

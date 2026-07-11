// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '${API_BASE}',  // change this to your PHP server URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('runit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
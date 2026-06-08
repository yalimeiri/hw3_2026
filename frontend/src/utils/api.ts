import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3001';
export const NOTES_URL = `${API_BASE_URL}/notes`;
export const POSTS_PER_PAGE = 10;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;

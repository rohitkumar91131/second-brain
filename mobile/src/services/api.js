import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '../constants/config'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token on every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then(r => r.data),

  register: (name, email, password) =>
    api.post('/api/auth/register', { name, email, password }).then(r => r.data),

  verifyQR: (token, deviceName, platform, deviceId) =>
    api.post('/api/device/verify', { token, deviceName, platform, deviceId }).then(r => r.data),

  verifyOTP: (email, otp, deviceName, platform, deviceId) =>
    api.post('/api/auth/device/otp/verify', { email, otp, deviceName, platform, deviceId }).then(r => r.data),

  initiateDeviceVerification: (data) =>
    api.post('/api/device/verify/initiate', data).then(r => r.data),

  checkDeviceVerificationStatus: (requestId) =>
    api.get(`/api/device/verify/${requestId}`).then(r => r.data),

  approveDeviceVerification: (requestId) =>
    api.post(`/api/device/verify/${requestId}/approve`).then(r => r.data),
}

// ─── Notes ────────────────────────────────────────────────────────────────

export const notesAPI = {
  list: (params = {}) => api.get('/api/notes', { params }).then(r => r.data),
  get: (id) => api.get(`/api/notes/${id}`).then(r => r.data),
  create: (data) => api.post('/api/notes', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/notes/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/notes/${id}`).then(r => r.data),
  getBlocks: (id) => api.get(`/api/notes/${id}/blocks`).then(r => r.data),
}

// ─── Tasks ────────────────────────────────────────────────────────────────

export const tasksAPI = {
  list: () => api.get('/api/tasks').then(r => r.data),
  get: (id) => api.get(`/api/tasks/${id}`).then(r => r.data),
  create: (data) => api.post('/api/tasks', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/tasks/${id}`).then(r => r.data),
}

// ─── Projects ─────────────────────────────────────────────────────────────

export const projectsAPI = {
  list: () => api.get('/api/projects').then(r => r.data),
  get: (id) => api.get(`/api/projects/${id}`).then(r => r.data),
  create: (data) => api.post('/api/projects', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/projects/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/projects/${id}`).then(r => r.data),
}

// ─── Goals ────────────────────────────────────────────────────────────────

export const goalsAPI = {
  list: () => api.get('/api/goals').then(r => r.data),
  get: (id) => api.get(`/api/goals/${id}`).then(r => r.data),
  create: (data) => api.post('/api/goals', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/goals/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/goals/${id}`).then(r => r.data),
}

// ─── Journal ──────────────────────────────────────────────────────────────

export const journalAPI = {
  list: () => api.get('/api/journal').then(r => r.data),
  get: (id) => api.get(`/api/journal/${id}`).then(r => r.data),
  create: (data) => api.post('/api/journal', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/journal/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/journal/${id}`).then(r => r.data),
  getBlocks: (id) => api.get(`/api/journal/${id}/blocks`).then(r => r.data),
}

// ─── Resources ────────────────────────────────────────────────────────────

export const resourcesAPI = {
  list: () => api.get('/api/resources').then(r => r.data),
  get: (id) => api.get(`/api/resources/${id}`).then(r => r.data),
  create: (data) => api.post('/api/resources', data).then(r => r.data),
  update: (id, data) => api.patch(`/api/resources/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/api/resources/${id}`).then(r => r.data),
}

// ─── Media ────────────────────────────────────────────────────────────────

export const mediaAPI = {
  list: () => api.get('/api/blocks/media').then(r => r.data),
}

// ─── User ─────────────────────────────────────────────────────────────────

export const userAPI = {
  profile: () => api.get('/api/user/profile').then(r => r.data),
  updateProfile: (data) => api.patch('/api/user/profile', data).then(r => r.data),
}

// ─── Devices ──────────────────────────────────────────────────────────────

export const devicesAPI = {
  list: () => api.get('/api/device').then(r => r.data),
  get: (id) => api.get(`/api/device/${id}`).then(r => r.data),
  delete: (id) => api.delete(`/api/device/${id}`).then(r => r.data),
}

export default api

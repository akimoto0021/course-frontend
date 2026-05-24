import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

// ใส่ access token ทุก request อัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ถ้า token หมดอายุ → refresh อัตโนมัติ
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ===== AUTH =====
export const authApi = {
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  logout: () => { const r = localStorage.getItem('refreshToken'); localStorage.clear(); return api.post('/auth/logout', { refreshToken: r }) },
  me: () => api.get('/auth/me'),
}

// ===== COURSES =====
export const coursesApi = {
  list:       (ref) => api.get('/courses', { params: { ref } }),
  get:        (id)  => api.get(`/courses/${id}`),
  create:     (data)    => api.post('/courses', data),
  update:     (id, data) => api.patch(`/courses/${id}`, data),
  addLesson:  (id, data) => api.post(`/courses/${id}/lessons`, data),
  myProgress: (id) => api.get(`/courses/${id}/my-progress`),
}

// ===== ORDERS =====
export const ordersApi = {
  create:     (data)       => api.post('/orders', data),
  uploadSlip: (id, file)   => {
    const form = new FormData()
    form.append('slip', file)
    return api.post(`/orders/${id}/slip`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  myOrders: () => api.get('/orders/my'),
}

// ===== VIDEOS =====
export const videosApi = {
  streamToken: (lessonId) => api.get(`/videos/${lessonId}/stream-token`),
  upload: (lessonId, file, onProgress) => {
    const form = new FormData()
    form.append('video', file)
    form.append('lesson_id', lessonId)
    return api.post('/videos/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
  },
   uploadTeaser: (courseId, file, onProgress) => {
    const form = new FormData()
    form.append('video', file)
    form.append('course_id', courseId)
    return api.post('/videos/upload-teaser', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
  },
}

// ===== ADMIN =====
export const adminApi = {
  users:          (params) => api.get('/admin/users', { params }),
  updateRole:     (id, data) => api.patch(`/admin/users/${id}/role`, data),
  orders:         (params) => api.get('/admin/orders', { params }),
  approveOrder:   (id) => api.patch(`/admin/orders/${id}/approve`),
  rejectOrder:    (id, reason) => api.patch(`/admin/orders/${id}/reject`, { reason }),
  sales:          (period) => api.get('/admin/sales', { params: { period } }),
}

// ===== AFFILIATE =====
export const affiliateApi = {
  stats: () => api.get('/affiliate/stats'),
}

export default api

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// ใส่ token อัตโนมัติทุก request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto refresh token เมื่อ 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refreshToken')
        if (!refresh) throw new Error('No refresh token')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh })
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

export default api

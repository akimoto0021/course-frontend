import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return set({ loading: false })
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, loading: false })
    } catch {
      localStorage.clear()
      set({ user: null, loading: false })
    }
  },

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    set({ user })
  },

  logout: async () => {
    try {
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) await api.post('/auth/logout', { refreshToken: refresh })
    } catch {}
    localStorage.clear()
    set({ user: null })
    window.location.href = '/'
  },

  isAdmin:     () => get().user?.role === 'admin',
  isAffiliate: () => ['admin','affiliate'].includes(get().user?.role),
  isLoggedIn:  () => !!get().user,
}))

export default useAuthStore

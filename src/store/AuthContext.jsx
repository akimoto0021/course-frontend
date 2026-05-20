import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // โหลด user จาก token ตอนเปิดแอป
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  // รับ token จาก OAuth callback (?access=...&refresh=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const access  = params.get('access')
    const refresh = params.get('refresh')
    if (access && refresh) {
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
      window.history.replaceState({}, '', window.location.pathname)
      authApi.me().then(({ data }) => setUser(data.user)).finally(() => setLoading(false))
    }
  }, [])

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
  }

  const logout = async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }

  const isAdmin     = user?.role === 'admin'
  const isAffiliate = user?.role === 'affiliate' || isAdmin
  const isLoggedIn  = !!user

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isAffiliate, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

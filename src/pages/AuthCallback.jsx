import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  useEffect(() => {
    // AuthContext จัดการ token จาก URL params แล้ว
    const timer = setTimeout(() => navigate(user ? '/' : '/login'), 1500)
    return () => clearTimeout(timer)
  }, [user])

  return (
    <div style={{ minHeight:'calc(100vh - 60px)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16 }}>
      <div className="spinner" style={{ width:36,height:36,borderWidth:3 }} />
      <p style={{ color:'var(--text2)' }}>กำลังเข้าสู่ระบบ...</p>
    </div>
  )
}

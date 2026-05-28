import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const [tab,     setTab]     = useState('login')   // login | register
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [pass2,   setPass2]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user }       = useAuth()
  const navigate              = useNavigate()
  const [params]              = useSearchParams()
  const next    = params.get('next') || '/'
  const isAdmin = params.get('admin') === '1'  // ซ่อน — URL พิเศษ

  if (user) { navigate(next, { replace: true }); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (tab === 'register') {
        if (pass !== pass2) { setError('รหัสผ่านไม่ตรงกัน'); setLoading(false); return }
        const { data } = await api.post('/auth/register', { name, email, password: pass })
        login(data.accessToken, data.refreshToken, data.user)
        navigate(next, { replace: true })
      } else {
        // login — admin หรือ member
        const endpoint = isAdmin ? '/auth/admin/login' : '/auth/member/login'
        const { data } = await api.post(endpoint, { email, password: pass })
        login(data.accessToken, data.refreshToken, data.user)
        navigate(isAdmin ? '/admin' : next, { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 60px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'var(--bg)' }}>
      <div className="card" style={{ width:'100%',maxWidth:400,padding:32 }}>

        {/* LOGO */}
        <div style={{ textAlign:'center',marginBottom:24 }}>
          <img src="/logo-black.png" alt="PakSup" style={{ width:52,height:52,borderRadius:12,marginBottom:12,objectFit:'contain',display:'block',margin:'0 auto 12px' }} />
          <h1 style={{ fontSize:22,fontWeight:700,marginBottom:4 }}>
            {isAdmin ? '🔒 Admin Login' : tab === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </h1>
          <p style={{ color:'var(--text2)',fontSize:14 }}>
            {tab === 'register' ? 'สร้างบัญชีเพื่อเริ่มเรียน' : 'เข้าถึงคอร์สที่คุณซื้อแล้ว'}
          </p>
        </div>

        {/* OAuth — ซ่อนถ้าเป็น admin mode หรือ tab register */}
        {!isAdmin && tab === 'login' && (
          <>
            <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:16 }}>
              <a href={`${import.meta.env.VITE_API_URL}/auth/google`}>
                <button className="btn btn-ghost btn-full" style={{ justifyContent:'center',gap:10 }}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={18} height={18} alt="" />
                  เข้าสู่ระบบด้วย Google
                </button>
              </a>
              <a href={`${import.meta.env.VITE_API_URL}/auth/facebook`} style={{ display:'none' }}>
                <button className="btn btn-ghost btn-full" style={{ justifyContent:'center',gap:10 }}>
                  <span style={{ color:'#1877f2',fontSize:18,fontWeight:700 }}>f</span>
                  เข้าสู่ระบบด้วย Facebook
                </button>
              </a>
              <a href={`${import.meta.env.VITE_API_URL}/auth/line`} style={{ display:'none' }}>
                <button className="btn btn-ghost btn-full" style={{ justifyContent:'center',gap:10 }}>
                  <span style={{ color:'#06c755',fontSize:16,fontWeight:700 }}>LINE</span>
                  เข้าสู่ระบบด้วย LINE
                </button>
              </a>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:10,margin:'4px 0 16px',color:'var(--text3)',fontSize:12 }}>
              <div style={{ flex:1,height:1,background:'var(--border)' }} />
              หรือใช้อีเมล
              <div style={{ flex:1,height:1,background:'var(--border)' }} />
            </div>
          </>
        )}

        {/* EMAIL FORM */}
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          {tab === 'register' && (
            <div className="field">
              <label>ชื่อ-นามสกุล</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อของคุณ" required />
            </div>
          )}
          <div className="field">
            <label>อีเมล</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="field">
            <label>รหัสผ่าน</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder={tab === 'register' ? 'อย่างน้อย 8 ตัวอักษร' : '••••••••'} required />
          </div>
          {tab === 'register' && (
            <div className="field">
              <label>ยืนยันรหัสผ่าน</label>
              <input type="password" value={pass2} onChange={e => setPass2(e.target.value)} placeholder="••••••••" required />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width:16,height:16 }} /> กำลังดำเนินการ...</>
              : tab === 'register' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* SWITCH TAB — เฉพาะ member mode */}
        {!isAdmin && (
          <p style={{ textAlign:'center',fontSize:13,color:'var(--text2)',marginTop:16 }}>
            {tab === 'login'
              ? <>ยังไม่มีบัญชี? <button onClick={() => { setTab('register'); setError('') }} style={{ background:'none',border:'none',color:'var(--brand)',fontWeight:600,cursor:'pointer' }}>สมัครสมาชิก</button></>
              : <>มีบัญชีอยู่แล้ว? <button onClick={() => { setTab('login'); setError('') }} style={{ background:'none',border:'none',color:'var(--brand)',fontWeight:600,cursor:'pointer' }}>เข้าสู่ระบบ</button></>
            }
          </p>
        )}

      </div>
    </div>
  )
}

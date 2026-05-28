import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin, isAffiliate } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link'

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setOpen(false)
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ display:'flex',alignItems:'center',gap:8 }}>
  <img src="/logo-white.png" alt="Paksup" style={{ height:32, width:'auto' }} />
  <span>Paksup</span>
</Link>

      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>หน้าแรก</Link>

        {user && <Link to="/my-courses" className={isActive('/my-courses')}>คอร์สของฉัน</Link>}
        {isAffiliate && !isAdmin && <Link to="/affiliate" className={isActive('/affiliate')}>Affiliate</Link>}
        {isAdmin && <Link to="/admin" className={isActive('/admin')}>หลังบ้าน</Link>}

        {!user ? (
          <Link to="/login">
            <button className="btn btn-gold btn-sm">เข้าสู่ระบบ</button>
          </Link>
        ) : (
          <div style={{ position:'relative' }}>
            <button
              onClick={() => setOpen(!open)}
              style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.1)',border:'none',color:'#fff',padding:'6px 12px',borderRadius:8,cursor:'pointer' }}
            >
              {user.avatar_url
                ? <img src={user.avatar_url} style={{ width:24,height:24,borderRadius:'50%' }} alt="" />
                : <span style={{ width:24,height:24,borderRadius:'50%',background:'#c9a84c',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700 }}>{user.name?.[0]}</span>
              }
              <span style={{ fontSize:14 }}>{user.name?.split(' ')[0]}</span>
              <span style={{ fontSize:10,opacity:.7 }}>▾</span>
            </button>

            {open && (
              <div style={{ position:'absolute',right:0,top:'100%',marginTop:4,background:'#fff',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-md)',minWidth:160,zIndex:200 }}>
                <div style={{ padding:'10px 14px',borderBottom:'1px solid var(--border)',fontSize:13 }}>
                  <div style={{ fontWeight:600,color:'var(--text)' }}>{user.name}</div>
                  <div style={{ color:'var(--text3)',fontSize:11 }}>{user.email}</div>
                  <span className={`badge badge-${user.role === 'admin' ? 'info' : user.role === 'affiliate' ? 'gold' : 'gray'}`} style={{ marginTop:4 }}>{user.role}</span>
                </div>
                <button onClick={handleLogout} style={{ width:'100%',padding:'10px 14px',background:'none',border:'none',textAlign:'left',fontSize:13,color:'var(--danger)',cursor:'pointer' }}>
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'

const menuItems = [
  { to: '/admin',         label: '📊 ยอดขาย',     end: true },
  { to: '/admin/orders',  label: '🧾 คำสั่งซื้อ' },
  { to: '/admin/courses', label: '📚 จัดการคอร์ส' },
  { to: '/admin/users',   label: '👥 จัดการสมาชิก' },
  { to: '/admin/bundle-orders', label: '📦 Bundle Orders' },
]

export default function AdminLayout() {
  return (
    <div style={{ display:'grid',gridTemplateColumns:'220px 1fr',minHeight:'calc(100vh - 60px)' }}>
      {/* SIDEBAR */}
      <div style={{ background:'var(--brand)',padding:'20px 12px' }}>
        <div style={{ color:'var(--gold-light)',fontSize:13,fontWeight:700,padding:'4px 8px 16px',borderBottom:'1px solid rgba(255,255,255,.1)',marginBottom:12 }}>
          🔧 Admin Panel
        </div>
        {menuItems.map(m => (
          <NavLink key={m.to} to={m.to} end={m.end}
            style={({ isActive }) => ({
              display:'flex',alignItems:'center',gap:8,padding:'9px 10px',
              borderRadius:8,color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
              background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
              fontSize:14,marginBottom:2,transition:'all .12s',
            })}>
            {m.label}
          </NavLink>
        ))}
      </div>
      {/* CONTENT */}
      <div style={{ overflowY:'auto' }}>
        <Outlet />
      </div>
    </div>
  )
}

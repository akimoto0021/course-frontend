// MyCoursesPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../services/api'

export default function MyCoursesPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.myOrders().then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false))
  }, [])

  const enrolled = orders.filter(o => o.status === 'verified')
  const pending  = orders.filter(o => o.status === 'pending')

  return (
    <div className="container" style={{ padding:'32px 20px' }}>
      <h1 style={{ fontSize:22,fontWeight:700,marginBottom:24 }}>คอร์สของฉัน</h1>

      {loading ? <div style={{ textAlign:'center',padding:60 }}><div className="spinner" /></div> : (
        <>
          {pending.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom:20 }}>
              ⏳ มี {pending.length} คำสั่งซื้อรอตรวจสอบสลิป
            </div>
          )}
          {enrolled.length === 0 ? (
            <div style={{ textAlign:'center',padding:60,color:'var(--text2)' }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📚</div>
              <p>ยังไม่มีคอร์ส <Link to="/" style={{ color:'var(--brand)',fontWeight:600 }}>เลือกซื้อคอร์ส</Link></p>
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16 }}>
              {enrolled.map(o => (
                <div key={o.id} className="card" style={{ padding:16 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:'var(--gold)',textTransform:'uppercase',marginBottom:6 }}>คอร์ส</div>
                  <div style={{ fontSize:15,fontWeight:600,marginBottom:10 }}>{o.course_title}</div>
                  <Link to={`/player/${o.course_id}`}>
                    <button className="btn btn-primary btn-full btn-sm">▶ เรียนต่อ</button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

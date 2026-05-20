import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { adminApi } from '../../services/api'

export default function AdminDashboard() {
  const [period,  setPeriod]  = useState('day')
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminApi.sales(period).then(({ data }) => setData(data)).finally(() => setLoading(false))
  }, [period])

  const chartData = (data?.timeline || []).map(r => ({
    name: new Date(r.period).toLocaleDateString('th-TH', period === 'day' ? { day:'numeric',month:'short' } : { day:'numeric',month:'short' }),
    รายได้: Math.round(r.revenue || 0),
    คำสั่งซื้อ: r.orders,
  }))

  return (
    <div style={{ padding:24 }}>
      <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>ภาพรวมยอดขาย</h2>

      {/* STAT CARDS */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24 }}>
        {[
          ['รายได้รวม', `฿${Number(data?.summary?.total_revenue||0).toLocaleString()}`,''],
          ['คำสั่งซื้อ', data?.summary?.total_orders||0, 'รายการ'],
          ['ลูกค้าทั้งหมด', data?.summary?.total_customers||0,'คน'],
          ['รอตรวจสลิป', data?.pendingCount||0,'รายการ'],
        ].map(([l,v,u]) => (
          <div key={l} className="stat-card">
            <div className="s-label">{l}</div>
            <div className="s-value" style={{ fontSize:22 }}>{loading ? '...' : v}<span style={{ fontSize:12,fontWeight:400,marginLeft:4 }}>{u}</span></div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="card" style={{ padding:20,marginBottom:20 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <h3 style={{ fontSize:15,fontWeight:600 }}>ยอดขาย</h3>
          <div style={{ display:'flex',gap:4 }}>
            {[['day','รายวัน'],['week','รายสัปดาห์']].map(([k,l]) => (
              <button key={k} onClick={() => setPeriod(k)}
                style={{ padding:'5px 12px',borderRadius:20,border:'1px solid var(--border)',fontSize:12,cursor:'pointer',
                  background: period===k ? 'var(--brand)' : 'var(--surface)',
                  color: period===k ? '#fff' : 'var(--text2)' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {loading ? <div style={{ height:200,display:'flex',alignItems:'center',justifyContent:'center' }}><div className="spinner" /></div> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip formatter={v => `฿${v.toLocaleString()}`} />
              <Bar dataKey="รายได้" fill="#1a2744" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* BY COURSE */}
      <div className="card">
        <div style={{ padding:'14px 16px',borderBottom:'1px solid var(--border)',fontWeight:600 }}>ยอดขายแต่ละคอร์ส</div>
        <table className="data-table">
          <thead><tr><th>คอร์ส</th><th>ขายได้</th><th>รายได้</th></tr></thead>
          <tbody>
            {(data?.byCourse || []).map(c => (
              <tr key={c.title}>
                <td>{c.title}</td>
                <td>{c.sales} คน</td>
                <td style={{ fontWeight:600,color:'var(--brand)' }}>฿{Number(c.revenue).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && !data?.byCourse?.length && <tr><td colSpan={3} style={{ textAlign:'center',color:'var(--text3)',padding:24 }}>ยังไม่มียอดขาย</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

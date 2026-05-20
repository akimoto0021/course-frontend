import React, { useEffect, useState } from 'react'
import { affiliateApi } from '../services/api'

export default function AffiliatePage() {
  const [stats, setStats]   = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    affiliateApi.stats().then(({ data }) => setStats(data))
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(stats?.referral_link || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!stats) return <div style={{ textAlign:'center',padding:80 }}><div className="spinner" /></div>

  return (
    <div className="container" style={{ padding:'32px 20px' }}>
      <h1 style={{ fontSize:22,fontWeight:700,marginBottom:24 }}>Affiliate Dashboard</h1>

      {/* REFERRAL LINK */}
      <div className="card" style={{ padding:20,marginBottom:20,background:'linear-gradient(135deg,#1a2744,#243461)',color:'#fff' }}>
        <div style={{ fontSize:13,color:'rgba(255,255,255,.7)',marginBottom:8 }}>ลิงก์ Affiliate ของคุณ</div>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <div style={{ flex:1,background:'rgba(255,255,255,.1)',borderRadius:8,padding:'10px 14px',fontSize:13,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
            {stats.referral_link}
          </div>
          <button onClick={copyLink} className="btn btn-gold btn-sm">
            {copied ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
          </button>
        </div>
        <div style={{ fontSize:12,color:'rgba(255,255,255,.5)',marginTop:8 }}>
          ค่าคอมมิชชั่น: {Math.round((stats.commission_rate||0)*100)}% ต่อการขาย
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:24 }}>
        {[
          ['ยอดขายทั้งหมด',stats.summary?.total_sales||0,'ครั้ง'],
          ['ค่าคอมรวม',`฿${Number(stats.summary?.total_commission||0).toLocaleString()}`,''],
          ['รอรับเงิน',`฿${Number(stats.summary?.pending_commission||0).toLocaleString()}`,''],
          ['ได้รับแล้ว',`฿${Number(stats.summary?.paid_commission||0).toLocaleString()}`,''],
        ].map(([l,v,u]) => (
          <div key={l} className="stat-card">
            <div className="s-label">{l}</div>
            <div className="s-value" style={{ fontSize:20 }}>{v}<span style={{ fontSize:13,fontWeight:400,marginLeft:4 }}>{u}</span></div>
          </div>
        ))}
      </div>

      {/* RECENT SALES */}
      <div className="card">
        <div style={{ padding:'14px 16px',borderBottom:'1px solid var(--border)',fontWeight:600 }}>ประวัติการขาย</div>
        {stats.recent_sales?.length === 0 ? (
          <div style={{ padding:32,textAlign:'center',color:'var(--text3)' }}>ยังไม่มียอดขาย</div>
        ) : (
          <table className="data-table">
            <thead><tr><th>คอร์ส</th><th>ยอดซื้อ</th><th>ค่าคอม</th><th>วันที่</th></tr></thead>
            <tbody>
              {stats.recent_sales?.map(s => (
                <tr key={s.order_id}>
                  <td>{s.course_title}</td>
                  <td>฿{Number(s.order_amount).toLocaleString()}</td>
                  <td style={{ color:'var(--success)',fontWeight:600 }}>฿{Number(s.commission_amount).toLocaleString()}</td>
                  <td style={{ color:'var(--text2)',fontSize:12 }}>{new Date(s.created_at).toLocaleDateString('th-TH')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

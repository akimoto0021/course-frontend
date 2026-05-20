import React, { useEffect, useState } from 'react'
import { adminApi } from '../../services/api'

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('pending')
  const [working, setWorking] = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.orders({ status: filter }).then(({ data }) => setOrders(data.orders || [])).finally(() => setLoading(false))
  }
  useEffect(load, [filter])

  const approve = async (id) => {
    setWorking(id)
    await adminApi.approveOrder(id).catch(() => {})
    setWorking(null); load()
  }
  const reject = async (id) => {
    const reason = prompt('เหตุผลที่ปฏิเสธ:')
    if (reason === null) return
    setWorking(id)
    await adminApi.rejectOrder(id, reason).catch(() => {})
    setWorking(null); load()
  }

  return (
    <div style={{ padding:24 }}>
      <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>คำสั่งซื้อ</h2>

      <div style={{ display:'flex',gap:4,marginBottom:16 }}>
        {[['pending','รอตรวจสลิป'],['verified','ผ่านแล้ว'],['rejected','ปฏิเสธ']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding:'6px 14px',borderRadius:20,border:'1px solid var(--border)',fontSize:12,cursor:'pointer',
              background: filter===k ? 'var(--brand)' : 'var(--surface)',
              color: filter===k ? '#fff' : 'var(--text2)' }}>
            {l}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div style={{ padding:40,textAlign:'center' }}><div className="spinner" /></div> : (
          <table className="data-table">
            <thead>
              <tr><th>ลูกค้า</th><th>คอร์ส</th><th>ยอด</th><th>OCR</th><th>วันที่</th><th>การดำเนินการ</th></tr>
            </thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center',color:'var(--text3)',padding:32 }}>ไม่มีรายการ</td></tr>}
              {orders.map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight:600,fontSize:13 }}>{o.user_name}</div>
                    <div style={{ fontSize:11,color:'var(--text3)' }}>{o.user_email}</div>
                  </td>
                  <td style={{ fontSize:13 }}>{o.course_title}</td>
                  <td style={{ fontWeight:600 }}>฿{Number(o.amount).toLocaleString()}</td>
                  <td>
                    {o.ocr_amount ? (
                      <div>
                        <span className={`badge badge-${o.ocr_matched ? 'success' : 'danger'}`}>
                          ฿{Number(o.ocr_amount).toLocaleString()} {o.ocr_matched ? '✓' : '✗'}
                        </span>
                        {o.slip_url && <a href={o.slip_url} target="_blank" rel="noreferrer" style={{ fontSize:11,color:'var(--brand)',display:'block',marginTop:2 }}>ดูสลิป</a>}
                      </div>
                    ) : <span style={{ fontSize:12,color:'var(--text3)' }}>รอสลิป</span>}
                  </td>
                  <td style={{ fontSize:12,color:'var(--text2)' }}>{new Date(o.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    {o.status === 'pending' ? (
                      <div style={{ display:'flex',gap:4 }}>
                        <button className="btn btn-sm btn-primary" disabled={working===o.id} onClick={() => approve(o.id)}>
                          {working===o.id ? '...' : 'อนุมัติ'}
                        </button>
                        <button className="btn btn-sm btn-ghost" disabled={working===o.id} onClick={() => reject(o.id)}>
                          ปฏิเสธ
                        </button>
                      </div>
                    ) : (
                      <span className={`badge badge-${o.status === 'verified' ? 'success' : 'danger'}`}>
                        {o.status === 'verified' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

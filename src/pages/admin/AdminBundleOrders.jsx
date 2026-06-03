import React, { useEffect, useState } from 'react'
import { adminApi } from '../../services/api'

// ─── Approve Modal ───────────────────────────────────────────────
function ApproveModal({ order, onClose, onDone }) {
  const [downloadUrl, setDownloadUrl] = useState('')
  const [videoUrl,    setVideoUrl]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleApprove = async () => {
    if (!downloadUrl.trim()) { setError('กรุณาระบุ Download URL'); return }
    setLoading(true); setError('')
    try {
      await adminApi.approveBundleOrder(order.id, { download_url: downloadUrl, video_url: videoUrl })
      onDone()
    } catch (e) {
      setError(e.response?.data?.error || 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16,
        padding:32, width:'100%', maxWidth:480, boxShadow:'0 24px 80px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>อนุมัติ Bundle Order</h3>
        <p style={{ fontSize:13, color:'var(--text3)', marginBottom:24 }}>
          {order.name} — {BUNDLE_LABELS[order.bundle_type] || order.bundle_type} (฿{Number(order.amount).toLocaleString()})
        </p>

        {error && (
          <div style={{ background:'#fff0f0', color:'#c00', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:13 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>
            Download URL <span style={{ color:'#c00' }}>*</span>
          </label>
          <input
            value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            style={{
              width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)',
              fontSize:13, background:'var(--bg)', color:'var(--text)', outline:'none', boxSizing:'border-box'
            }}
          />
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>ลิงก์ดาวน์โหลดไฟล์ Prompt Bundle</div>
        </div>

        <div style={{ marginBottom:28 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6 }}>
            Video URL <span style={{ color:'var(--text3)', fontWeight:400 }}>(ถ้ามี)</span>
          </label>
          <input
            value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
            style={{
              width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid var(--border)',
              fontSize:13, background:'var(--bg)', color:'var(--text)', outline:'none', boxSizing:'border-box'
            }}
          />
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>ลิงก์วิดีโอสอนใช้งาน (optional)</div>
        </div>

        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} disabled={loading}
            style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontSize:13, cursor:'pointer' }}>
            ยกเลิก
          </button>
          <button onClick={handleApprove} disabled={loading}
            style={{ padding:'9px 20px', borderRadius:8, border:'none', background:'var(--brand)', color:'#fff', fontSize:13, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
            {loading ? 'กำลังอนุมัติ...' : 'ยืนยันอนุมัติ ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Slip Modal ───────────────────────────────────────────────────
function SlipModal({ url, onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }} onClick={onClose}>
      <div style={{ position:'relative', maxWidth:560, width:'100%' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position:'absolute', top:-16, right:-16, width:32, height:32,
          borderRadius:'50%', border:'none', background:'var(--brand)', color:'#fff',
          fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1
        }}>×</button>
        {url?.match(/\.pdf$/i)
          ? <iframe src={url} style={{ width:'100%', height:520, border:'none', borderRadius:12 }} title="slip" />
          : <img src={url} alt="slip" style={{ width:'100%', borderRadius:12, display:'block', maxHeight:'80vh', objectFit:'contain' }} />
        }
        <a href={url} target="_blank" rel="noreferrer"
          style={{ display:'block', textAlign:'center', marginTop:12, fontSize:12, color:'var(--text3)' }}>
          เปิดในแท็บใหม่ ↗
        </a>
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────
function DetailModal({ order, onClose }) {
  if (!order) return null
  const statusColor = { pending:'var(--text3)', pending_review:'#d97706', verified:'#16a34a', rejected:'#dc2626' }
  const statusLabel = { pending:'รอสลิป', pending_review:'รอตรวจสอบ', verified:'อนุมัติแล้ว', rejected:'ปฏิเสธ' }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16,
        padding:32, width:'100%', maxWidth:520, boxShadow:'0 24px 80px rgba(0,0,0,0.3)',
        maxHeight:'90vh', overflowY:'auto'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
          <div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>รายละเอียด Order</h3>
            <div style={{ fontSize:11, color:'var(--text3)', fontFamily:'monospace' }}>#{order.id}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'var(--text3)' }}>×</button>
        </div>

        {/* Status */}
        <div style={{ marginBottom:20, padding:'10px 14px', borderRadius:8, background:'var(--bg)', border:'1px solid var(--border)' }}>
          <span style={{ fontSize:12, color:'var(--text3)', marginRight:8 }}>สถานะ:</span>
          <span style={{ fontSize:13, fontWeight:700, color: statusColor[order.status] }}>
            {statusLabel[order.status] || order.status}
          </span>
          {order.rejected_reason && (
            <div style={{ fontSize:12, color:'#dc2626', marginTop:6 }}>เหตุผล: {order.rejected_reason}</div>
          )}
        </div>

        {/* ข้อมูลลูกค้า */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>ข้อมูลลูกค้า</div>
          {[
            ['ชื่อ', order.name],
            ['อีเมล', order.email],
            ['เบอร์โทร', order.phone],
          ].map(([l, v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ color:'var(--text3)' }}>{l}</span>
              <span style={{ fontWeight:500, color:'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* ข้อมูล Bundle */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>Bundle</div>
          {[
            ['ประเภท', BUNDLE_LABELS[order.bundle_type] || order.bundle_type],
            ['ยอด', `฿${Number(order.amount).toLocaleString()}`],
            ['วันที่สั่ง', new Date(order.created_at).toLocaleString('th-TH')],
            order.slip_uploaded_at ? ['แนบสลิปเมื่อ', new Date(order.slip_uploaded_at).toLocaleString('th-TH')] : null,
            order.verified_at ? ['อนุมัติเมื่อ', new Date(order.verified_at).toLocaleString('th-TH')] : null,
          ].filter(Boolean).map(([l, v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
              <span style={{ color:'var(--text3)' }}>{l}</span>
              <span style={{ fontWeight:500, color:'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* สลิป */}
        {order.slip_url && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>สลิปการโอนเงิน</div>
            <a href={order.slip_url} target="_blank" rel="noreferrer">
              {order.slip_url.match(/\.pdf$/i)
                ? <div style={{ padding:'12px 16px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, fontSize:13, color:'var(--brand)' }}>📄 ดูไฟล์ PDF ↗</div>
                : <img src={order.slip_url} alt="slip" style={{ width:'100%', borderRadius:8, maxHeight:240, objectFit:'cover', border:'1px solid var(--border)' }} />
              }
            </a>
          </div>
        )}

        {/* Download & Video URL */}
        {(order.download_url || order.video_url) && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>ลิงก์ที่ส่งให้ลูกค้า</div>
            {order.download_url && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>Download URL</div>
                <a href={order.download_url} target="_blank" rel="noreferrer"
                  style={{ fontSize:12, color:'var(--brand)', wordBreak:'break-all' }}>{order.download_url}</a>
              </div>
            )}
            {order.video_url && (
              <div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:3 }}>Video URL</div>
                <a href={order.video_url} target="_blank" rel="noreferrer"
                  style={{ fontSize:12, color:'var(--brand)', wordBreak:'break-all' }}>{order.video_url}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────
const BUNDLE_LABELS = {
  marketing:   'นักการตลาด',
  admin_chat:  'แอดมินตอบแชท',
  graphic:     'กราฟิก',
  accountant:  'นักบัญชี',
  full_bundle: 'Claude Skills Bundle (ครบ)',
}

const STATUS_TABS = [
  ['pending',        'รอสลิป'],
  ['pending_review', 'รอตรวจสอบ'],
  ['verified',       'อนุมัติแล้ว'],
  ['rejected',       'ปฏิเสธ'],
]

// ─── Main Page ────────────────────────────────────────────────────
export default function AdminBundleOrders() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('pending_review')
  const [working,      setWorking]      = useState(null)
  const [approveOrder, setApproveOrder] = useState(null)
  const [slipUrl,      setSlipUrl]      = useState(null)
  const [detailOrder,  setDetailOrder]  = useState(null)

  const load = () => {
    setLoading(true)
    adminApi.bundleOrders({ status: filter })
      .then(({ data }) => setOrders(data.orders || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [filter])

  const handleApproveDone = () => { setApproveOrder(null); load() }

  const handleReject = async (order) => {
    const reason = prompt('เหตุผลที่ปฏิเสธ:')
    if (reason === null) return
    setWorking(order.id)
    await adminApi.rejectBundleOrder(order.id, reason).catch(() => {})
    setWorking(null); load()
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Bundle Orders</h2>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
              fontSize: 12, cursor: 'pointer',
              background: filter === k ? 'var(--brand)' : 'var(--surface)',
              color:      filter === k ? '#fff'         : 'var(--text2)',
            }}>
            {l}
          </button>
        ))}
      </div>

      <div className="card">
        {loading
          ? <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" /></div>
          : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ลูกค้า</th>
                  <th>Bundle</th>
                  <th>ยอด</th>
                  <th>สลิป</th>
                  <th>วันที่</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 32 }}>ไม่มีรายการ</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id}>
                    <td onClick={() => setDetailOrder(o)} style={{ cursor:'pointer' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{o.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.phone}</div>
                    </td>
                    <td style={{ fontSize: 13, cursor:'pointer' }} onClick={() => setDetailOrder(o)}>
                      {BUNDLE_LABELS[o.bundle_type] || o.bundle_type}
                    </td>
                    <td style={{ fontWeight: 600, cursor:'pointer' }} onClick={() => setDetailOrder(o)}>
                      ฿{Number(o.amount).toLocaleString()}
                    </td>
                    <td>
                      {o.slip_url
                        ? (
                          <button onClick={() => setSlipUrl(o.slip_url)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 11, cursor: 'pointer', color: 'var(--brand)' }}>
                            🖼 ดูสลิป
                          </button>
                        )
                        : <span style={{ fontSize: 12, color: 'var(--text3)' }}>ยังไม่มี</span>
                      }
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text2)', cursor:'pointer' }} onClick={() => setDetailOrder(o)}>
                      {new Date(o.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td>
                      {['pending', 'pending_review'].includes(o.status) ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm btn-primary"
                            disabled={working === o.id}
                            onClick={() => setApproveOrder(o)}>
                            อนุมัติ
                          </button>
                          <button className="btn btn-sm btn-ghost"
                            disabled={working === o.id}
                            onClick={() => handleReject(o)}>
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : (
                        <span className={`badge badge-${o.status === 'verified' ? 'success' : o.status === 'rejected' ? 'danger' : 'warning'}`}>
                          {o.status === 'verified' ? 'อนุมัติแล้ว' : o.status === 'rejected' ? 'ปฏิเสธ' : 'รอสลิป'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {approveOrder && <ApproveModal order={approveOrder} onClose={() => setApproveOrder(null)} onDone={handleApproveDone} />}
      {slipUrl      && <SlipModal url={slipUrl} onClose={() => setSlipUrl(null)} />}
      {detailOrder  && <DetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
    </div>
  )
}

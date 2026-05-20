import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { coursesApi, ordersApi } from '../services/api'

export default function PaymentPage() {
  const { courseId } = useParams()
  const [params]     = useSearchParams()
  const ref          = params.get('ref')
  const navigate     = useNavigate()

  const [course,  setCourse]  = useState(null)
  const [order,   setOrder]   = useState(null)
  const [slip,    setSlip]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [status,  setStatus]  = useState('idle') // idle | uploading | success | pending_review | error
  const [ocrResult, setOcrResult] = useState(null)
  const [error,   setError]   = useState('')

  useEffect(() => {
    coursesApi.get(courseId).then(({ data }) => setCourse(data.course))
  }, [courseId])

  // สร้าง order ทันทีที่เข้าหน้า
  useEffect(() => {
    if (!course) return
    ordersApi.create({ course_id: courseId, affiliate_code: ref })
      .then(({ data }) => setOrder(data.order))
      .catch(err => {
        if (err.response?.status === 409) {
          // ซื้อแล้ว → ไปดูคอร์สเลย
          navigate(`/player/${courseId}`, { replace: true })
        }
      })
  }, [course])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSlip(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    if (!slip || !order) return
    setStatus('uploading'); setError('')
    try {
      const { data } = await ordersApi.uploadSlip(order.id, slip)
      setOcrResult(data.ocr)
      if (data.status === 'verified') {
        setStatus('success')
        setTimeout(() => navigate(`/player/${courseId}`), 2500)
      } else {
        setStatus('pending_review')
      }
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
  }

  if (!course) return <div style={{ textAlign:'center',padding:80 }}><div className="spinner" /></div>

  return (
    <div style={{ maxWidth:520,margin:'0 auto',padding:'32px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none',border:'none',color:'var(--text2)',fontSize:14,marginBottom:20,cursor:'pointer' }}>
        ← กลับ
      </button>
      <h1 style={{ fontSize:22,fontWeight:700,marginBottom:24 }}>ชำระเงิน</h1>

      {/* ORDER SUMMARY */}
      <div className="card" style={{ padding:20,marginBottom:16 }}>
        <h3 style={{ fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:14 }}>สรุปคำสั่งซื้อ</h3>
        <div style={{ display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:14 }}>
          <span>{course.title}</span>
          <span>฿{Number(course.price).toLocaleString()}</span>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',padding:'12px 0 0',fontSize:16,fontWeight:700 }}>
          <span>ยอดรวม</span>
          <span style={{ color:'var(--gold)' }}>฿{Number(course.price).toLocaleString()}</span>
        </div>
      </div>

      {/* BANK INFO */}
      <div className="card" style={{ padding:20,marginBottom:16 }}>
        <h3 style={{ fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:14 }}>ชำระผ่านโอนเงิน / PromptPay</h3>
        <div style={{ textAlign:'center',marginBottom:16 }}>
          <img
            src="/qr-payment.jpg"
            alt="QR PromptPay SCB"
            style={{ width:200,height:'auto',margin:'0 auto 10px',borderRadius:8,border:'2px solid #4e2a84',display:'block' }}
          />
          <div style={{ fontSize:12,color:'var(--text2)' }}>สแกน QR PromptPay หรือโอนตามข้อมูลด้านล่าง</div>
        </div>
        <div style={{ background:'var(--bg)',borderRadius:'var(--radius)',padding:14 }}>
          {[
            ['ธนาคาร','SCB ไทยพาณิชย์'],
            ['ชื่อบัญชี','อชิตพล คำเจริญ'],
            ['เลขบัญชี','842-229136-6'],
            ['จำนวน',`฿${Number(course.price).toLocaleString()}`],
          ].map(([l,v]) => (
            <div key={l} style={{ display:'flex',justifyContent:'space-between',fontSize:13,padding:'7px 0',borderBottom:'1px solid var(--border)' }}>
              <span style={{ color:'var(--text2)' }}>{l}</span>
              <span style={{ fontWeight:600,color: l==='จำนวน' ? '#c9a84c' : 'var(--text)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop:10,background:'#e6f1fb',borderRadius:'var(--radius)',padding:'8px 12px',fontSize:12,color:'#185fa5' }}>
          💡 โอนเงินแล้วแนบสลิปด้านล่าง ระบบจะตรวจสอบอัตโนมัติ
        </div>
      </div>

      {/* SLIP UPLOAD */}
      <div className="card" style={{ padding:20 }}>
        <h3 style={{ fontSize:14,fontWeight:600,color:'var(--text2)',marginBottom:14 }}>แนบสลิปโอนเงิน</h3>

        {status === 'success' && (
          <div className="alert alert-success">
            ✅ ตรวจสอบสำเร็จ! กำลังพาคุณเข้าดูคอร์ส...
          </div>
        )}
        {status === 'pending_review' && (
          <div className="alert alert-warning">
            ⏳ แนบสลิปเรียบร้อยแล้ว Admin จะตรวจสอบภายใน 1 ชั่วโมง
            {ocrResult && <div style={{ marginTop:6,fontSize:12 }}>OCR ตรวจพบยอด: ฿{ocrResult.amount?.toLocaleString() || '-'} (ความมั่นใจ {Math.round((ocrResult.confidence||0)*100)}%)</div>}
          </div>
        )}
        {status === 'error' && <div className="alert alert-danger">{error}</div>}

        {status === 'idle' || status === 'error' ? (
          <>
            <label style={{ display:'block',border:'2px dashed var(--border)',borderRadius:'var(--radius)',padding:24,textAlign:'center',cursor:'pointer',transition:'all .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <input type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={handleFileChange} />
              {preview
                ? <img src={preview} style={{ maxHeight:160,margin:'0 auto',borderRadius:6 }} alt="slip" />
                : <>
                    <div style={{ fontSize:32,marginBottom:8 }}>📎</div>
                    <div style={{ fontSize:14,fontWeight:500,marginBottom:4 }}>คลิกเพื่อเลือกไฟล์สลิป</div>
                    <div style={{ fontSize:12,color:'var(--text3)' }}>รองรับ JPG, PNG, PDF ขนาดไม่เกิน 10MB</div>
                  </>
              }
            </label>
            {slip && (
              <button className="btn btn-primary btn-full" style={{ marginTop:12 }} onClick={handleUpload}>
                ส่งสลิปตรวจสอบ
              </button>
            )}
          </>
        ) : status === 'uploading' ? (
          <div style={{ textAlign:'center',padding:32 }}>
            <div className="spinner" style={{ width:32,height:32,borderWidth:3,margin:'0 auto 12px' }} />
            <div style={{ fontSize:14,color:'var(--text2)' }}>กำลังตรวจสอบสลิปด้วย OCR...</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

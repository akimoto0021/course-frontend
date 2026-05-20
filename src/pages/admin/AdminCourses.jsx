import React, { useEffect, useState } from 'react'
import { coursesApi, videosApi } from '../../services/api'

const empty = { title:'', description:'', price:'', status:'draft', sort_order:0 }

export default function AdminCourses() {
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [form,     setForm]     = useState(empty)
  const [editing,  setEditing]  = useState(null) // course id
  const [saving,   setSaving]   = useState(false)
  const [lessonForm, setLF]     = useState({ title:'', courseId:null })
  const [videoFile, setVF]      = useState(null)
  const [uploadPct, setUploadPct] = useState(null)
  const [msg, setMsg]           = useState('')

  const load = () => {
    setLoading(true)
    coursesApi.list().then(({ data }) => setCourses(data.courses || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('')
    try {
      if (editing) await coursesApi.update(editing, form)
      else await coursesApi.create(form)
      setForm(empty); setEditing(null); setMsg('บันทึกสำเร็จ'); load()
    } catch { setMsg('เกิดข้อผิดพลาด') }
    finally { setSaving(false) }
  }

  const startEdit = (c) => {
    setEditing(c.id)
    setForm({ title:c.title, description:c.description||'', price:c.price, status:c.status, sort_order:c.sort_order })
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  const addLesson = async () => {
    if (!lessonForm.title || !lessonForm.courseId) return
    await coursesApi.addLesson(lessonForm.courseId, { title:lessonForm.title, sort_order:0 })
    setLF({ title:'', courseId:null }); load()
  }

  const uploadVideo = async (lessonId) => {
    if (!videoFile) return
    setUploadPct(0)
    await videosApi.upload(lessonId, videoFile, setUploadPct)
    setUploadPct(null); setVF(null); setMsg('อัพโหลดวิดีโอสำเร็จ')
  }

  return (
    <div style={{ padding:24 }}>
      <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>จัดการคอร์ส</h2>
      {msg && <div className={`alert alert-${msg.includes('ผิด') ? 'danger' : 'success'}`}>{msg}</div>}

      {/* FORM */}
      <div className="card" style={{ padding:20,marginBottom:20 }}>
        <h3 style={{ fontSize:15,fontWeight:600,marginBottom:16 }}>{editing ? 'แก้ไขคอร์ส' : 'เพิ่มคอร์สใหม่'}</h3>
        <form onSubmit={save}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            <div className="field" style={{ gridColumn:'1/-1' }}>
              <label>ชื่อคอร์ส *</label>
              <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required />
            </div>
            <div className="field" style={{ gridColumn:'1/-1' }}>
              <label>คำอธิบาย</label>
              <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="field">
              <label>ราคา (บาท) *</label>
              <input type="number" min={0} value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} required />
            </div>
            <div className="field">
              <label>สถานะ</label>
              <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                <option value="draft">แบบร่าง</option>
                <option value="published">เผยแพร่</option>
                <option value="hidden">ซ่อน</option>
              </select>
            </div>
          </div>
          <div style={{ display:'flex',gap:8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'เพิ่มคอร์ส'}</button>
            {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(empty) }}>ยกเลิก</button>}
          </div>
        </form>
      </div>

      {/* COURSE LIST */}
      <div className="card">
        <div style={{ padding:'14px 16px',borderBottom:'1px solid var(--border)',fontWeight:600 }}>คอร์สทั้งหมด</div>
        {loading ? <div style={{ padding:32,textAlign:'center' }}><div className="spinner" /></div> : (
          <div>
            {courses.map(c => (
              <div key={c.id} style={{ borderBottom:'1px solid var(--border)',padding:'14px 16px' }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
                  <div>
                    <span style={{ fontWeight:600,fontSize:14 }}>{c.title}</span>
                    <span className={`badge badge-${c.status==='published'?'success':'gray'}`} style={{ marginLeft:8 }}>{c.status}</span>
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    <span style={{ fontWeight:700,fontSize:15 }}>฿{Number(c.price).toLocaleString()}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(c)}>แก้ไข</button>
                  </div>
                </div>
                {/* ADD LESSON */}
                <div style={{ display:'flex',gap:6,marginBottom:8 }}>
                  <input placeholder="ชื่อบทเรียนใหม่..." value={lessonForm.courseId===c.id ? lessonForm.title : ''}
                    onChange={e => setLF({ title:e.target.value, courseId:c.id })}
                    style={{ flex:1,padding:'5px 10px',border:'1px solid var(--border)',borderRadius:6,fontSize:13 }} />
                  <button className="btn btn-sm btn-outline" onClick={addLesson} disabled={lessonForm.courseId!==c.id||!lessonForm.title}>+ เพิ่มบทเรียน</button>
                </div>
                {/* VIDEO UPLOAD */}
                {c.lessons?.length > 0 && (
                  <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                    <select style={{ flex:1,padding:'5px 10px',border:'1px solid var(--border)',borderRadius:6,fontSize:12 }} id={`ls-${c.id}`}>
                      {c.lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                    <input type="file" accept="video/*" onChange={e => setVF(e.target.files[0])} style={{ fontSize:12,flex:1 }} />
                    <button className="btn btn-sm btn-primary" onClick={() => uploadVideo(document.getElementById(`ls-${c.id}`).value)} disabled={!videoFile||uploadPct!==null}>
                      {uploadPct !== null ? `${uploadPct}%` : '⬆ อัพโหลด'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {courses.length === 0 && <div style={{ padding:32,textAlign:'center',color:'var(--text3)' }}>ยังไม่มีคอร์ส</div>}
          </div>
        )}
      </div>
    </div>
  )
}

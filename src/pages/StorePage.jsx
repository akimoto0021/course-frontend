import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { coursesApi } from '../services/api'
import { useAuth } from '../store/AuthContext'

const THUMBS = ['📊','💼','📱','🎯','📈','🚀','💡','🏆']

export default function StorePage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [params]  = useSearchParams()
  const ref       = params.get('ref')
  const { user }  = useAuth()
  const navigate  = useNavigate()

  useEffect(() => {
    coursesApi.list(ref)
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false))
  }, [ref])

  const handleBuy = (course) => {
    if (!user) return navigate(`/login?next=/payment/${course.id}${ref ? `?ref=${ref}` : ''}`)
    navigate(`/payment/${course.id}${ref ? `?ref=${ref}` : ''}`)
  }

  return (
    <div className="page-wrap">
      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#1a2744 0%,#243461 60%,#1a3a5c 100%)',color:'#fff',padding:'56px 20px',textAlign:'center' }}>
        <div style={{ display:'inline-block',background:'rgba(201,168,76,.2)',color:'#e8c97a',fontSize:12,padding:'4px 14px',borderRadius:20,border:'1px solid rgba(201,168,76,.4)',marginBottom:16 }}>
          🏆 แพลตฟอร์มคอร์สธุรกิจและการตลาดชั้นนำ
        </div>
        <h1 style={{ fontSize:'clamp(22px,4vw,36px)',fontWeight:700,marginBottom:10,lineHeight:1.3 }}>
          ยกระดับธุรกิจและการตลาดของคุณ
        </h1>
        <p style={{ color:'rgba(255,255,255,.75)',fontSize:16,marginBottom:28,maxWidth:500,margin:'0 auto 28px' }}>
          คอร์สออนไลน์คุณภาพสูง สอนโดยผู้เชี่ยวชาญ เรียนได้ทุกที่ทุกเวลา
        </p>
        <div style={{ display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap' }}>
          <a href="#courses"><button className="btn btn-gold btn-lg">ดูคอร์สทั้งหมด ↓</button></a>
          {!user && <button className="btn btn-outline" style={{ color:'#fff',borderColor:'rgba(255,255,255,.5)' }} onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>}
        </div>
        {ref && (
          <div style={{ marginTop:16,background:'rgba(201,168,76,.15)',border:'1px solid rgba(201,168,76,.4)',borderRadius:8,padding:'8px 16px',display:'inline-block',fontSize:13,color:'#e8c97a' }}>
            🎁 คุณมาจากลิงก์พิเศษ — มีสิทธิ์รับโปรโมชั่น
          </div>
        )}
      </div>

      {/* COURSES */}
      <div id="courses" style={{ padding:'40px 0' }}>
        <div className="container">
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
            <h2 style={{ fontSize:22,fontWeight:700 }}>คอร์สทั้งหมด</h2>
            <span style={{ fontSize:13,color:'var(--text2)' }}>{courses.length} คอร์ส</span>
          </div>

          {loading ? (
            <div style={{ textAlign:'center',padding:60 }}><div className="spinner" /></div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign:'center',padding:60,color:'var(--text3)' }}>ยังไม่มีคอร์ส</div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:20 }}>
              {courses.map((c, i) => (
                <CourseCard key={c.id} course={c} thumb={THUMBS[i % THUMBS.length]} onBuy={() => handleBuy(c)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, thumb, onBuy }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="card" style={{ overflow:'hidden',transition:'transform .18s,box-shadow .18s',cursor:'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
    >
      <div style={{ height:110,background:'#e6f1fb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36 }}>
        {course.thumbnail_url ? <img src={course.thumbnail_url} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt="" /> : thumb}
      </div>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontSize:11,color:'var(--gold)',fontWeight:700,textTransform:'uppercase',letterSpacing:.5,marginBottom:4 }}>การตลาด</div>
        <div style={{ fontSize:14,fontWeight:600,marginBottom:6,lineHeight:1.4,minHeight:40 }}>{course.title}</div>
        <div style={{ fontSize:12,color:'var(--text2)',marginBottom:10 }}>
          {course.lesson_count || 0} บทเรียน · {course.student_count || 0} ผู้เรียน
        </div>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10 }}>
          <span style={{ fontSize:18,fontWeight:700,color:'var(--brand)' }}>฿{Number(course.price).toLocaleString()}</span>
        </div>
        <button className="btn btn-primary btn-full btn-sm" onClick={onBuy}>
          ซื้อคอร์สนี้
        </button>
      </div>
    </div>
  )
}

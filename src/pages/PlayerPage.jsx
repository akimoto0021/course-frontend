import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Hls from 'hls.js'
import { coursesApi, videosApi, ordersApi } from '../services/api'
import api from '../services/api'
import { useAuth } from '../store/AuthContext'

export default function PlayerPage() {
  const { courseId }    = useParams()
  const { user }        = useAuth()
  const videoRef        = useRef(null)
  const [course,    setCourse]    = useState(null)
  const [activeLesson, setActive] = useState(null)
  const [streamUrl, setStream]    = useState(null)
  const [otherCourses, setOthers] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    coursesApi.get(courseId).then(({ data }) => {
      setCourse(data.course)
      const first = data.course.lessons?.[0]
      if (data.course.teaser_url) {
        loadTeaserStream(courseId)
      } else if (first && first.video_key) {
        setActive(first)
        loadStream(first.id)
      }
      setLoading(false)
    })
    // โหลดคอร์สอื่นๆ แนะนำ
    coursesApi.list().then(({ data }) => {
      setOthers((data.courses || []).filter(c => c.id !== courseId).slice(0, 4))
    })
  }, [courseId])

  const loadStream = async (lessonId) => {
    try {
      const { data } = await videosApi.streamToken(lessonId)
      setStream(data.streamUrl)
    } catch { setStream(null) }
  }

    const loadTeaserStream = async (courseId) => {
    try {
      const { data } = await api.get(`/videos/teaser/${courseId}`)
      setStream(data.streamUrl)
    } catch { setStream(null) }
  }

  // เมื่อ streamUrl เปลี่ยน → โหลด HLS
  useEffect(() => {
    if (!streamUrl || !videoRef.current) return
    const video = videoRef.current

    // ถ้าเป็น MP4 ให้เล่นตรงๆ ไม่ต้องใช้ HLS
    if (streamUrl.includes('.mp4') || streamUrl.includes('/raw/')) {
      video.src = streamUrl
      video.play().catch(() => {})
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false })
      hls.loadSource(streamUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl
      video.play().catch(() => {})
    }
  }, [streamUrl])

  const selectLesson = (lesson) => {
    setActive(lesson)
    loadStream(lesson.id)
  }

  if (loading) return <div style={{ textAlign:'center',padding:80 }}><div className="spinner" /></div>
  if (!course)  return <div style={{ textAlign:'center',padding:80,color:'var(--text2)' }}>ไม่พบคอร์ส</div>

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 300px',minHeight:'calc(100vh - 60px)',maxWidth:1200,margin:'0 auto' }}>
      {/* MAIN */}
      <div style={{ borderRight:'1px solid var(--border)' }}>
        {/* VIDEO */}
        <div style={{ background:'#0a0f1e',aspectRatio:'16/9',position:'relative',overflow:'hidden' }}>
          {streamUrl ? (
            <video ref={videoRef} style={{ width:'100%',height:'100%',objectFit:'contain' }}
  controlsList="nodownload nofullscreen noremoteplayback"
  onContextMenu={e => e.preventDefault()}
  controls
  autoPlay
  muted
/>
          ) : (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'rgba(255,255,255,.4)',fontSize:14 }}>
              เลือกบทเรียนเพื่อเริ่มดู
            </div>
          )}
          {/* WATERMARK */}
          <div style={{ position:'absolute',bottom:8,right:10,fontSize:11,color:'rgba(255,255,255,.2)',pointerEvents:'none',userSelect:'none' }}>
            {user?.email} · ©CoursePro
          </div>
        </div>

        {/* LESSON INFO */}
        <div style={{ padding:'16px 20px' }}>
          <h2 style={{ fontSize:18,fontWeight:700,marginBottom:4 }}>{activeLesson?.title || course.title}</h2>
          <p style={{ fontSize:13,color:'var(--text2)',marginBottom:16 }}>{course.title} · {course.lessons?.length || 0} บทเรียน</p>

          <h3 style={{ fontSize:15,fontWeight:600,marginBottom:10 }}>รายการบทเรียน</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
            {(course.lessons || []).map((l, i) => (
              <button key={l.id} onClick={() => selectLesson(l)}
                style={{ display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:'var(--radius)',border:'none',background:activeLesson?.id===l.id ? '#e6f1fb' : 'transparent',cursor:'pointer',textAlign:'left',transition:'background .12s',color:activeLesson?.id===l.id ? 'var(--brand)' : 'var(--text)' }}>
                <span style={{ fontSize:16 }}>{activeLesson?.id===l.id ? '▶️' : '⬜'}</span>
                <span style={{ fontSize:13,flex:1 }}>บทที่ {i+1}: {l.title}</span>
                {l.duration_sec > 0 && <span style={{ fontSize:11,color:'var(--text3)' }}>{Math.floor(l.duration_sec/60)}:{String(l.duration_sec%60).padStart(2,'0')}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SIDEBAR — แนะนำคอร์สอื่น */}
      <div style={{ padding:16,overflowY:'auto',maxHeight:'calc(100vh - 60px)',position:'sticky',top:60 }}>
        <h3 style={{ fontSize:13,fontWeight:600,color:'var(--text2)',textTransform:'uppercase',letterSpacing:.5,marginBottom:12 }}>
          คอร์สที่น่าสนใจ
        </h3>
        {otherCourses.map(c => (
          <Link key={c.id} to={`/payment/${c.id}`}>
            <div className="card" style={{ padding:10,marginBottom:10,transition:'all .12s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <div style={{ height:60,background:'#faeeda',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:8 }}>📈</div>
              <div style={{ fontSize:12,fontWeight:600,lineHeight:1.3,marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:13,color:'var(--gold)',fontWeight:700 }}>฿{Number(c.price).toLocaleString()}</div>
            </div>
          </Link>
        ))}
        {otherCourses.length === 0 && <p style={{ fontSize:13,color:'var(--text3)' }}>ไม่มีคอร์สเพิ่มเติม</p>}
      </div>
    </div>
  )
}

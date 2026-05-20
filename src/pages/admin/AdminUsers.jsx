import React, { useEffect, useState } from 'react'
import { adminApi } from '../../services/api'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [saving,  setSaving]  = useState(null)
  const [edits,   setEdits]   = useState({}) // { [id]: { role, commission_rate } }

  const load = () => {
    setLoading(true)
    adminApi.users({ search }).then(({ data }) => setUsers(data.users || [])).finally(() => setLoading(false))
  }
  useEffect(load, [search])

  const setEdit = (id, field, val) => setEdits(p => ({ ...p, [id]: { ...(p[id]||{}), [field]: val } }))

  const saveRole = async (user) => {
    const edit = edits[user.id]
    if (!edit) return
    setSaving(user.id)
    await adminApi.updateRole(user.id, {
      role: edit.role || user.role,
      commission_rate: edit.commission_rate ?? user.commission_rate,
    }).catch(() => {})
    setSaving(null)
    setEdits(p => { const n = {...p}; delete n[user.id]; return n })
    load()
  }

  return (
    <div style={{ padding:24 }}>
      <h2 style={{ fontSize:20,fontWeight:700,marginBottom:20 }}>จัดการสมาชิก</h2>

      <div style={{ marginBottom:16 }}>
        <input placeholder="🔍 ค้นหาชื่อหรืออีเมล..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'8px 14px',border:'1.5px solid var(--border)',borderRadius:'var(--radius)',fontSize:14,width:280 }} />
      </div>

      <div className="card">
        {loading ? <div style={{ padding:40,textAlign:'center' }}><div className="spinner" /></div> : (
          <table className="data-table">
            <thead>
              <tr><th>สมาชิก</th><th>Login ผ่าน</th><th>Role ปัจจุบัน</th><th>เปลี่ยน Role</th><th>คอมมิชชั่น%</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => {
                const edit = edits[u.id] || {}
                const currentRole = edit.role || u.role
                const isDirty = !!edits[u.id]
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        {u.avatar_url
                          ? <img src={u.avatar_url} style={{ width:28,height:28,borderRadius:'50%' }} alt="" />
                          : <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--brand)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700 }}>{u.name?.[0]}</div>
                        }
                        <div>
                          <div style={{ fontWeight:600,fontSize:13 }}>{u.name}</div>
                          <div style={{ fontSize:11,color:'var(--text3)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {(u.providers || []).map(p => (
                        <span key={p} className="badge badge-gray" style={{ marginRight:3,fontSize:10 }}>{p}</span>
                      ))}
                      {(!u.providers || u.providers.length === 0) && <span className="badge badge-gray" style={{ fontSize:10 }}>password</span>}
                    </td>
                    <td>
                      <span className={`badge badge-${u.role==='admin'?'info':u.role==='affiliate'?'gold':'gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === 'admin' ? (
                        <span style={{ fontSize:12,color:'var(--text3)' }}>เปลี่ยนไม่ได้</span>
                      ) : (
                        <select value={currentRole} onChange={e => setEdit(u.id,'role',e.target.value)}
                          style={{ fontSize:12,border:'1px solid var(--border)',borderRadius:6,padding:'3px 6px',background:'var(--surface)' }}>
                          <option value="member">member</option>
                          <option value="affiliate">affiliate</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {currentRole === 'affiliate' ? (
                        <input type="number" min={0} max={100} step={1}
                          value={Math.round((edit.commission_rate ?? u.commission_rate ?? 0.20) * 100)}
                          onChange={e => setEdit(u.id,'commission_rate', e.target.value/100)}
                          style={{ width:60,fontSize:12,border:'1px solid var(--border)',borderRadius:6,padding:'3px 6px' }} />
                      ) : '-'}
                    </td>
                    <td>
                      {isDirty && u.role !== 'admin' && (
                        <button className="btn btn-sm btn-primary" disabled={saving===u.id} onClick={() => saveRole(u)}>
                          {saving===u.id ? '...' : 'บันทึก'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!loading && users.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center',color:'var(--text3)',padding:32 }}>ไม่พบสมาชิก</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

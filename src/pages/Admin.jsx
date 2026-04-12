import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Lock } from 'lucide-react'
import { JOBS as INITIAL_JOBS } from '../data'

const ADMIN_PASS = 'saudicareers2025'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [passError, setPassError] = useState(false)
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const empty = { company:'', icon:'🏢', title:'', location:'', type:'دوام كامل', salary:'', tags:[], badge:'', badgeText:'', posted:'اليوم', category:'tech', description:'' }
  const [form, setForm] = useState(empty)

  const login = () => {
    if (pass === ADMIN_PASS) { setAuthed(true); setPassError(false) }
    else setPassError(true)
  }

  const openNew = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (job) => { setForm({ ...job, tags:[...job.tags] }); setEditing(job.id); setShowForm(true) }

  const save = () => {
    if (!form.title || !form.company) return
    if (editing) {
      setJobs(j => j.map(x => x.id === editing ? { ...form, id:editing } : x))
    } else {
      setJobs(j => [...j, { ...form, id: Date.now() }])
    }
    setShowForm(false)
  }

  const del = (id) => { if (confirm('حذف هذه الوظيفة؟')) setJobs(j => j.filter(x => x.id !== id)) }

  const inputStyle = {
    width:'100%', padding:'11px 14px',
    border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)',
    fontSize:14, fontFamily:'var(--font-ar)', color:'var(--gray800)',
    background:'var(--gray50)', outline:'none', textAlign:'right', direction:'rtl',
    marginBottom:12,
  }

  if (!authed) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--g50)', paddingTop:68 }}>
      <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-xl)', padding:40, width:'100%', maxWidth:400, boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
        <Lock size={40} color="var(--g900)" style={{ margin:'0 auto 20px' }}/>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--g950)', marginBottom:8 }}>لوحة التحكم</div>
        <div style={{ fontSize:14, color:'var(--gray400)', marginBottom:28 }}>أدخل كلمة المرور للمتابعة</div>
        <input type="password" placeholder="كلمة المرور" value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          style={{ ...inputStyle, marginBottom:8, border: passError ? '1.5px solid #E24B4A' : '1.5px solid var(--gray200)' }}/>
        {passError && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12 }}>كلمة المرور غير صحيحة</div>}
        <button onClick={login} style={{ width:'100%', padding:13, background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:600 }}>
          دخول
        </button>
        <p style={{ fontSize:12, color:'var(--gray400)', marginTop:14 }}>للتجربة: saudicareers2025</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray50)', paddingTop:88 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 clamp(1rem,4vw,2rem) 80px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:700, color:'var(--g950)', marginBottom:4 }}>لوحة التحكم</h1>
            <p style={{ fontSize:14, color:'var(--gray400)' }}>{jobs.length} وظيفة مسجّلة</p>
          </div>
          <button onClick={openNew} style={{
            display:'flex', alignItems:'center', gap:8,
            background:'var(--g900)', color:'var(--white)',
            border:'none', padding:'11px 22px', borderRadius:'var(--r-md)',
            fontSize:14, fontWeight:600,
          }}>
            <Plus size={16}/> إضافة وظيفة جديدة
          </button>
        </div>

        {/* Table */}
        <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto auto auto', gap:0, borderBottom:'1.5px solid var(--gray200)', padding:'12px 20px', background:'var(--gray50)' }}>
            {['المسمى الوظيفي','الشركة','الموقع','النوع','التصنيف',''].map(h => (
              <div key={h} style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>
            ))}
          </div>
          {jobs.map((job, i) => (
            <div key={job.id} style={{
              display:'grid', gridTemplateColumns:'1fr 1fr auto auto auto auto',
              gap:16, padding:'14px 20px', alignItems:'center',
              borderBottom: i < jobs.length-1 ? '1px solid var(--gray100)' : 'none',
              transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
            onMouseLeave={e => e.currentTarget.style.background='var(--white)'}>
              <div style={{ fontWeight:600, color:'var(--g950)', fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
                <span>{job.icon}</span>{job.title}
              </div>
              <div style={{ fontSize:13, color:'var(--gray600)' }}>{job.company}</div>
              <div style={{ fontSize:13, color:'var(--gray600)' }}>{job.location}</div>
              <div style={{ fontSize:12, color:'var(--gray400)' }}>{job.type}</div>
              <div style={{ fontSize:12, background:'var(--g50)', color:'var(--g700)', padding:'3px 10px', borderRadius:50 }}>{job.category}</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => openEdit(job)} style={{ width:32, height:32, borderRadius:'var(--r-sm)', background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g700)' }}>
                  <Pencil size={14}/>
                </button>
                <button onClick={() => del(job.id)} style={{ width:32, height:32, borderRadius:'var(--r-sm)', background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#B91C1C' }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div onClick={e => e.target===e.currentTarget && setShowForm(false)} style={{
          position:'fixed', inset:0, zIndex:500,
          background:'rgba(0,26,13,0.7)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'1rem',
        }}>
          <div style={{ background:'var(--white)', borderRadius:'var(--r-xl)', width:'100%', maxWidth:560, padding:32, boxShadow:'var(--shadow-lg)', maxHeight:'90vh', overflowY:'auto', position:'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position:'absolute', top:16, left:16, width:32, height:32, borderRadius:'50%', background:'var(--gray100)', border:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={16}/>
            </button>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--g950)', marginBottom:24 }}>
              {editing ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}
            </div>

            {[
              { key:'title', placeholder:'المسمى الوظيفي' },
              { key:'company', placeholder:'اسم الشركة' },
              { key:'icon', placeholder:'أيقونة (emoji)' },
              { key:'location', placeholder:'الموقع (مثال: الرياض)' },
              { key:'salary', placeholder:'الراتب (مثال: ١٥٬٠٠٠ – ٢٢٬٠٠٠)' },
              { key:'posted', placeholder:'تاريخ النشر (مثال: اليوم)' },
            ].map(({ key, placeholder }) => (
              <input key={key} placeholder={placeholder} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
                onBlur={e => { e.target.style.borderColor='var(--gray200)'; e.target.style.background='var(--gray50)' }}
              />
            ))}

            <select value={form.type} onChange={e => setForm(p => ({ ...p, type:e.target.value }))} style={{ ...inputStyle }}>
              {['دوام كامل','دوام جزئي','هجين','عن بعد'].map(o => <option key={o}>{o}</option>)}
            </select>

            <select value={form.category} onChange={e => setForm(p => ({ ...p, category:e.target.value }))} style={{ ...inputStyle }}>
              {['tech','finance','energy','construction','hr'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge:e.target.value }))} style={{ ...inputStyle }}>
              <option value="">بدون شارة</option>
              <option value="new">جديدة (new)</option>
              <option value="hot">مطلوبة (hot)</option>
              <option value="featured">حصرية (featured)</option>
            </select>

            {form.badge && (
              <input placeholder="نص الشارة" value={form.badgeText}
                onChange={e => setForm(p => ({ ...p, badgeText:e.target.value }))}
                style={inputStyle}/>
            )}

            <input placeholder="الوسوم (مفصولة بفاصلة)" value={form.tags.join(',')}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean) }))}
              style={inputStyle}/>

            <textarea placeholder="وصف الوظيفة" value={form.description}
              onChange={e => setForm(p => ({ ...p, description:e.target.value }))}
              style={{ ...inputStyle, minHeight:100, resize:'vertical' }}/>

            <button onClick={save} style={{
              width:'100%', padding:13, background:'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              <Save size={16}/> {editing ? 'حفظ التعديلات' : 'إضافة الوظيفة'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

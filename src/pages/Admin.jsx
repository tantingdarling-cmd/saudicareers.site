import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Lock, LogOut, Loader, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { authApi, jobsApi, applicationsApi } from '../services/api'

const CATEGORIES = [
  { key:'tech', label:'تقنية' },
  { key:'finance', label:'مالية' },
  { key:'energy', label:'طاقة' },
  { key:'construction', label:'إنشاءات' },
  { key:'hr', label:'موارد بشرية' },
  { key:'marketing', label:'تسويق' },
  { key:'healthcare', label:'صحة' },
  { key:'education', label:'تعليم' },
  { key:'other', label:'أخرى' },
]

const JOB_TYPES = [
  { key:'full_time', label:'دوام كامل' },
  { key:'part_time', label:'دوام جزئي' },
  { key:'contract', label:'عقد' },
  { key:'internship', label:'تدريب' },
  { key:'remote', label:'عن بعد' },
]

const inputStyle = {
  width:'100%', padding:'11px 14px',
  border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)',
  fontSize:14, fontFamily:'var(--font-ar)', color:'var(--gray800)',
  background:'var(--gray50)', outline:'none', textAlign:'right', direction:'rtl',
  marginBottom:12,
}

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(authApi.getUser())
  const [jobs, setJobs] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [activeTab, setActiveTab] = useState('jobs')
  const [applications, setApplications] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)

  const empty = {
    title:'', title_en:'', company:'', location:'',
    salary_min:'', salary_max:'', description:'',
    requirements:'', category:'tech', job_type:'full_time',
    experience_level:'mid', is_featured:false, is_active:true,
  }
  const [form, setForm] = useState(empty)

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      fetchJobs()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authApi.isAuthenticated() && activeTab === 'applications') {
      fetchApplications()
    }
  }, [activeTab])

  const fetchApplications = async () => {
    setLoadingApps(true)
    try {
      const res = await applicationsApi.getAll({ per_page: 100 })
      setApplications(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingApps(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.getAll({ per_page: 100 })
      setJobs(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    if (!email || !password) {
      setAuthError('الرجاء إدخال البريد وكلمة المرور')
      return
    }
    try {
      const data = await authApi.login(email, password)
      setUser(data.user)
      fetchJobs()
    } catch (err) {
      setAuthError(err.message || 'فشل تسجيل الدخول')
    }
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setJobs([])
  }

  const openNew = () => { setForm(empty); setEditing(null); setShowForm(true) }
  const openEdit = (job) => {
    setForm({
      title: job.title || '',
      title_en: job.title_en || '',
      company: job.company || '',
      location: job.location || '',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      description: job.description || '',
      requirements: job.requirements || '',
      category: job.category || 'tech',
      job_type: job.job_type || 'full_time',
      experience_level: job.experience_level || 'mid',
      is_featured: job.is_featured || false,
      is_active: job.is_active !== false,
    })
    setEditing(job.id)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !form.company || !form.location) return
    setSaving(true)
    try {
      const data = {
        ...form,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      }
      if (editing) {
        await jobsApi.update(editing, data)
      } else {
        await jobsApi.create(data)
      }
      setShowForm(false)
      fetchJobs()
    } catch (err) {
      alert(err.message || 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) return
    setDeleting(id)
    try {
      await jobsApi.delete(id)
      setJobs(j => j.filter(x => x.id !== id))
    } catch (err) {
      alert(err.message || 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  const updateAppStatus = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, status)
      fetchApplications()
    } catch (err) {
      alert(err.message || 'فشل تحديث الحالة')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending:   { bg: '#FEF3C7', color: '#92400E', icon: <Clock size={12}/> },
      reviewed:  { bg: '#DBEAFE', color: '#1E40AF', icon: <FileText size={12}/> },
      interview: { bg: '#EDE9FE', color: '#5B21B6', icon: <FileText size={12}/> },
      accepted:  { bg: '#D1FAE5', color: '#065F46', icon: <CheckCircle size={12}/> },
      rejected:  { bg: '#FEE2E2', color: '#991B1B', icon: <XCircle size={12}/> },
    }
    const s = styles[status] || styles.pending
    const labels = { pending: 'قيد المراجعة', reviewed: 'تمت المراجعة', interview: 'مقابلة', accepted: 'مقبول', rejected: 'مرفوض' }
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:50, fontSize:11, fontWeight:600, background:s.bg, color:s.color }}>
        {s.icon} {labels[status] || status}
      </span>
    )
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader size={40} className="animate-spin" color="var(--g600)"/>
    </div>
  )

  if (!user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--g50)', paddingTop:68 }}>
      <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-xl)', padding:40, width:'100%', maxWidth:400, boxShadow:'var(--shadow-lg)', textAlign:'center' }}>
        <Lock size={40} color="var(--g900)" style={{ margin:'0 auto 20px' }}/>
        <div style={{ fontSize:22, fontWeight:700, color:'var(--g950)', marginBottom:8 }}>لوحة التحكم</div>
        <div style={{ fontSize:14, color:'var(--gray400)', marginBottom:28 }}>سجل دخولك للمتابعة</div>
        
        <input type="email" placeholder="البريد الإلكتروني" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          style={{ ...inputStyle, marginBottom:8 }}/>
        
        <input type="password" placeholder="كلمة المرور" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key==='Enter' && login()}
          style={{ ...inputStyle, marginBottom:8, border: authError ? '1.5px solid #E24B4A' : '1.5px solid var(--gray200)' }}/>
        
        {authError && <div style={{ color:'#E24B4A', fontSize:13, marginBottom:12 }}>{authError}</div>}
        
        <button onClick={login} style={{ width:'100%', padding:13, background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:600 }}>
          دخول
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--gray50)', paddingTop:88 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 clamp(1rem,4vw,2rem) 80px' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:700, color:'var(--g950)', marginBottom:4 }}>لوحة التحكم</h1>
            <p style={{ fontSize:14, color:'var(--gray400)' }}>{activeTab === 'jobs' ? jobs.length + ' وظائف' : applications.length + ' تقديم'}</p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={logout} style={{
              display:'flex', alignItems:'center', gap:8,
              background:'var(--gray100)', color:'var(--gray600)',
              border:'1px solid var(--gray200)', padding:'11px 18px', borderRadius:'var(--r-md)',
              fontSize:14, fontWeight:500,
            }}>
              <LogOut size={16}/> تسجيل الخروج
            </button>
            {activeTab === 'jobs' && (
              <button onClick={openNew} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'var(--g900)', color:'var(--white)',
                border:'none', padding:'11px 22px', borderRadius:'var(--r-md)',
                fontSize:14, fontWeight:600,
              }}>
                <Plus size={16}/> إضافة وظيفة جديدة
              </button>
            )}
          </div>
        </div>

        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--gray100)', padding:4, borderRadius:'var(--r-md)', width:'fit-content' }}>
          <button onClick={() => setActiveTab('jobs')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'jobs' ? 'var(--white)' : 'transparent',
            color: activeTab === 'jobs' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'jobs' ? 'var(--shadow-sm)' : 'none',
          }}>الوظائف</button>
          <button onClick={() => setActiveTab('applications')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'applications' ? 'var(--white)' : 'transparent',
            color: activeTab === 'applications' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'applications' ? 'var(--shadow-sm)' : 'none',
          }}>التقديمات</button>
        </div>

        {activeTab === 'jobs' && (
          <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr auto', gap:0, borderBottom:'1.5px solid var(--gray200)', padding:'12px 20px', background:'var(--gray50)' }}>
              {['المسمى الوظيفي','الشركة','الموقع','النوع','التصنيف',''].map(h => (
                <div key={h} style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>
              ))}
            </div>
            
            {jobs.length === 0 ? (
              <div style={{ padding:40, textAlign:'center', color:'var(--gray400)' }}>
                لا توجد وظائف. أضف وظيفة جديدة للبدء.
              </div>
            ) : jobs.map((job, i) => (
              <div key={job.id} style={{
                display:'grid', gridTemplateColumns:'2fr 1.5fr 1fr 1fr 1fr auto',
                gap:16, padding:'14px 20px', alignItems:'center',
                borderBottom: i < jobs.length-1 ? '1px solid var(--gray100)' : 'none',
              }}>
                <div style={{ fontWeight:600, color:'var(--g950)', fontSize:14 }}>{job.title}</div>
                <div style={{ fontSize:13, color:'var(--gray600)' }}>{job.company}</div>
                <div style={{ fontSize:13, color:'var(--gray600)' }}>{job.location}</div>
                <div style={{ fontSize:12, color:'var(--gray400)' }}>
                  {JOB_TYPES.find(t => t.key === job.job_type)?.label || job.job_type}
                </div>
                <div style={{ fontSize:12, background:'var(--g50)', color:'var(--g700)', padding:'3px 10px', borderRadius:50, display:'inline-block', width:'fit-content' }}>
                  {CATEGORIES.find(c => c.key === job.category)?.label || job.category}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => openEdit(job)} style={{ width:32, height:32, borderRadius:'var(--r-sm)', background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g700)' }}>
                    <Pencil size={14}/>
                  </button>
                  <button onClick={() => del(job.id)} disabled={deleting === job.id} style={{ width:32, height:32, borderRadius:'var(--r-sm)', background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#B91C1C' }}>
                    {deleting === job.id ? <Loader size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'applications' && (
          loadingApps ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={32} className="animate-spin" color="var(--g600)"/>
            </div>
          ) : (
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1.5fr 2fr 1.5fr 1fr 1fr auto', gap:0, borderBottom:'1.5px solid var(--gray200)', padding:'12px 20px', background:'var(--gray50)' }}>
                {['الاسم','البريد','الوظيفة','الهاتف','الحالة',''].map(h => (
                  <div key={h} style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>
                ))}
              </div>
              
              {applications.length === 0 ? (
                <div style={{ padding:40, textAlign:'center', color:'var(--gray400)' }}>
                  لا توجد تقديمات حتى الآن.
                </div>
              ) : applications.map((app, i) => (
                <div key={app.id} style={{
                  display:'grid', gridTemplateColumns:'1.5fr 2fr 1.5fr 1fr 1fr auto',
                  gap:16, padding:'14px 20px', alignItems:'center',
                  borderBottom: i < applications.length-1 ? '1px solid var(--gray100)' : 'none',
                }}>
                  <div style={{ fontWeight:600, color:'var(--g950)', fontSize:14 }}>{app.name}</div>
                  <div style={{ fontSize:13, color:'var(--gray600)' }}>{app.email}</div>
                  <div style={{ fontSize:13, color:'var(--g700)', fontWeight:500 }}>{app.job?.title || '—'}</div>
                  <div style={{ fontSize:12, color:'var(--gray500)' }}>{app.phone || '—'}</div>
                  <div>{getStatusBadge(app.status)}</div>
                  <div style={{ display:'flex', gap:4 }}>
                    {(app.status === 'pending' || app.status === 'reviewed') && (
                      <>
                        <button onClick={() => updateAppStatus(app.id, 'interview')} title="مقابلة" style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'#EDE9FE', border:'1px solid #C4B5FD', display:'flex', alignItems:'center', justifyContent:'center', color:'#5B21B6', cursor:'pointer' }}>
                          <FileText size={13}/>
                        </button>
                        <button onClick={() => updateAppStatus(app.id, 'accepted')} title="قبول" style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--g600)', cursor:'pointer' }}>
                          <CheckCircle size={13}/>
                        </button>
                        <button onClick={() => updateAppStatus(app.id, 'rejected')} title="رفض" style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#B91C1C', cursor:'pointer' }}>
                          <XCircle size={13}/>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

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

            <input placeholder="المسمى الوظيفي *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title:e.target.value }))}
              style={inputStyle}/>

            <input placeholder="المسمى بالإنجليزية" value={form.title_en}
              onChange={e => setForm(p => ({ ...p, title_en:e.target.value }))}
              style={inputStyle}/>

            <input placeholder="اسم الشركة *" value={form.company}
              onChange={e => setForm(p => ({ ...p, company:e.target.value }))}
              style={inputStyle}/>

            <input placeholder="الموقع * (مثال: الرياض)" value={form.location}
              onChange={e => setForm(p => ({ ...p, location:e.target.value }))}
              style={inputStyle}/>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <input placeholder="الراتب الأدنى" type="number" value={form.salary_min}
                onChange={e => setForm(p => ({ ...p, salary_min:e.target.value }))}
                style={inputStyle}/>
              <input placeholder="الراتب الأعلى" type="number" value={form.salary_max}
                onChange={e => setForm(p => ({ ...p, salary_max:e.target.value }))}
                style={inputStyle}/>
            </div>

            <select value={form.job_type} onChange={e => setForm(p => ({ ...p, job_type:e.target.value }))} style={inputStyle}>
              {JOB_TYPES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>

            <select value={form.category} onChange={e => setForm(p => ({ ...p, category:e.target.value }))} style={inputStyle}>
              {CATEGORIES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>

            <select value={form.experience_level} onChange={e => setForm(p => ({ ...p, experience_level:e.target.value }))} style={inputStyle}>
              <option value="entry">مبتدئ</option>
              <option value="mid">متوسط</option>
              <option value="senior">مخضرم</option>
              <option value="lead">قائد</option>
              <option value="executive">تنفيذي</option>
            </select>

            <textarea placeholder="وصف الوظيفة" value={form.description}
              onChange={e => setForm(p => ({ ...p, description:e.target.value }))}
              style={{ ...inputStyle, minHeight:80, resize:'vertical' }}/>

            <textarea placeholder="المتطلبات" value={form.requirements}
              onChange={e => setForm(p => ({ ...p, requirements:e.target.value }))}
              style={{ ...inputStyle, minHeight:60, resize:'vertical' }}/>

            <div style={{ display:'flex', gap:16, marginBottom:12 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'var(--gray600)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured:e.target.checked }))}/>
                مميزة
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, color:'var(--gray600)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active:e.target.checked }))}/>
                نشطة
              </label>
            </div>

            <button onClick={save} disabled={saving} style={{
              width:'100%', padding:13, background:saving ? 'var(--gray400)' : 'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:600,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              {saving ? <Loader size={16} className="animate-spin"/> : <Save size={16}/>}
              {editing ? 'حفظ التعديلات' : 'إضافة الوظيفة'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

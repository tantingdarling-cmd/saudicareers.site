import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Lock, LogOut, Loader, FileText, Clock, CheckCircle, XCircle, Users, Download, Copy, Mail } from 'lucide-react'
import { authApi, jobsApi, applicationsApi, subscribersApi } from '../services/api'

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
  const [subscribers, setSubscribers] = useState([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [subsCopied, setSubsCopied] = useState(false)
  const [peek, setPeek]             = useState(null)   // { type:'job'|'app', item }

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
    if (!authApi.isAuthenticated()) return
    if (activeTab === 'applications') fetchApplications()
    if (activeTab === 'subscribers') fetchSubscribers()
  }, [activeTab])

  const fetchSubscribers = async () => {
    setLoadingSubs(true)
    try {
      const res = await subscribersApi.getAll()
      setSubscribers(res.data || res || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSubs(false)
    }
  }

  const exportCSV = () => {
    const header = 'الاسم,البريد الإلكتروني,المجال المهني,تاريخ التسجيل'
    const rows = subscribers.map(s =>
      `"${s.name || ''}","${s.email || ''}","${s.field || ''}","${s.created_at?.split('T')[0] || ''}"`
    )
    const csv = '\uFEFF' + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyAllEmails = () => {
    const emails = subscribers.map(s => s.email).filter(Boolean).join(', ')
    navigator.clipboard.writeText(emails).then(() => {
      setSubsCopied(true)
      setTimeout(() => setSubsCopied(false), 2000)
    })
  }

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

  const withdrawData = async (id) => {
    if (!confirm('سيُعلَّم هذا الطلب كـ "مسحوب" ولن تُعالَج بياناته. هل أنت متأكد؟ (PDPL)')) return
    try {
      await applicationsApi.updateStatus(id, 'withdrawn', 'طلب حذف البيانات - PDPL')
      fetchApplications()
      setPeek(null)
    } catch (err) { alert(err.message || 'فشل سحب البيانات') }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending:   { bg: '#FEF3C7', color: '#92400E', icon: <Clock size={12}/> },
      reviewed:  { bg: '#DBEAFE', color: '#1E40AF', icon: <FileText size={12}/> },
      interview: { bg: '#EDE9FE', color: '#5B21B6', icon: <FileText size={12}/> },
      accepted:  { bg: '#D1FAE5', color: '#065F46', icon: <CheckCircle size={12}/> },
      rejected:  { bg: '#FEE2E2', color: '#991B1B', icon: <XCircle size={12}/> },
      withdrawn: { bg: '#F3F4F6', color: '#6B7280', icon: <XCircle size={12}/> },
    }
    const s = styles[status] || styles.pending
    const labels = { pending: 'قيد المراجعة', reviewed: 'تمت المراجعة', interview: 'مقابلة', accepted: 'مقبول', rejected: 'مرفوض', withdrawn: 'مسحوب (PDPL)' }
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
            <p style={{ fontSize:14, color:'var(--gray400)' }}>
              {activeTab === 'jobs' ? `${jobs.length} وظيفة` : activeTab === 'applications' ? `${applications.length} تقديم` : `${subscribers.length} مشترك`}
            </p>
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
            {activeTab === 'subscribers' && subscribers.length > 0 && (
              <>
                <button onClick={copyAllEmails} style={{
                  display:'flex', alignItems:'center', gap:8,
                  background: subsCopied ? 'var(--g50)' : 'var(--gray100)',
                  color: subsCopied ? 'var(--g700)' : 'var(--gray600)',
                  border: subsCopied ? '1px solid var(--g200)' : '1px solid var(--gray200)',
                  padding:'11px 18px', borderRadius:'var(--r-md)', fontSize:14, fontWeight:500, cursor:'pointer',
                }}>
                  {subsCopied ? <><CheckCircle size={15}/> تم النسخ</> : <><Copy size={15}/> نسخ الإيميلات</>}
                </button>
                <button onClick={exportCSV} style={{
                  display:'flex', alignItems:'center', gap:8,
                  background:'var(--g900)', color:'var(--white)',
                  border:'none', padding:'11px 18px', borderRadius:'var(--r-md)',
                  fontSize:14, fontWeight:600, cursor:'pointer',
                }}>
                  <Download size={15}/> تصدير CSV
                </button>
              </>
            )}
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
          <button onClick={() => setActiveTab('subscribers')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'subscribers' ? 'var(--white)' : 'transparent',
            color: activeTab === 'subscribers' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'subscribers' ? 'var(--shadow-sm)' : 'none',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <Users size={14}/> المشتركون
            {subscribers.length > 0 && (
              <span style={{ background:'var(--g900)', color:'var(--white)', borderRadius:50, fontSize:10, fontWeight:700, padding:'2px 7px', minWidth:18, textAlign:'center' }}>
                {subscribers.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'jobs' && (
          jobs.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', color:'var(--gray400)', background:'var(--white)', borderRadius:'var(--r-lg)', border:'1.5px solid var(--gray200)' }}>
              لا توجد وظائف. أضف وظيفة جديدة للبدء.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
              {jobs.map(job => (
                <div key={job.id}
                  onClick={() => setPeek({ type:'job', item: job })}
                  style={{
                    background:'var(--white)', border:'1.5px solid var(--gray200)',
                    borderRadius:'var(--r-xl)', padding:'20px', cursor:'pointer',
                    transition:'all 0.18s', position:'relative',
                    boxShadow: peek?.item?.id === job.id ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    outline: peek?.item?.id === job.id ? '2px solid var(--g400)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow= peek?.item?.id === job.id ? 'var(--shadow-md)' : 'var(--shadow-sm)'}
                >
                  {/* featured badge */}
                  {job.is_featured && (
                    <span style={{ position:'absolute', top:14, left:14, fontSize:10, fontWeight:700, background:'var(--gold100)', color:'var(--gold700)', border:'1px solid var(--gold300)', padding:'2px 8px', borderRadius:50 }}>
                      مميزة ⭐
                    </span>
                  )}

                  {/* active dot */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background: job.is_active ? 'var(--g500)' : 'var(--gray300)', display:'block' }}/>
                    <span style={{ fontSize:11, color: job.is_active ? 'var(--g600)' : 'var(--gray400)' }}>
                      {job.is_active ? 'نشطة' : 'غير نشطة'}
                    </span>
                  </div>

                  <div style={{ fontWeight:700, fontSize:15, color:'var(--g950)', marginBottom:4, lineHeight:1.3 }}>{job.title}</div>
                  <div style={{ fontSize:13, color:'var(--gray500)', marginBottom:14 }}>{job.company} · {job.location}</div>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                    <span style={{ fontSize:11, background:'var(--g50)', color:'var(--g700)', border:'1px solid var(--g100)', padding:'3px 10px', borderRadius:50 }}>
                      {CATEGORIES.find(c => c.key === job.category)?.label || job.category}
                    </span>
                    <span style={{ fontSize:11, background:'var(--gray100)', color:'var(--gray600)', padding:'3px 10px', borderRadius:50 }}>
                      {JOB_TYPES.find(t => t.key === job.job_type)?.label || job.job_type}
                    </span>
                    {(job.salary_min || job.salary_max) && (
                      <span style={{ fontSize:11, background:'var(--gold100)', color:'var(--gold700)', padding:'3px 10px', borderRadius:50 }}>
                        {job.salary_min && job.salary_max
                          ? `${Number(job.salary_min).toLocaleString('ar')} – ${Number(job.salary_max).toLocaleString('ar')} ر.س`
                          : job.salary_min ? `من ${Number(job.salary_min).toLocaleString('ar')} ر.س` : `حتى ${Number(job.salary_max).toLocaleString('ar')} ر.س`}
                      </span>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:8 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(job)} style={{ flex:1, padding:'8px', borderRadius:'var(--r-sm)', background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'var(--g700)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      <Pencil size={13}/> تعديل
                    </button>
                    <button onClick={() => del(job.id)} disabled={deleting === job.id} style={{ flex:1, padding:'8px', borderRadius:'var(--r-sm)', background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.15)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'#B91C1C', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                      {deleting === job.id ? <Loader size={13}/> : <Trash2 size={13}/>} حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'applications' && (
          loadingApps ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={32} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
          ) : applications.length === 0 ? (
            <div style={{ padding:60, textAlign:'center', color:'var(--gray400)', background:'var(--white)', borderRadius:'var(--r-lg)', border:'1.5px solid var(--gray200)' }}>
              لا توجد تقديمات حتى الآن.
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {applications.map(app => {
                const initials = (app.name || '؟').split(' ').map(w=>w[0]).join('').slice(0,2)
                const dateStr  = app.created_at
                  ? new Date(app.created_at).toLocaleDateString('ar-SA',{ year:'numeric', month:'short', day:'numeric' })
                  : null
                const isWithdrawn = app.status === 'withdrawn'
                return (
                  <div key={app.id}
                    onClick={() => !isWithdrawn && setPeek({ type:'app', item: app })}
                    style={{
                      background: isWithdrawn ? 'var(--gray50)' : 'var(--white)',
                      border:`1.5px solid ${peek?.item?.id===app.id ? 'var(--g400)' : 'var(--gray200)'}`,
                      borderRadius:'var(--r-xl)', padding:'18px',
                      cursor: isWithdrawn ? 'default' : 'pointer',
                      transition:'all 0.18s', opacity: isWithdrawn ? 0.6 : 1,
                      outline: peek?.item?.id===app.id ? '2px solid var(--g300)' : 'none',
                    }}
                    onMouseEnter={e => !isWithdrawn && (e.currentTarget.style.boxShadow='var(--shadow-md)')}
                    onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                  >
                    {/* Avatar + name */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--g100)', color:'var(--g800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                        {initials}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'var(--g950)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{app.name}</div>
                        <div style={{ fontSize:12, color:'var(--gray400)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{app.email}</div>
                      </div>
                    </div>

                    {/* Job title */}
                    <div style={{ fontSize:13, color:'var(--g700)', fontWeight:500, marginBottom:10,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      📌 {app.job?.title || '—'}
                    </div>

                    {/* Badges row */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      {getStatusBadge(app.status)}
                      {/* PDPL badge */}
                      {!isWithdrawn && (
                        <span style={{ fontSize:10, fontWeight:700, background:'var(--g50)', color:'var(--g600)', border:'1px solid var(--g200)', padding:'2px 8px', borderRadius:50 }}>
                          PDPL ✓
                        </span>
                      )}
                      {dateStr && (
                        <span style={{ fontSize:11, color:'var(--gray400)', marginRight:'auto' }}>{dateStr}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>

        {activeTab === 'subscribers' && (
          loadingSubs ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={32} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : (
            <>
              {/* Stats row */}
              {subscribers.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:20 }}>
                  {[
                    { label:'إجمالي المشتركين', value: subscribers.length, color:'var(--g900)' },
                    { label:'هذا الشهر', value: subscribers.filter(s => s.created_at?.startsWith(new Date().toISOString().slice(0,7))).length, color:'var(--g600)' },
                    { label:'مجالات مختلفة', value: [...new Set(subscribers.map(s=>s.field).filter(Boolean))].length, color:'var(--gold600)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
                      <div style={{ fontSize:28, fontWeight:800, color, marginBottom:4 }}>{value}</div>
                      <div style={{ fontSize:12, color:'var(--gray400)', fontWeight:500 }}>{label}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1.5fr 2fr 1.5fr 1fr', gap:0, borderBottom:'1.5px solid var(--gray200)', padding:'12px 20px', background:'var(--gray50)' }}>
                  {['الاسم','البريد الإلكتروني','المجال المهني','تاريخ التسجيل'].map(h => (
                    <div key={h} style={{ fontSize:12, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:0.8 }}>{h}</div>
                  ))}
                </div>

                {subscribers.length === 0 ? (
                  <div style={{ padding:60, textAlign:'center' }}>
                    <Mail size={40} color="var(--gray200)" style={{ margin:'0 auto 16px' }}/>
                    <div style={{ fontSize:16, fontWeight:600, color:'var(--gray400)', marginBottom:8 }}>لا يوجد مشتركون بعد</div>
                    <div style={{ fontSize:13, color:'var(--gray300)' }}>سيظهرون هنا عند تسجيلهم من الموقع</div>
                  </div>
                ) : subscribers.map((sub, i) => (
                  <div key={sub.id || i} style={{
                    display:'grid', gridTemplateColumns:'1.5fr 2fr 1.5fr 1fr',
                    gap:16, padding:'14px 20px', alignItems:'center',
                    borderBottom: i < subscribers.length-1 ? '1px solid var(--gray100)' : 'none',
                    transition:'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--gray50)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ fontWeight:600, color:'var(--g950)', fontSize:14 }}>{sub.name || '—'}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:13, color:'var(--gray600)' }}>{sub.email}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(sub.email)}
                        title="نسخ البريد"
                        style={{ background:'transparent', border:'none', padding:4, cursor:'pointer', color:'var(--gray300)', flexShrink:0 }}
                        onMouseEnter={e => e.currentTarget.style.color='var(--g600)'}
                        onMouseLeave={e => e.currentTarget.style.color='var(--gray300)'}
                      >
                        <Copy size={13}/>
                      </button>
                    </div>
                    <div>
                      {sub.field ? (
                        <span style={{ fontSize:12, background:'var(--g50)', color:'var(--g700)', border:'1px solid var(--g100)', padding:'3px 10px', borderRadius:50, fontWeight:500 }}>
                          {sub.field}
                        </span>
                      ) : <span style={{ fontSize:12, color:'var(--gray300)' }}>—</span>}
                    </div>
                    <div style={{ fontSize:12, color:'var(--gray400)' }}>
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' }) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}

      {/* ── Side-peek Backdrop ── */}
      {peek && (
        <div onClick={() => setPeek(null)} style={{
          position:'fixed', inset:0, zIndex:498,
          background:'rgba(0,26,13,0.25)',
        }}/>
      )}

      {/* ── Side-peek Panel ── */}
      {peek && (
        <div style={{
          position:'fixed', top:0, right:0, bottom:0,
          width:'clamp(300px,38vw,440px)',
          background:'var(--white)',
          borderLeft:'1.5px solid var(--gray200)',
          boxShadow:'-8px 0 32px rgba(0,26,13,0.12)',
          zIndex:499, overflowY:'auto',
          display:'flex', flexDirection:'column',
          animation:'slideInRight 0.22s ease',
        }}>
          <style>{`@keyframes slideInRight{from{transform:translateX(24px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

          {/* Header */}
          <div style={{ padding:'20px 22px 16px', borderBottom:'1px solid var(--gray100)', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, background:'var(--white)', zIndex:1 }}>
            <button onClick={() => setPeek(null)} style={{ width:30, height:30, borderRadius:'50%', background:'var(--gray100)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <X size={14}/>
            </button>
            <div style={{ fontSize:14, fontWeight:700, color:'var(--g950)' }}>
              {peek.type === 'job' ? 'تفاصيل الوظيفة' : 'ملف المتقدم'}
            </div>
          </div>

          <div style={{ padding:'22px', flex:1 }}>

            {/* ── Job Peek ── */}
            {peek.type === 'job' && (() => { const j = peek.item; return (
              <>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>{j.title}</div>
                {j.title_en && <div style={{ fontSize:13, color:'var(--gray400)', marginBottom:14, direction:'ltr' }}>{j.title_en}</div>}

                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
                  {[
                    { v: j.company, bg:'var(--g50)', c:'var(--g700)' },
                    { v: j.location, bg:'var(--gray100)', c:'var(--gray600)' },
                    { v: CATEGORIES.find(x=>x.key===j.category)?.label, bg:'var(--g50)', c:'var(--g700)' },
                    { v: JOB_TYPES.find(x=>x.key===j.job_type)?.label, bg:'var(--gray100)', c:'var(--gray600)' },
                  ].filter(x=>x.v).map((x,i) => (
                    <span key={i} style={{ fontSize:12, background:x.bg, color:x.c, padding:'4px 12px', borderRadius:50, border:'1px solid var(--gray200)' }}>{x.v}</span>
                  ))}
                  <span style={{ fontSize:12, background: j.is_active?'var(--g50)':'var(--gray100)', color: j.is_active?'var(--g600)':'var(--gray400)', padding:'4px 12px', borderRadius:50, border:'1px solid var(--gray200)' }}>
                    {j.is_active ? '🟢 نشطة' : '⚫ غير نشطة'}
                  </span>
                </div>

                {(j.salary_min || j.salary_max) && (
                  <div style={{ background:'var(--gold100)', border:'1px solid var(--gold300)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:16, fontSize:13, color:'var(--gold700)', fontWeight:600 }}>
                    💰 {j.salary_min&&j.salary_max ? `${Number(j.salary_min).toLocaleString('ar')} – ${Number(j.salary_max).toLocaleString('ar')} ر.س` : j.salary_min ? `من ${Number(j.salary_min).toLocaleString('ar')} ر.س` : `حتى ${Number(j.salary_max).toLocaleString('ar')} ر.س`}
                  </div>
                )}

                {j.description && (
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>الوصف</div>
                    <div style={{ fontSize:13, color:'var(--gray700)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{j.description}</div>
                  </div>
                )}

                {j.requirements && (
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>المتطلبات</div>
                    <div style={{ fontSize:13, color:'var(--gray700)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{j.requirements}</div>
                  </div>
                )}

                <div style={{ display:'flex', gap:10, marginTop:'auto', paddingTop:16, borderTop:'1px solid var(--gray100)' }}>
                  <button onClick={() => { openEdit(j); setPeek(null) }} style={{ flex:1, padding:'10px', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <Pencil size={13}/> تعديل
                  </button>
                  <button onClick={() => { del(j.id); setPeek(null) }} style={{ padding:'10px 18px', background:'rgba(220,38,38,0.07)', color:'#B91C1C', border:'1px solid rgba(220,38,38,0.2)', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </>
            )})()}

            {/* ── Application Peek ── */}
            {peek.type === 'app' && (() => { const a = peek.item; const consentDate = a.created_at ? new Date(a.created_at).toLocaleString('ar-SA') : '—'; return (
              <>
                {/* Avatar */}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--g100)', color:'var(--g800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0 }}>
                    {(a.name||'؟').split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{ fontSize:17, fontWeight:700, color:'var(--g950)' }}>{a.name}</div>
                    <div style={{ fontSize:13, color:'var(--gray500)' }}>{a.email}</div>
                    {a.phone && <div style={{ fontSize:12, color:'var(--gray400)' }}>{a.phone}</div>}
                  </div>
                </div>

                {/* Job */}
                <div style={{ background:'var(--g50)', border:'1px solid var(--g100)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>الوظيفة المُقدَّم عليها</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--g700)' }}>{a.job?.title || '—'}</div>
                </div>

                {/* Status */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>الحالة</div>
                  {getStatusBadge(a.status)}
                </div>

                {/* Status actions */}
                {(a.status === 'pending' || a.status === 'reviewed') && (
                  <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                    <button onClick={() => { updateAppStatus(a.id,'interview'); setPeek(p => ({...p, item:{...p.item,status:'interview'}})) }} style={{ flex:1, padding:'8px', borderRadius:'var(--r-sm)', background:'#EDE9FE', border:'1px solid #C4B5FD', color:'#5B21B6', fontSize:12, fontWeight:600, cursor:'pointer' }}>مقابلة</button>
                    <button onClick={() => { updateAppStatus(a.id,'accepted'); setPeek(p => ({...p, item:{...p.item,status:'accepted'}})) }} style={{ flex:1, padding:'8px', borderRadius:'var(--r-sm)', background:'var(--g50)', border:'1px solid var(--g100)', color:'var(--g600)', fontSize:12, fontWeight:600, cursor:'pointer' }}>قبول</button>
                    <button onClick={() => { updateAppStatus(a.id,'rejected'); setPeek(p => ({...p, item:{...p.item,status:'rejected'}})) }} style={{ flex:1, padding:'8px', borderRadius:'var(--r-sm)', background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,0.15)', color:'#B91C1C', fontSize:12, fontWeight:600, cursor:'pointer' }}>رفض</button>
                  </div>
                )}

                {/* ── PDPL Consent Traceability ── */}
                <div style={{ background:'var(--g50)', border:'1.5px solid var(--g200)', borderRadius:'var(--r-lg)', padding:'16px', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <CheckCircle size={16} color="var(--g600)"/>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--g800)' }}>سجل الموافقة القانونية (PDPL)</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--gray600)', lineHeight:1.8 }}>
                    <div>📅 <strong>تاريخ الموافقة:</strong> {consentDate}</div>
                    <div>📋 <strong>نوع الموافقة:</strong> موافقة ضمنية بتقديم الطلب</div>
                    <div>🔖 <strong>نسخة السياسة:</strong> v1.0</div>
                    <div style={{ marginTop:8, fontSize:11, color:'var(--gray400)', borderTop:'1px solid var(--g100)', paddingTop:8 }}>
                      بتقديم الطلب، وافق المستخدم صراحةً على معالجة بياناته لأغراض التوظيف وفق نظام PDPL السعودي.
                    </div>
                  </div>
                </div>

                {/* Delete Data */}
                <button onClick={() => withdrawData(a.id)} style={{
                  width:'100%', padding:'11px', borderRadius:'var(--r-md)',
                  background:'rgba(220,38,38,0.06)', color:'#991B1B',
                  border:'1.5px solid rgba(220,38,38,0.2)',
                  fontSize:13, fontWeight:600, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                }}>
                  <Trash2 size={13}/> سحب البيانات (PDPL)
                </button>
                <p style={{ fontSize:11, color:'var(--gray400)', textAlign:'center', marginTop:6, lineHeight:1.5 }}>
                  يُعلّم الطلب كـ "مسحوب" ويمنع أي معالجة مستقبلية للبيانات
                </p>
              </>
            )})()}
          </div>
        </div>
      )}

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

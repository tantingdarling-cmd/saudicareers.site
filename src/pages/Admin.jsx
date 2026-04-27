import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Save, Lock, LogOut, Loader, FileText, Clock, CheckCircle, XCircle, Users, Download, Copy, Mail, UserCheck, AlertTriangle } from 'lucide-react'
import { authApi, jobsApi, applicationsApi, subscribersApi, probationApi, settingsApi, sectionsApi } from '../services/api'

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

  // ── Sections state ───────────────────────────────────────────────
  const [sections, setSections]             = useState([])
  const [sectionForm, setSectionForm]       = useState({ key:'', title:'', content:'{}', is_active:true, order:0 })
  const [editingSection, setEditingSection] = useState(null)
  const [savingSection, setSavingSection]   = useState(false)

  // ── Probation state ──────────────────────────────────────────────
  const [probation, setProbation]           = useState([])
  const [loadingProbation, setLoadingProbation] = useState(false)
  const [showProbationForm, setShowProbationForm] = useState(false)
  const [probationForm, setProbationForm]   = useState({
    employee_name:'', employee_email:'', start_date:'', duration_days:90, application_id:'',
  })
  const [savingProbation, setSavingProbation] = useState(false)
  const [extendingId, setExtendingId]       = useState(null)
  const [extendFile, setExtendFile]         = useState(null)

  // ── Dashboard state ──────────────────────────────────────────────
  const [stats, setStats]               = useState(null)
  const [recentApps, setRecentApps]     = useState([])
  const [loadingDash, setLoadingDash]   = useState(false)

  // ── Analytics state ──────────────────────────────────────────────
  const [funnel, setFunnel] = useState(null)
  const [loadingFunnel, setLoadingFunnel] = useState(false)

  // ── Settings state ───────────────────────────────────────────────
  const [settingsGroups, setSettingsGroups] = useState({})
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingKey, setSavingKey]           = useState(null)
  const [settingsDraft, setSettingsDraft]   = useState({}) // { key: editedValue }

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
    if (activeTab === 'dashboard') fetchDashboard()
    if (activeTab === 'applications') fetchApplications()
    if (activeTab === 'subscribers') fetchSubscribers()
    if (activeTab === 'probation') fetchProbation()
    if (activeTab === 'settings') fetchSettings()
    if (activeTab === 'sections') sectionsApi.getAll().then(setSections).catch(console.error)
    if (activeTab === 'analytics') fetchFunnel()
  }, [activeTab])

  const fetchDashboard = async () => {
    setLoadingDash(true)
    try {
      const token = localStorage.getItem('auth_token')
      const h = { Authorization: `Bearer ${token}` }
      const [s, r] = await Promise.all([
        fetch('/api/admin/stats',               { headers: h }).then(x => x.json()),
        fetch('/api/admin/recent-applications', { headers: h }).then(x => x.json()),
      ])
      setStats(s)
      setRecentApps(r.data || [])
    } catch {}
    finally { setLoadingDash(false) }
  }

  const fetchFunnel = async () => {
    setLoadingFunnel(true)
    try {
      const res = await fetch('/api/v1/analytics/week', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      })
      setFunnel(await res.json())
    } catch { } finally { setLoadingFunnel(false) }
  }

  const fetchProbation = async () => {
    setLoadingProbation(true)
    try {
      const res = await probationApi.getAll({ per_page: 100 })
      setProbation(res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProbation(false)
    }
  }

  const saveProbation = async () => {
    if (!probationForm.employee_name || !probationForm.employee_email || !probationForm.start_date) return
    setSavingProbation(true)
    try {
      await probationApi.create(probationForm)
      setShowProbationForm(false)
      setProbationForm({ employee_name:'', employee_email:'', start_date:'', duration_days:90, application_id:'' })
      fetchProbation()
    } catch (err) {
      alert(err.message || 'فشل الحفظ')
    } finally {
      setSavingProbation(false)
    }
  }

  const extendProbation = async (record) => {
    if (!extendFile) { alert('يرجى رفع ملف الموافقة الخطية (PDF أو صورة)'); return }
    const fd = new FormData()
    fd.append('extension_docs', extendFile)
    fd.append('duration_days', 180)
    try {
      await probationApi.extend(record.id, fd)
      setExtendingId(null); setExtendFile(null)
      fetchProbation()
    } catch (err) {
      alert(err.message || 'فشل التمديد')
    }
  }

  const getProbationBadge = (status) => {
    const map = {
      active:     { bg:'var(--g50)',            color:'var(--g700)',   label:'نشطة' },
      extended:   { bg:'#EDE9FE',               color:'#5B21B6',      label:'ممتدة' },
      completed:  { bg:'#D1FAE5',               color:'#065F46',      label:'مكتملة' },
      terminated: { bg:'rgba(220,38,38,0.07)',  color:'#991B1B',      label:'منهية' },
    }
    const s = map[status] || map.active
    return (
      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50, background:s.bg, color:s.color }}>
        {s.label}
      </span>
    )
  }

  const fetchSettings = async () => {
    setLoadingSettings(true)
    try {
      const res = await settingsApi.getAll()
      setSettingsGroups(res)
      // ابنِ draft من القيم الحالية
      const draft = {}
      Object.values(res).flat().forEach(s => { draft[s.key] = s.value ?? '' })
      setSettingsDraft(draft)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSettings(false)
    }
  }

  const saveSetting = async (key) => {
    setSavingKey(key)
    try {
      await settingsApi.update(key, settingsDraft[key] || null)
      // مسح الـ cache المحلي للـ Analytics
      sessionStorage.removeItem('sc_analytics')
    } catch (err) {
      alert(err.message || 'فشل الحفظ')
    } finally {
      setSavingKey(null)
    }
  }

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
              {activeTab === 'jobs' ? `${jobs.length} وظيفة` : activeTab === 'applications' ? `${applications.length} تقديم` : activeTab === 'probation' ? `${probation.length} سجل تجربة` : `${subscribers.length} مشترك`}
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
          {activeTab === 'probation' && (
              <button onClick={() => setShowProbationForm(true)} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'var(--g900)', color:'var(--white)',
                border:'none', padding:'11px 22px', borderRadius:'var(--r-md)',
                fontSize:14, fontWeight:600,
              }}>
                <Plus size={16}/> إضافة موظف
              </button>
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

        <div style={{ display:'flex', gap:4, marginBottom:24, background:'var(--gray100)', padding:4, borderRadius:'var(--r-md)', width:'fit-content', flexWrap:'wrap' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'dashboard' ? 'var(--white)' : 'transparent',
            color: activeTab === 'dashboard' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'dashboard' ? 'var(--shadow-sm)' : 'none',
          }}>🏠 الرئيسية</button>
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
          <button onClick={() => setActiveTab('settings')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'settings' ? 'var(--white)' : 'transparent',
            color: activeTab === 'settings' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'settings' ? 'var(--shadow-sm)' : 'none',
          }}>⚙️ الإعدادات</button>
          <button onClick={() => setActiveTab('analytics')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'analytics' ? 'var(--white)' : 'transparent',
            color: activeTab === 'analytics' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'analytics' ? 'var(--shadow-sm)' : 'none',
          }}>📊 التحويلات</button>
          <button onClick={() => setActiveTab('probation')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'probation' ? 'var(--white)' : 'transparent',
            color: activeTab === 'probation' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'probation' ? 'var(--shadow-sm)' : 'none',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <UserCheck size={14}/> فترة التجربة
            {probation.filter(r => r.status === 'active' || r.status === 'extended').length > 0 && (
              <span style={{ background:'var(--g600)', color:'var(--white)', borderRadius:50, fontSize:10, fontWeight:700, padding:'2px 7px', minWidth:18, textAlign:'center' }}>
                {probation.filter(r => r.status === 'active' || r.status === 'extended').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('sections')} style={{
            padding:'10px 24px', borderRadius:'var(--r-sm)', border:'none', fontSize:14, fontWeight:600, cursor:'pointer',
            background: activeTab === 'sections' ? 'var(--white)' : 'transparent',
            color: activeTab === 'sections' ? 'var(--g900)' : 'var(--gray500)',
            boxShadow: activeTab === 'sections' ? 'var(--shadow-sm)' : 'none',
          }}>🗂 الأقسام</button>
        </div>

        {/* ── DASHBOARD TAB ──────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          loadingDash ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={28} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
          ) : (
            <div>
              {/* Stats cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:32 }}>
                {[
                  { label:'وظائف نشطة',      value: stats?.total_jobs           ?? '—', icon:'💼', color:'var(--g700)' },
                  { label:'تنبيهات مفعّلة',    value: stats?.active_alerts        ?? '—', icon:'🔔', color:'#7C3AED' },
                  { label:'مستخدمون جدد (7أ)', value: stats?.new_users_week       ?? '—', icon:'👤', color:'#0369A1' },
                  { label:'طلبات معلّقة',      value: stats?.applications_pending ?? '—', icon:'📋', color:'#B45309' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} style={{
                    background:'var(--white)', border:'1.5px solid var(--gray200)',
                    borderRadius:'var(--r-lg)', padding:'20px 24px',
                    display:'flex', alignItems:'center', gap:16,
                  }}>
                    <span style={{ fontSize:28 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1 }}>{value}</div>
                      <div style={{ fontSize:12, color:'var(--gray400)', marginTop:4 }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' }}>
                <button onClick={() => { setActiveTab('jobs'); setTimeout(() => document.querySelector('[data-add-job]')?.click(), 100) }}
                  style={{ display:'flex', alignItems:'center', gap:8, background:'var(--g900)', color:'#fff',
                    border:'none', padding:'12px 20px', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  <Plus size={16}/> أضف وظيفة
                </button>
                <button onClick={() => setActiveTab('applications')}
                  style={{ display:'flex', alignItems:'center', gap:8, background:'var(--white)', color:'var(--g900)',
                    border:'1.5px solid var(--gray200)', padding:'12px 20px', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  <FileText size={16}/> راجع المتقدمين
                </button>
                <button onClick={() => setActiveTab('subscribers')}
                  style={{ display:'flex', alignItems:'center', gap:8, background:'var(--white)', color:'var(--g900)',
                    border:'1.5px solid var(--gray200)', padding:'12px 20px', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                  <Mail size={16}/> أرسل نشرة يدوية
                </button>
              </div>

              {/* Recent activity table */}
              <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
                <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--gray200)', fontWeight:700, fontSize:15, color:'var(--g950)' }}>
                  آخر 10 تقديمات
                </div>
                {recentApps.length === 0 ? (
                  <div style={{ padding:40, textAlign:'center', color:'var(--gray400)' }}>لا توجد تقديمات بعد</div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                      <thead>
                        <tr style={{ background:'var(--gray50)' }}>
                          {['الاسم','البريد','الوظيفة','الشركة','التاريخ','الحالة','إجراء'].map(h => (
                            <th key={h} style={{ padding:'10px 16px', textAlign:'right', fontWeight:600, color:'var(--gray500)', borderBottom:'1px solid var(--gray200)', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentApps.map((a, i) => (
                          <tr key={a.id} style={{ borderBottom: i < recentApps.length-1 ? '1px solid var(--gray100)' : 'none' }}>
                            <td style={{ padding:'12px 16px', color:'var(--g900)', fontWeight:600 }}>{a.name}</td>
                            <td style={{ padding:'12px 16px', color:'var(--gray500)', fontSize:12 }}>{a.email}</td>
                            <td style={{ padding:'12px 16px', color:'var(--g800)' }}>{a.job_title || '—'}</td>
                            <td style={{ padding:'12px 16px', color:'var(--gray500)' }}>{a.company || '—'}</td>
                            <td style={{ padding:'12px 16px', color:'var(--gray400)', whiteSpace:'nowrap' }}>{a.applied_at}</td>
                            <td style={{ padding:'12px 16px' }}>
                              <span style={{
                                fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:50,
                                background: a.status==='accepted'?'rgba(22,163,74,0.1)':a.status==='rejected'?'rgba(220,38,38,0.1)':'rgba(234,179,8,0.1)',
                                color: a.status==='accepted'?'#15803D':a.status==='rejected'?'#B91C1C':'#92400E',
                              }}>
                                {a.status==='pending'?'معلّق':a.status==='accepted'?'مقبول':a.status==='rejected'?'مرفوض':a.status}
                              </span>
                            </td>
                            <td style={{ padding:'12px 16px' }}>
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={async () => {
                                  const token = localStorage.getItem('auth_token')
                                  await fetch(`/api/admin/applications/${a.id}/status`, {
                                    method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                                    body: JSON.stringify({ status:'accepted' })
                                  })
                                  setRecentApps(prev => prev.map(x => x.id===a.id ? {...x,status:'accepted'} : x))
                                }} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid rgba(22,163,74,0.3)',
                                  background:'rgba(22,163,74,0.06)', color:'#15803D', cursor:'pointer', fontFamily:'var(--font-ar)' }}>
                                  قبول
                                </button>
                                <button onClick={async () => {
                                  const token = localStorage.getItem('auth_token')
                                  await fetch(`/api/admin/applications/${a.id}/status`, {
                                    method:'PATCH', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                                    body: JSON.stringify({ status:'rejected' })
                                  })
                                  setRecentApps(prev => prev.map(x => x.id===a.id ? {...x,status:'rejected'} : x))
                                }} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'1px solid rgba(220,38,38,0.3)',
                                  background:'rgba(220,38,38,0.06)', color:'#B91C1C', cursor:'pointer', fontFamily:'var(--font-ar)' }}>
                                  رفض
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        )}

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

                  {/* gov_partner + urgent toggles */}
                  <div style={{ display:'flex', gap:6, marginBottom:8 }} onClick={e => e.stopPropagation()}>
                    <button onClick={async () => {
                      const token = localStorage.getItem('auth_token')
                      const val = !job.is_government_partner
                      await fetch(`/api/admin/jobs/${job.id}`, { method:'PUT',
                        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                        body: JSON.stringify({ ...job, is_government_partner: val }) })
                      setJobs(prev => prev.map(j => j.id===job.id ? {...j,is_government_partner:val} : j))
                    }} style={{ fontSize:10, padding:'3px 8px', borderRadius:6,
                      background: job.is_government_partner ? 'rgba(27,94,55,0.1)' : 'var(--gray100)',
                      border: '1px solid ' + (job.is_government_partner ? 'var(--g300)' : 'var(--gray200)'),
                      color: job.is_government_partner ? 'var(--g700)' : 'var(--gray400)', cursor:'pointer', fontFamily:'var(--font-ar)' }}>
                      🏛 {job.is_government_partner ? 'حكومي ✓' : 'حكومي'}
                    </button>
                    <button onClick={async () => {
                      const token = localStorage.getItem('auth_token')
                      const val = !job.is_urgent
                      await fetch(`/api/admin/jobs/${job.id}`, { method:'PUT',
                        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                        body: JSON.stringify({ ...job, is_urgent: val }) })
                      setJobs(prev => prev.map(j => j.id===job.id ? {...j,is_urgent:val} : j))
                    }} style={{ fontSize:10, padding:'3px 8px', borderRadius:6,
                      background: job.is_urgent ? 'rgba(234,179,8,0.1)' : 'var(--gray100)',
                      border: '1px solid ' + (job.is_urgent ? 'var(--gold300)' : 'var(--gray200)'),
                      color: job.is_urgent ? 'var(--gold700)' : 'var(--gray400)', cursor:'pointer', fontFamily:'var(--font-ar)' }}>
                      ⚡ {job.is_urgent ? 'عاجل ✓' : 'عاجل'}
                    </button>
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

                    {/* AI Match Score */}
                    {app.match_score != null && (() => {
                      const s = parseFloat(app.match_score)
                      const [bg, color, label] =
                        s >= 80 ? ['#D1FAE5','#065F46','عالي'] :
                        s >= 50 ? ['#FEF3C7','#92400E','متوسط'] :
                                  ['#FEE2E2','#991B1B','منخفض']
                      return (
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, padding:'6px 10px', background:bg, borderRadius:'var(--r-sm)' }}>
                          <span style={{ fontSize:12 }}>🤖</span>
                          <span style={{ fontSize:12, fontWeight:700, color }}>
                            AI Match: {s.toFixed(0)}% — {label}
                          </span>
                        </div>
                      )
                    })()}

                    {/* Badges row */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      {getStatusBadge(app.status)}
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

        {/* ── Settings Tab ──────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          loadingSettings ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={32} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
              {Object.entries(settingsGroups).map(([group, items]) => {
                const groupLabels = { analytics:'📊 التحليلات والإعلانات', general:'🌐 عام', jobs:'💼 الوظائف' }
                return (
                  <div key={group} style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
                    <div style={{ padding:'16px 24px', background:'var(--gray50)', borderBottom:'1px solid var(--gray200)' }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)' }}>
                        {groupLabels[group] || group}
                      </div>
                    </div>
                    <div style={{ padding:'8px 0' }}>
                      {items.map((s, i) => (
                        <div key={s.key} style={{
                          padding:'18px 24px',
                          borderBottom: i < items.length-1 ? '1px solid var(--gray100)' : 'none',
                        }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' }}>
                            <div style={{ flex:1, minWidth:200 }}>
                              <div style={{ fontSize:14, fontWeight:600, color:'var(--g950)', marginBottom:4 }}>
                                {s.label}
                              </div>
                              {s.description && (
                                <div style={{ fontSize:12, color:'var(--gray400)', lineHeight:1.6, marginBottom:8 }}>
                                  {s.description}
                                </div>
                              )}
                              <div style={{ fontSize:11, color:'var(--gray300)', fontFamily:'monospace' }}>{s.key}</div>
                            </div>
                            <div style={{ display:'flex', gap:8, alignItems:'center', minWidth:280 }}>
                              <input
                                value={settingsDraft[s.key] ?? ''}
                                onChange={e => setSettingsDraft(p => ({ ...p, [s.key]: e.target.value }))}
                                placeholder={s.type === 'json' ? '["value1","value2"]' : s.type === 'boolean' ? 'true / false' : 'أدخل القيمة...'}
                                style={{ ...inputStyle, marginBottom:0, flex:1, fontSize:13, fontFamily: s.type === 'json' ? 'monospace' : 'inherit' }}
                              />
                              <button
                                onClick={() => saveSetting(s.key)}
                                disabled={savingKey === s.key}
                                style={{
                                  padding:'10px 18px', background:'var(--g900)', color:'var(--white)',
                                  border:'none', borderRadius:'var(--r-md)', fontSize:13, fontWeight:600,
                                  cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                                  opacity: savingKey === s.key ? 0.6 : 1,
                                }}
                              >
                                {savingKey === s.key ? '...' : <Save size={14}/>}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ── Probation Tab ──────────────────────────────────────────── */}
        {activeTab === 'probation' && (
          loadingProbation ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <Loader size={32} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
            </div>
          ) : (
            <>
              {/* KPI row */}
              {probation.length > 0 && (() => {
                const active    = probation.filter(r => r.status === 'active').length
                const expiring  = probation.filter(r => r.remaining_days <= 14 && r.remaining_days > 0).length
                const extended  = probation.filter(r => r.status === 'extended').length
                return (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:20 }}>
                    {[
                      { label:'نشطة',            value:active,   color:'var(--g900)' },
                      { label:'تنتهي خلال 14 يوم', value:expiring, color:'#DC2626' },
                      { label:'ممتدة (المادة 53)', value:extended, color:'#5B21B6' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
                        <div style={{ fontSize:28, fontWeight:800, color, marginBottom:4 }}>{value}</div>
                        <div style={{ fontSize:12, color:'var(--gray400)', fontWeight:500 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {probation.length === 0 ? (
                <div style={{ padding:60, textAlign:'center', color:'var(--gray400)', background:'var(--white)', borderRadius:'var(--r-lg)', border:'1.5px solid var(--gray200)' }}>
                  <UserCheck size={40} color="var(--gray200)" style={{ margin:'0 auto 16px' }}/>
                  <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>لا يوجد سجلات تجربة بعد</div>
                  <div style={{ fontSize:13, color:'var(--gray300)' }}>أضف موظفاً جديداً لبدء تتبع فترة التجربة</div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
                  {probation.map(record => {
                    const isExpiringSoon = record.remaining_days <= 14 && record.remaining_days > 0
                    const barColor = record.is_expired ? '#9CA3AF' : isExpiringSoon ? '#EF4444' : 'var(--g500)'
                    return (
                      <div key={record.id} style={{
                        background:'var(--white)', border: isExpiringSoon ? '1.5px solid rgba(239,68,68,0.3)' : '1.5px solid var(--gray200)',
                        borderRadius:'var(--r-xl)', padding:20, boxShadow:'var(--shadow-sm)',
                      }}>
                        {/* Header */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                          <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:2 }}>{record.employee_name}</div>
                            <div style={{ fontSize:12, color:'var(--gray400)' }}>{record.employee_email}</div>
                          </div>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                            {getProbationBadge(record.status)}
                            {isExpiringSoon && <span style={{ fontSize:10, color:'#DC2626', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}><AlertTriangle size={10}/> تنتهي قريباً</span>}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ background:'var(--gray100)', borderRadius:4, height:6, marginBottom:6, overflow:'hidden' }}>
                          <div style={{ width:`${record.progress_percent}%`, height:'100%', background:barColor, borderRadius:4, transition:'width 0.3s' }}/>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--gray400)', marginBottom:14 }}>
                          <span>{record.progress_percent}% مكتمل</span>
                          <span>{record.remaining_days} يوم متبقٍ من {record.duration_days}</span>
                        </div>

                        {/* Dates grid */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
                          {[
                            { label:'تاريخ البدء', value:record.start_date },
                            { label:'تاريخ الانتهاء', value:record.end_date },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ background:'var(--gray50)', borderRadius:'var(--r-sm)', padding:'8px 12px' }}>
                              <div style={{ fontSize:10, color:'var(--gray400)', marginBottom:2 }}>{label}</div>
                              <div style={{ fontSize:13, fontWeight:600, color:'var(--g800)' }}>{value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Law ref */}
                        <div style={{ fontSize:11, color:'var(--gray400)', marginBottom:12, display:'flex', alignItems:'center', gap:4 }}>
                          ⚖️ {record.law_ref}
                        </div>

                        {/* Extend action */}
                        {record.can_extend && (
                          extendingId === record.id ? (
                            <div style={{ background:'var(--g50)', border:'1px solid var(--g200)', borderRadius:'var(--r-md)', padding:14 }}>
                              <div style={{ fontSize:12, color:'var(--g700)', fontWeight:600, marginBottom:8 }}>
                                ارفع ملف الموافقة الخطية (PDF/صورة) — المادة 53
                              </div>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => setExtendFile(e.target.files[0])}
                                style={{ fontSize:12, width:'100%', marginBottom:10 }}/>
                              <div style={{ display:'flex', gap:8 }}>
                                <button onClick={() => extendProbation(record)} style={{ flex:1, padding:'8px', background:'var(--g900)', color:'var(--white)', border:'none', borderRadius:'var(--r-sm)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                                  تأكيد التمديد لـ 180 يوم
                                </button>
                                <button onClick={() => { setExtendingId(null); setExtendFile(null) }} style={{ padding:'8px 12px', background:'var(--gray100)', color:'var(--gray600)', border:'none', borderRadius:'var(--r-sm)', fontSize:12, cursor:'pointer' }}>
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setExtendingId(record.id)} style={{
                              width:'100%', padding:'9px', background:'transparent',
                              color:'var(--g700)', border:'1.5px solid var(--g200)',
                              borderRadius:'var(--r-md)', fontSize:13, fontWeight:600, cursor:'pointer',
                            }}>
                              تمديد الفترة (حتى 180 يوم)
                            </button>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
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

                {/* ── AI Match Dimensions (7 أبعاد — Staggered) ── */}
                {a.match_score != null && (() => {
                  const raw     = a.match_details
                  const details = raw
                    ? (typeof raw === 'string' ? (() => { try { return JSON.parse(raw) } catch { return {} } })() : raw)
                    : {}

                  const dims = [
                    { key:'skills',       label:'المهارات التقنية',  weight:'35%' },
                    { key:'experience',   label:'الخبرة',            weight:'25%' },
                    { key:'location',     label:'الموقع',            weight:'15%' },
                    { key:'job_type',     label:'نوع الدوام',        weight:'10%' },
                    { key:'education',    label:'التعليم',           weight:'7%'  },
                    { key:'category',     label:'القطاع',            weight:'5%'  },
                    { key:'completeness', label:'اكتمال الطلب',      weight:'3%'  },
                  ].filter(d => details[d.key] != null)

                  if (!dims.length) return null

                  return (
                    <div style={{ background:'var(--gray50)', border:'1px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'14px 16px', marginBottom:16 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--gray400)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                        🤖 تفاصيل المطابقة الذكية
                      </div>
                      {dims.map(({ key, label, weight }, i) => {
                        const val = parseFloat(details[key])
                        const barColor = val >= 70 ? 'var(--g600)' : val >= 40 ? 'var(--gold500)' : '#ef4444'
                        return (
                          <div key={key} style={{
                            marginBottom: 10,
                            opacity: 1,
                            animation: `dimIn 0.4s ease ${i * 300}ms both`,
                          }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--gray600)', marginBottom:4 }}>
                              <span style={{ fontWeight:600, color:barColor }}>{val.toFixed(0)}%</span>
                              <span>{label} <span style={{ color:'var(--gray400)' }}>({weight})</span></span>
                            </div>
                            <div style={{ height:5, background:'var(--gray200)', borderRadius:3, overflow:'hidden' }}>
                              <div style={{
                                height:'100%', width:`${val}%`,
                                background:barColor, borderRadius:3,
                                animation: `barFill 0.8s cubic-bezier(0.19,1,0.22,1) ${i * 300 + 200}ms both`,
                              }}/>
                            </div>
                          </div>
                        )
                      })}
                      <style>{`
                        @keyframes dimIn    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
                        @keyframes barFill  { from{width:0} }
                      `}</style>
                    </div>
                  )
                })()}

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

      {showProbationForm && (
        <div onClick={e => e.target===e.currentTarget && setShowProbationForm(false)} style={{
          position:'fixed', inset:0, zIndex:500,
          background:'rgba(0,26,13,0.7)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
        }}>
          <div style={{ background:'var(--white)', borderRadius:'var(--r-xl)', width:'100%', maxWidth:480, padding:32, boxShadow:'var(--shadow-lg)', position:'relative' }}>
            <button onClick={() => setShowProbationForm(false)} style={{ position:'absolute', top:16, left:16, width:32, height:32, borderRadius:'50%', background:'var(--gray100)', border:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={16}/>
            </button>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>إضافة سجل فترة تجربة</div>
            {/* نظام العمل السعودي — المادة 53: الحد الأقصى 90 يوماً */}
            <div style={{ fontSize:12, color:'var(--gray400)', marginBottom:20, display:'flex', alignItems:'center', gap:4 }}>
              ⚖️ وفق نظام العمل السعودي — المادة 53 (الحد الأقصى 90 يوماً)
            </div>

            <input placeholder="اسم الموظف *" value={probationForm.employee_name}
              onChange={e => setProbationForm(p => ({ ...p, employee_name:e.target.value }))}
              style={inputStyle}/>

            <input type="email" placeholder="البريد الإلكتروني *" value={probationForm.employee_email}
              onChange={e => setProbationForm(p => ({ ...p, employee_email:e.target.value }))}
              style={inputStyle}/>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'var(--gray500)', marginBottom:6 }}>تاريخ بدء فترة التجربة *</div>
              <input type="date" value={probationForm.start_date}
                onChange={e => setProbationForm(p => ({ ...p, start_date:e.target.value }))}
                style={{ ...inputStyle, marginBottom:0 }}/>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, color:'var(--gray500)', marginBottom:6 }}>المدة بالأيام (الحد الأقصى 90)</div>
              <input type="number" min={1} max={90} value={probationForm.duration_days}
                onChange={e => setProbationForm(p => ({ ...p, duration_days:Math.min(90,parseInt(e.target.value)||90) }))}
                style={{ ...inputStyle, marginBottom:0 }}/>
            </div>

            <input placeholder="رقم الطلب المرتبط (اختياري)" value={probationForm.application_id}
              onChange={e => setProbationForm(p => ({ ...p, application_id:e.target.value }))}
              style={inputStyle}/>

            <button onClick={saveProbation} disabled={savingProbation} style={{
              width:'100%', padding:13, background:'var(--g900)', color:'var(--white)',
              border:'none', borderRadius:'var(--r-md)', fontSize:15, fontWeight:600,
              opacity: savingProbation ? 0.7 : 1,
            }}>
              {savingProbation ? 'جارٍ الحفظ...' : 'حفظ السجل'}
            </button>
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

      {/* ── Analytics: Conversion Funnel ────────────────────────────── */}
      {activeTab === 'analytics' && (
        loadingFunnel ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <Loader size={32} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }}/>
          </div>
        ) : funnel ? (() => {
          const max = Math.max(funnel.alert_sent, funnel.alert_clicked, funnel.application_submitted, 1)
          const steps = [
            { label: 'تنبيهات أُرسلت', value: funnel.alert_sent, color: '#3b82f6' },
            { label: 'نقرات على التنبيه', value: funnel.alert_clicked, color: '#8b5cf6' },
            { label: 'تقديمات مكتملة', value: funnel.application_submitted, color: '#10b981' },
          ]
          return (
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:32 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>قمع التحويل — هذا الأسبوع</h2>
              <p style={{ fontSize:13, color:'var(--gray400)', marginBottom:28 }}>من {funnel.week_start} إلى اليوم</p>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {steps.map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:14, fontWeight:600, color:'var(--g900)' }}>{label}</span>
                      <span style={{ fontSize:14, fontWeight:700, color }}>{value.toLocaleString('ar-SA')}</span>
                    </div>
                    <div style={{ height:12, background:'var(--gray100)', borderRadius:999, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:999, background:color,
                        width: `${Math.round((value / max) * 100)}%`,
                        transition:'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:28, paddingTop:20, borderTop:'1px solid var(--gray200)', display:'flex', gap:32 }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--gray400)', marginBottom:2 }}>معدل النقر</div>
                  <div style={{ fontSize:20, fontWeight:700, color:'var(--g900)' }}>
                    {funnel.alert_sent > 0 ? `${Math.round((funnel.alert_clicked / funnel.alert_sent) * 100)}%` : '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'var(--gray400)', marginBottom:2 }}>معدل التحويل</div>
                  <div style={{ fontSize:20, fontWeight:700, color:'var(--g900)' }}>
                    {funnel.alert_clicked > 0 ? `${Math.round((funnel.application_submitted / funnel.alert_clicked) * 100)}%` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )
        })() : (
          <div style={{ padding:60, textAlign:'center', color:'var(--gray400)', background:'var(--white)', borderRadius:'var(--r-lg)', border:'1.5px solid var(--gray200)' }}>
            لا توجد بيانات تحليلية بعد.
          </div>
        )
      )}
      {activeTab === 'sections' && (
        <div style={{ background:'var(--white)', borderRadius:'var(--r-lg)', border:'1.5px solid var(--gray200)', padding:24 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--g900)', marginBottom:20 }}>🗂 إدارة الأقسام</div>

          {/* Form */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[['key','المفتاح (key)'],['title','العنوان'],['order','الترتيب']].map(([field, label]) => (
              <div key={field}>
                <div style={{ fontSize:12, color:'var(--gray500)', marginBottom:4 }}>{label}</div>
                <input value={editingSection ? editingSection[field] ?? '' : sectionForm[field]}
                  onChange={e => editingSection
                    ? setEditingSection({ ...editingSection, [field]: e.target.value })
                    : setSectionForm({ ...sectionForm, [field]: e.target.value })
                  }
                  style={{ width:'100%', boxSizing:'border-box', padding:'8px 10px', fontSize:13, border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)', outline:'none' }}
                />
              </div>
            ))}
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:12, color:'var(--gray500)', marginBottom:4 }}>المحتوى (JSON)</div>
              <textarea rows={3} value={editingSection ? JSON.stringify(editingSection.content ?? {}) : sectionForm.content}
                onChange={e => editingSection
                  ? setEditingSection({ ...editingSection, content: e.target.value })
                  : setSectionForm({ ...sectionForm, content: e.target.value })
                }
                style={{ width:'100%', boxSizing:'border-box', padding:'8px 10px', fontSize:13, border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)', outline:'none', fontFamily:'monospace', resize:'vertical' }}
              />
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginBottom:24 }}>
            <button disabled={savingSection} onClick={async () => {
              setSavingSection(true)
              try {
                if (editingSection) {
                  const content = typeof editingSection.content === 'string' ? JSON.parse(editingSection.content) : editingSection.content
                  const updated = await sectionsApi.update(editingSection.id, { ...editingSection, content })
                  setSections(sections.map(s => s.id === updated.id ? updated : s))
                  setEditingSection(null)
                } else {
                  const payload = { ...sectionForm, content: JSON.parse(sectionForm.content || '{}') }
                  const created = await sectionsApi.create(payload)
                  setSections([...sections, created])
                  setSectionForm({ key:'', title:'', content:'{}', is_active:true, order:0 })
                }
              } catch (e) { alert(e.message || 'خطأ في الحفظ') } finally { setSavingSection(false) }
            }} style={{ padding:'9px 20px', background:'var(--g700)', color:'var(--white)', border:'none', borderRadius:50, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {savingSection ? '...' : editingSection ? 'حفظ التعديل' : '+ إضافة قسم'}
            </button>
            {editingSection && (
              <button onClick={() => setEditingSection(null)} style={{ padding:'9px 20px', background:'var(--gray100)', color:'var(--gray700)', border:'none', borderRadius:50, fontSize:13, fontWeight:600, cursor:'pointer' }}>إلغاء</button>
            )}
          </div>

          {/* List */}
          {sections.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', border:'1px solid var(--gray200)', borderRadius:'var(--r-md)', marginBottom:8, gap:10, flexWrap:'wrap' }}>
              <div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--g900)' }}>{s.title}</span>
                <span style={{ fontSize:11, color:'var(--gray400)', marginRight:8 }}>({s.key})</span>
                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:50, background: s.is_active ? 'var(--g50)' : 'var(--gray100)', color: s.is_active ? 'var(--g700)' : 'var(--gray500)' }}>
                  {s.is_active ? 'مفعّل' : 'معطّل'}
                </span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => sectionsApi.update(s.id, { is_active: !s.is_active }).then(u => setSections(sections.map(x => x.id === u.id ? u : x)))}
                  style={{ fontSize:12, padding:'5px 12px', borderRadius:50, border:'1px solid var(--gray300)', background:'var(--white)', cursor:'pointer' }}>
                  {s.is_active ? 'تعطيل' : 'تفعيل'}
                </button>
                <button onClick={() => setEditingSection({ ...s })}
                  style={{ fontSize:12, padding:'5px 12px', borderRadius:50, border:'1px solid var(--gray300)', background:'var(--white)', cursor:'pointer' }}>تعديل</button>
                <button onClick={async () => { if (!confirm('حذف؟')) return; await sectionsApi.destroy(s.id); setSections(sections.filter(x => x.id !== s.id)) }}
                  style={{ fontSize:12, padding:'5px 12px', borderRadius:50, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer' }}>حذف</button>
              </div>
            </div>
          ))}
          {sections.length === 0 && <div style={{ textAlign:'center', color:'var(--gray400)', fontSize:13, padding:32 }}>لا توجد أقسام بعد</div>}
        </div>
      )}
    </div>
  )
}

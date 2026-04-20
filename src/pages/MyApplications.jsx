import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Calendar, ChevronRight } from 'lucide-react'
import { applicationsApi } from '../services/api.js'

function timeAgo(iso) {
  if (!iso) return null
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)   return 'منذ لحظات'
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`
  return `منذ ${Math.floor(diff / 86400)} يوم`
}

const STATUS = {
  sent:        { bg:'rgba(59,130,246,0.08)',  color:'#1D4ED8', border:'rgba(59,130,246,0.2)',  label:'تم الإرسال',              dot:'#3B82F6' },
  viewed:      { bg:'rgba(139,92,246,0.08)',  color:'#6D28D9', border:'rgba(139,92,246,0.2)',  label:'تم الاطلاع',             dot:'#8B5CF6' },
  shortlisted: { bg:'rgba(16,185,129,0.08)',  color:'#065F46', border:'rgba(16,185,129,0.2)',  label:'في القائمة المختصرة',    dot:'#10B981' },
  reviewed:    { bg:'rgba(234,179,8,0.08)',   color:'#92400E', border:'rgba(234,179,8,0.2)',   label:'قيد المراجعة',           dot:'#EAB308' },
  interview:   { bg:'rgba(249,115,22,0.08)',  color:'#9A3412', border:'rgba(249,115,22,0.2)',  label:'مقابلة',                 dot:'#F97316' },
  accepted:    { bg:'rgba(22,163,74,0.08)',   color:'#15803D', border:'rgba(22,163,74,0.2)',   label:'مقبول',                  dot:'#16A34A' },
  rejected:    { bg:'rgba(220,38,38,0.08)',   color:'#B91C1C', border:'rgba(220,38,38,0.2)',   label:'مرفوض',                  dot:'#DC2626' },
  withdrawn:   { bg:'rgba(156,163,175,0.08)', color:'#6B7280', border:'rgba(156,163,175,0.2)', label:'منسحب',                  dot:'#9CA3AF' },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.sent
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      fontSize:12, fontWeight:600, padding:'5px 12px', borderRadius:50,
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      whiteSpace:'nowrap',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot, flexShrink:0 }} />
      {s.label}
    </span>
  )
}

export default function MyApplications() {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(null)
  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    applicationsApi.my()
      .then(r => setApps(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleWithdraw(id) {
    if (!confirm('هل تريد سحب هذا الطلب؟')) return
    setWithdrawing(id)
    try {
      await applicationsApi.withdraw(id)
      setApps(prev => prev.map(a => a.id === id ? { ...a, status:'withdrawn', status_label:'منسحب' } : a))
    } catch {}
    finally { setWithdrawing(null) }
  }

  const active = apps.filter(a => a.status !== 'withdrawn')
  const withdrawn = apps.filter(a => a.status === 'withdrawn')

  return (
    <div style={{ maxWidth:860, margin:'0 auto', padding:'100px 24px 64px', direction:'rtl', fontFamily:'var(--font-ar)' }}>
      <style>{`@keyframes viewedPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}`}</style>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'var(--g50)', border:'1.5px solid var(--g200)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Briefcase size={20} color="var(--g700)" />
        </div>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:'var(--g950)', margin:0 }}>طلباتي الوظيفية</h1>
          <p style={{ fontSize:13, color:'var(--gray400)', margin:0, marginTop:2 }}>{apps.length} طلب إجمالاً</p>
        </div>
      </div>

      {/* Status legend */}
      {!loading && apps.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, margin:'20px 0 32px', padding:'14px 18px', background:'var(--g50)', borderRadius:12, border:'1px solid var(--g100)' }}>
          <span style={{ fontSize:12, color:'var(--gray400)', marginLeft:4 }}>الحالات:</span>
          {['sent','viewed','shortlisted','interview','accepted','rejected'].map(s => (
            <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:STATUS[s].color }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:STATUS[s].dot }} />
              {STATUS[s].label}
            </span>
          ))}
        </div>
      )}

      {!isAuth && (
        <div style={{ background:'var(--g50)', border:'1.5px solid var(--g200)', borderRadius:16, padding:'32px 24px', textAlign:'center', color:'var(--g700)', fontSize:15 }}>
          يتطلب تسجيل الدخول لعرض طلباتك
        </div>
      )}

      {isAuth && loading && (
        <div style={{ textAlign:'center', color:'var(--gray400)', padding:64, fontSize:14 }}>جارٍ التحميل…</div>
      )}

      {isAuth && !loading && apps.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 24px', background:'var(--white)', borderRadius:16, border:'1.5px solid var(--gray200)' }}>
          <div style={{ fontSize:52, marginBottom:16 }}>📋</div>
          <h2 style={{ fontSize:18, fontWeight:700, color:'var(--g900)', marginBottom:8 }}>لم تقدّم على أي وظيفة بعد</h2>
          <p style={{ color:'var(--gray400)', fontSize:14, marginBottom:24 }}>ابدأ بتصفح الوظائف المتاحة وقدّم على ما يناسبك</p>
          <Link to="/" style={{ background:'var(--g900)', color:'#fff', padding:'11px 28px', borderRadius:10, textDecoration:'none', fontSize:14, fontWeight:600 }}>
            استعرض الوظائف ←
          </Link>
        </div>
      )}

      {isAuth && !loading && active.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
          {active.map(app => (
            <AppCard key={app.id} app={app} onWithdraw={handleWithdraw} withdrawing={withdrawing} />
          ))}
        </div>
      )}

      {isAuth && !loading && withdrawn.length > 0 && (
        <>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--gray400)', marginBottom:10, marginTop:8 }}>الطلبات المسحوبة</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {withdrawn.map(app => (
              <AppCard key={app.id} app={app} onWithdraw={handleWithdraw} withdrawing={withdrawing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AppCard({ app, onWithdraw, withdrawing }) {
  const [hovered, setHovered] = useState(false)
  const canWithdraw = !['withdrawn','rejected','accepted'].includes(app.status)
  const viewedStr = app.viewed_at ? timeAgo(app.viewed_at) : null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:12,
        background:'var(--white)',
        border:`1.5px solid ${hovered ? 'var(--g300)' : 'rgba(0,0,0,0.07)'}`,
        borderRadius:14, padding:'16px 20px',
        transition:'all 0.2s',
        boxShadow: hovered ? '0 4px 18px rgba(0,61,43,0.07)' : 'none',
        opacity: app.status === 'withdrawn' ? 0.6 : 1,
      }}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <Link
          to={`/jobs/${app.job_id || ''}`}
          style={{ fontWeight:700, fontSize:15, color:'var(--g950)', textDecoration:'none', display:'block',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginBottom:4 }}
          onMouseEnter={e => e.currentTarget.style.color='var(--g600)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--g950)'}
        >
          {app.job_title || 'وظيفة محذوفة'}
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          {app.company && (
            <span style={{ fontSize:12, color:'var(--gray600)', fontWeight:500 }}>{app.company}</span>
          )}
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--gray400)' }}>
            <Calendar size={11} /> {app.applied_at}
          </span>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
        <StatusBadge status={app.status} />
        {viewedStr && (
          <span style={{
            fontSize:11, fontWeight:600, color:'#6D28D9',
            background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)',
            borderRadius:50, padding:'3px 10px', display:'inline-flex', alignItems:'center', gap:5,
          }}>
            <span style={{
              width:6, height:6, borderRadius:'50%', background:'#8B5CF6', flexShrink:0,
              animation:'viewedPulse 1.8s ease-in-out infinite',
            }}/>
            شوهدت {viewedStr}
          </span>
        )}

        {app.tracking_token && (
          <Link
            to={`/track/${app.tracking_token}`}
            style={{ display:'flex', alignItems:'center', gap:3, fontSize:12, color:'var(--g600)', textDecoration:'none', fontWeight:600 }}
            onMouseEnter={e => e.currentTarget.style.color='var(--g800)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--g600)'}
          >
            تتبع <ChevronRight size={13} />
          </Link>
        )}

        {canWithdraw && (
          <button
            onClick={() => onWithdraw(app.id)}
            disabled={withdrawing === app.id}
            style={{
              fontSize:12, fontWeight:600, padding:'5px 12px', borderRadius:8,
              border:'1.5px solid rgba(220,38,38,0.25)', background:'rgba(220,38,38,0.05)',
              color:'#B91C1C', cursor: withdrawing === app.id ? 'not-allowed' : 'pointer',
              transition:'all 0.2s', opacity: withdrawing === app.id ? 0.6 : 1,
              fontFamily:'var(--font-ar)',
            }}
            onMouseEnter={e => { if (withdrawing !== app.id) { e.currentTarget.style.background='rgba(220,38,38,0.1)'; e.currentTarget.style.borderColor='rgba(220,38,38,0.4)' }}}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(220,38,38,0.05)'; e.currentTarget.style.borderColor='rgba(220,38,38,0.25)' }}
          >
            {withdrawing === app.id ? '...' : 'سحب الطلب'}
          </button>
        )}
      </div>
    </div>
  )
}

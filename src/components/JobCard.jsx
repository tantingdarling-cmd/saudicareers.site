import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, Coins, ArrowLeft, Heart, Building2, Bell, Share2, CheckCircle } from 'lucide-react'
import { savedJobsApi, alertsApi } from '../services/api.js'

/* توحيد أسلوب الأزرار — يُدمج مع أي خصائص إضافية */
const CARD_EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'

function createButtonStyle(overrides = {}) {
  return {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-ar)',
    transition: `all 0.4s ${CARD_EASE}`,
    ...overrides,
  }
}

export default function JobCard({ job, onApply, onDetails, onTagClick, delay = 0, variant }) {
  const isGov = variant === 'government'
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const isSavedInit = () => {
    try { return JSON.parse(localStorage.getItem('saved_jobs') || '[]').includes(job.id) }
    catch { return false }
  }
  const [saved, setSaved]     = useState(isSavedInit)
  const [toast, setToast]     = useState('')
  const [bellDone, setBellDone] = useState(false)
  const [shareDone, setShareDone] = useState(false)

  function shareJob(e) {
    e.preventDefault(); e.stopPropagation()
    const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
    const url = `${window.location.origin}/jobs/${job.id}${user?.id ? `?ref=${user.id}` : ''}`
    navigator.clipboard.writeText(url).then(() => {
      setShareDone(true)
      setToast('تم نسخ الرابط ✓')
      setTimeout(() => { setShareDone(false); setToast('') }, 2500)
    }).catch(() => {
      setToast('فشل النسخ')
      setTimeout(() => setToast(''), 2000)
    })
  }

  async function quickAlert(e) {
    e.preventDefault(); e.stopPropagation()
    const token = localStorage.getItem('auth_token')
    if (!token) {
      sessionStorage.setItem('alert_prefill', JSON.stringify({ q: job.title }))
      navigate('/alerts')
      return
    }
    try {
      await alertsApi.create({ keyword: job.title, frequency: 'instant' })
      setBellDone(true)
      setToast('تم إنشاء التنبيه ✓')
      setTimeout(() => setToast(''), 2500)
    } catch {
      setToast('فشل إنشاء التنبيه')
      setTimeout(() => setToast(''), 2000)
    }
  }

  function toggleSave(e) {
    e.preventDefault(); e.stopPropagation()
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setToast('سجّل دخولك أولاً')
      setTimeout(() => setToast(''), 2500)
      return
    }
    const list = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
    const next = saved ? list.filter(id => id !== job.id) : [...list, job.id]
    localStorage.setItem('saved_jobs', JSON.stringify(next))
    setSaved(!saved)
    if (!saved) { setToast('تم الحفظ ✓'); setTimeout(() => setToast(''), 2000) }
    saved ? savedJobsApi.unsave(job.id).catch(() => {}) : savedJobsApi.save(job.id).catch(() => {})
  }

  const badgeColors = {
    hot: { bg:'rgba(220,38,38,0.08)', color:'#B91C1C', border:'rgba(220,38,38,0.15)' },
    new: { bg:'var(--gold100)', color:'var(--gold700)', border:'rgba(197,160,89,0.25)' },
    featured: { bg:'var(--g50)', color:'var(--g700)', border:'var(--g200)' },
  }
  const bc = badgeColors[job.badge] || {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        background: isGov
          ? 'linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(135deg, #006644, #C5A059) border-box'
          : 'var(--white)',
        border: isGov
          ? '1px solid transparent'
          : hovered ? '0.5px solid var(--g500)' : '0.5px solid rgba(0,0,0,0.10)',
        borderRadius:20,
        padding:24,
        display:'flex', flexDirection:'column',
        transition:`all 0.4s ${CARD_EASE}`,
        transform: pressed ? 'scale(0.97)' : hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isGov
          ? hovered
            ? '0 20px 60px rgba(0,102,68,0.14), 0 8px 24px rgba(0,102,68,0.08), 0 2px 6px rgba(0,0,0,0.05)'
            : '0 2px 8px rgba(0,102,68,0.07), 0 1px 2px rgba(0,0,0,0.03)'
          : hovered
            ? '0 24px 64px rgba(0,61,43,0.11), 0 8px 24px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.04), 0 0.5px 1px rgba(197,160,89,0.12)'
            : '0 2px 8px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03), 0 0.5px 1px rgba(0,0,0,0.02)',
        animationDelay: `${delay}ms`,
        position: 'relative',
        cursor: 'default',
      }}>

      {/* Save toast */}
      {toast && (
        <div style={{
          position:'absolute', top:12, left:12, zIndex:10,
          background:'var(--g900)', color:'#fff',
          padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600,
          pointerEvents:'none',
        }}>{toast}</div>
      )}

      {/* Government priority strip */}
      {isGov && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'20px 20px 0 0',
          background:'linear-gradient(90deg, #006644, #C5A059)',
        }} />
      )}

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:46, height:46, borderRadius:'var(--r-sm)',
            background: isGov ? 'rgba(0,102,68,0.08)' : 'var(--g50)',
            border: isGov ? '1px solid rgba(0,102,68,0.18)' : '1px solid var(--g100)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, flexShrink:0,
          }}>
            {isGov ? <Building2 size={22} style={{ color:'#006644' }} /> : job.icon}
          </div>
          <div>
            {job.company_slug ? (
              <Link
                to={`/company/${job.company_slug}`}
                style={{ fontSize:13, fontWeight:600, color:'var(--g800)', textDecoration:'none' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--g500)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--g800)'}
                onClick={e => e.stopPropagation()}
              >{job.company}</Link>
            ) : (
              <div style={{ fontSize:13, fontWeight:600, color:'var(--g800)' }}>{job.company}</div>
            )}
            <div style={{ fontSize:11, color:'var(--gray400)', marginTop:2 }}>{job.posted}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          {isGov && (
            <span style={{
              fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:50,
              whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:4,
              background:'rgba(0,102,68,0.08)', color:'#006644', border:'1px solid rgba(0,102,68,0.2)',
            }}>
              <CheckCircle size={10} /> مصدر رسمي موثق
            </span>
          )}
          {job.badge && (
            <span style={{
              fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:50,
              whiteSpace:'nowrap',
              background:bc.bg, color:bc.color, border:`1px solid ${bc.border}`,
            }}>{job.badgeText}</span>
          )}
          <button
            onClick={shareJob}
            aria-label="مشاركة الوظيفة"
            title="مشاركة الوظيفة"
            style={createButtonStyle({
              width:32, height:32, borderRadius:'50%', padding:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: shareDone ? 'rgba(0,102,68,0.1)' : 'var(--gray100)',
              color: shareDone ? 'var(--g700)' : 'var(--gray400)',
            })}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,102,68,0.08)'; e.currentTarget.style.color = 'var(--g700)' }}
            onMouseLeave={e => { e.currentTarget.style.background = shareDone ? 'rgba(0,102,68,0.1)' : 'var(--gray100)'; e.currentTarget.style.color = shareDone ? 'var(--g700)' : 'var(--gray400)' }}
          >
            <Share2 size={14} />
          </button>
          <button
            onClick={quickAlert}
            aria-label="تنبيه فوري"
            title={bellDone ? 'تنبيه مفعّل' : 'تنبيه عند نشر وظائف مشابهة'}
            style={createButtonStyle({
              width:32, height:32, borderRadius:'50%', padding:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: bellDone ? 'rgba(0,102,68,0.1)' : 'var(--gray100)',
              color: bellDone ? 'var(--g700)' : 'var(--gray400)',
            })}
            onMouseEnter={e => { e.currentTarget.style.background = bellDone ? 'rgba(0,102,68,0.18)' : 'rgba(0,102,68,0.08)'; e.currentTarget.style.color = 'var(--g700)' }}
            onMouseLeave={e => { e.currentTarget.style.background = bellDone ? 'rgba(0,102,68,0.1)' : 'var(--gray100)'; e.currentTarget.style.color = bellDone ? 'var(--g700)' : 'var(--gray400)' }}
          >
            <Bell size={14} fill={bellDone ? 'var(--g700)' : 'none'} />
          </button>
          <button
            onClick={toggleSave}
            data-testid="save-job-btn"
            aria-label={saved ? 'إلغاء الحفظ' : 'حفظ الوظيفة'}
            style={createButtonStyle({
              width:32, height:32, borderRadius:'50%', padding:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: saved ? 'rgba(220,38,38,0.08)' : 'var(--gray100)',
              color: saved ? '#DC2626' : 'var(--gray400)',
            })}
            onMouseEnter={e => { e.currentTarget.style.background = saved ? 'rgba(220,38,38,0.15)' : 'var(--g50)' }}
            onMouseLeave={e => { e.currentTarget.style.background = saved ? 'rgba(220,38,38,0.08)' : 'var(--gray100)' }}
          >
            <Heart size={15} fill={saved ? '#DC2626' : 'none'} />
          </button>
        </div>
      </div>

      {/* Title — clickable link to job detail */}
      <Link
        to={`/jobs/${job.id}`}
        style={{
          fontSize:16, fontWeight:700, color:'var(--g950)', marginBottom:14,
          lineHeight:1.35, textDecoration:'none', display:'block',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--g600)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--g950)'}
      >
        {job.title}
      </Link>

      {/* Meta */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16 }}>
        {[
          { Icon: MapPin, text: job.location, gold: false },
          { Icon: Briefcase, text: job.type, gold: true },
        ].map(({ Icon, text, gold }) => (
          <span key={text} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--gray600)' }}>
            <Icon size={13} style={{ color: gold ? 'var(--gold600)' : 'var(--gray400)', flexShrink:0 }} />{text}
          </span>
        ))}
      </div>

      {/* Description reveal on hover */}
      {job.description && (
        <div style={{
          overflow:'hidden',
          maxHeight: hovered ? 72 : 0,
          opacity: hovered ? 1 : 0,
          transition:'max-height 0.42s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease',
          marginBottom: hovered ? 12 : 0,
        }}>
          <p style={{ fontSize:12.5, color:'var(--gray500)', lineHeight:1.75, margin:0,
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {String(job.description).replace(/<[^>]+>/g, '')}
          </p>
        </div>
      )}

      {/* Skill Tags — قابلة للنقر للتصفية */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {job.tags.map(t => (
          <button
            key={t}
            onClick={() => onTagClick?.(t)}
            onPointerDown={e => { e.currentTarget.style.transform='scale(0.94)' }}
            onPointerUp={e => { e.currentTarget.style.transform='scale(1)' }}
            onPointerLeave={e => { e.currentTarget.style.transform='scale(1)' }}
            style={createButtonStyle({
              fontSize:11, fontWeight:500, padding:'4px 10px',
              background:'var(--gray100)', color:'var(--gray600)',
              borderRadius:50,
              cursor: onTagClick ? 'pointer' : 'default',
            })}
            onMouseEnter={e => { if (onTagClick) { e.currentTarget.style.background='var(--g50)'; e.currentTarget.style.color='var(--g700)' }}}
            onMouseLeave={e => { e.currentTarget.style.background='var(--gray100)'; e.currentTarget.style.color='var(--gray600)' }}
          >{t}</button>
        ))}
      </div>

      {/* Salary */}
      <div style={{ marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
        <Coins size={14} style={{ color:'var(--gold600)', flexShrink:0, filter:'drop-shadow(0 1px 2px rgba(197,160,89,0.35))' }} />
        <span style={{ fontSize:15, fontWeight:700, color:'var(--g800)', fontFamily:'var(--font-en)', letterSpacing:'0.2px' }}>
          {job.salary}
        </span>
        {job.salary === 'يُحدد عند التواصل' && (
          <span style={{ fontSize:11, color:'var(--gray400)', fontFamily:'var(--font-ar)' }}>/ شهرياً</span>
        )}
      </div>

      {/* Actions — hover-reveal Quick Apply */}
      <div style={{ marginTop:'auto', position:'relative' }}>
        {/* Default state: details link */}
        <div style={{
          display:'flex', gap:8,
          opacity: hovered ? 0 : 1,
          transform: hovered ? 'translateY(6px)' : 'translateY(0)',
          transition:`opacity 0.4s ${CARD_EASE}, transform 0.4s ${CARD_EASE}`,
          pointerEvents: hovered ? 'none' : 'auto',
        }}>
          {onDetails ? (
            <button
              onClick={() => onDetails(job)}
              style={createButtonStyle({
                flex:1, padding:'10px 0',
                background:'transparent', color:'var(--g700)',
                border:'0.5px solid var(--g300)', borderRadius:'var(--r-md)',
                fontSize:13, fontWeight:600,
              })}
              onMouseEnter={e => { e.currentTarget.style.background='var(--g50)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent' }}
            >
              <ArrowLeft size={13} style={{ display:'inline', marginLeft:4 }} /> عرض التفاصيل
            </button>
          ) : (
            <Link
              to={`/jobs/${job.id}`}
              style={{
                flex:1, padding:'10px 0', textAlign:'center',
                background:'transparent', color:'var(--g700)',
                border:'0.5px solid var(--g300)', borderRadius:'var(--r-md)',
                fontSize:13, fontWeight:600, textDecoration:'none', display:'block',
              }}
            >
              عرض التفاصيل
            </Link>
          )}
        </div>
        {/* Hover state: consolidated Quick Apply */}
        <div style={{
          position:'absolute', inset:0,
          display:'flex', gap:8,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition:`opacity 0.4s ${CARD_EASE} 0.06s, transform 0.4s ${CARD_EASE} 0.06s`,
          pointerEvents: hovered ? 'auto' : 'none',
        }}>
          <button
            onClick={() => onApply(job)}
            onPointerDown={e => e.currentTarget.style.transform='scale(0.97)'}
            onPointerUp={e => e.currentTarget.style.transform='scale(1)'}
            onPointerLeave={e => e.currentTarget.style.transform='scale(1)'}
            style={createButtonStyle({
              flex:1, padding:'11px 0',
              background:'linear-gradient(135deg, var(--g800) 0%, var(--g950) 100%)',
              color:'var(--white)', borderRadius:'var(--r-md)',
              fontSize:14, fontWeight:700,
              boxShadow:'0 4px 16px rgba(0,61,43,0.28)',
              letterSpacing:'0.2px',
            })}
          >
            ⚡ تقديم سريع
          </button>
          {onDetails ? (
            <button
              onClick={() => onDetails(job)}
              style={createButtonStyle({
                padding:'11px 14px',
                background:'transparent', color:'var(--g700)',
                border:'0.5px solid var(--g300)', borderRadius:'var(--r-md)',
                fontSize:13, fontWeight:600,
              })}
            >
              <ArrowLeft size={13} />
            </button>
          ) : (
            <Link
              to={`/jobs/${job.id}`}
              style={{
                padding:'11px 14px', display:'flex', alignItems:'center',
                background:'transparent', color:'var(--g700)',
                border:'0.5px solid var(--g300)', borderRadius:'var(--r-md)',
                fontSize:13, fontWeight:600, textDecoration:'none',
              }}
            >
              <ArrowLeft size={13} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

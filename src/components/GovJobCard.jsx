import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Coins, ArrowLeft, Heart, Building2, Flame } from 'lucide-react'
import { savedJobsApi } from '../services/api.js'

export default function GovJobCard({ job, onApply, onDetails, onTagClick, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed]   = useState(false)

  const isSavedInit = () => {
    try { return JSON.parse(localStorage.getItem('saved_jobs') || '[]').includes(job.id) }
    catch { return false }
  }
  const [saved, setSaved] = useState(isSavedInit)
  const [toast, setToast] = useState('')

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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      style={{
        background: 'linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(135deg, #003D2B, #C5A059) border-box',
        border: '1.5px solid transparent',
        borderRadius: 20,
        padding: 24,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.45s cubic-bezier(0.32,0.72,0,1)',
        transform: pressed ? 'scale(0.97)' : hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px rgba(0,61,43,0.22), 0 4px 16px rgba(197,160,89,0.16)'
          : '0 4px 20px rgba(0,61,43,0.10)',
        animationDelay: `${delay}ms`,
        position: 'relative',
        cursor: 'default',
      }}>

      {/* Gradient top strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        borderRadius: '20px 20px 0 0',
        background: 'linear-gradient(90deg, #003D2B, #C5A059)',
      }} />

      {/* Urgent dot */}
      {job.is_urgent && (
        <div style={{
          position: 'absolute', top: 14, left: 14,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 50, padding: '3px 10px',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#DC2626', display: 'block',
            boxShadow: '0 0 0 3px rgba(220,38,38,0.2)',
            animation: 'urgentPulse 1.8s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626' }}>مستعجل</span>
        </div>
      )}

      {/* Save toast */}
      {toast && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 10,
          background: 'var(--g900)', color: '#fff',
          padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, marginTop: job.is_urgent ? 28 : 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-sm)',
            background: 'rgba(0,61,43,0.06)', border: '1px solid rgba(0,61,43,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Building2 size={22} style={{ color: '#003D2B' }} />
          </div>
          <div>
            {job.company_slug ? (
              <Link
                to={`/company/${job.company_slug}`}
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#003D2B'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--g800)'}
                onClick={e => e.stopPropagation()}
              >{job.company}</Link>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>{job.company}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 2 }}>{job.posted}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Gov partner badge */}
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 50,
            whiteSpace: 'nowrap',
            background: 'rgba(0,61,43,0.08)', color: '#003D2B',
            border: '1px solid rgba(0,61,43,0.2)',
          }}>🏛️ شريك حكومي معتمد</span>
          <button
            onClick={toggleSave}
            data-testid="save-gov-job-btn"
            aria-label={saved ? 'إلغاء الحفظ' : 'حفظ الوظيفة'}
            style={{
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ar)',
              width: 32, height: 32, borderRadius: '50%', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: saved ? 'rgba(220,38,38,0.08)' : 'var(--gray100)',
              color: saved ? '#DC2626' : 'var(--gray400)',
              transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = saved ? 'rgba(220,38,38,0.15)' : 'rgba(0,61,43,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = saved ? 'rgba(220,38,38,0.08)' : 'var(--gray100)' }}
          >
            <Heart size={15} fill={saved ? '#DC2626' : 'none'} />
          </button>
        </div>
      </div>

      {/* Title */}
      <Link
        to={`/jobs/${job.id}`}
        style={{
          fontSize: 16, fontWeight: 700, color: 'var(--g950)', marginBottom: 14,
          lineHeight: 1.35, textDecoration: 'none', display: 'block',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#003D2B'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--g950)'}
      >
        {job.title}
      </Link>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {[
          { Icon: MapPin, text: job.location },
          { Icon: Briefcase, text: job.type },
        ].map(({ Icon, text }) => text && (
          <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--gray600)' }}>
            <Icon size={13} style={{ opacity: 0.65 }} />{text}
          </span>
        ))}
      </div>

      {/* Skill Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {job.tags.map(t => (
          <button
            key={t}
            onClick={() => onTagClick?.(t)}
            onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.94)' }}
            onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
            onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            style={{
              border: 'none', cursor: onTagClick ? 'pointer' : 'default',
              fontFamily: 'var(--font-ar)', transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
              fontSize: 11, fontWeight: 500, padding: '4px 10px',
              background: 'rgba(0,61,43,0.06)', color: '#003D2B',
              borderRadius: 50,
            }}
            onMouseEnter={e => { if (onTagClick) e.currentTarget.style.background = 'rgba(0,61,43,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,61,43,0.06)' }}
          >{t}</button>
        ))}
      </div>

      {/* Salary */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Coins size={15} style={{ color: 'var(--gold500)' }} />
          {job.salary} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray400)' }}>ر.س / شهرياً</span>
        </div>
        {job.salary_min && job.salary_max && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50,
            background: 'rgba(22,163,74,0.08)', color: '#15803D', border: '1px solid rgba(22,163,74,0.2)',
          }}>
            متوسط: {Math.round((job.salary_min + job.salary_max) / 2).toLocaleString('en')} ر.س
          </span>
        )}
      </div>

      {/* Trust line */}
      <div style={{
        fontSize: 11, color: '#003D2B', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16,
        background: 'rgba(0,61,43,0.05)', border: '1px solid rgba(0,61,43,0.12)',
        borderRadius: 8, padding: '6px 10px',
      }}>
        <span style={{ fontSize: 13 }}>✓</span> معلن رسميًا عبر سعودي كاريرز
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={() => onApply(job)}
          onPointerDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            flex: 1, padding: '11px 0',
            background: 'linear-gradient(135deg, #003D2B 0%, #006644 100%)',
            color: 'var(--white)', border: 'none', borderRadius: 'var(--r-md)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-ar)',
            transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #002A1E 0%, #004d33 100%)'}
          onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #003D2B 0%, #006644 100%)'}
        >
          {(job.is_government_partner || !job.apply_url) ? 'قدّم عبر المنصة' : 'التقديم ←'}
        </button>
        {onDetails ? (
          <button
            onClick={() => onDetails(job)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '11px 14px', background: 'rgba(0,61,43,0.06)', color: '#003D2B',
              border: '1.5px solid rgba(0,61,43,0.2)', borderRadius: 'var(--r-md)',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
              fontFamily: 'var(--font-ar)',
              transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,61,43,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,61,43,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,61,43,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,61,43,0.2)' }}
          >
            <ArrowLeft size={13} /> التفاصيل
          </button>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '11px 14px', background: 'rgba(0,61,43,0.06)', color: '#003D2B',
              border: '1.5px solid rgba(0,61,43,0.2)', borderRadius: 'var(--r-md)',
              fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,61,43,0.12)'; e.currentTarget.style.borderColor = 'rgba(0,61,43,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,61,43,0.06)'; e.currentTarget.style.borderColor = 'rgba(0,61,43,0.2)' }}
          >
            <ArrowLeft size={13} /> التفاصيل
          </Link>
        )}
      </div>

      <style>{`
        @keyframes urgentPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(220,38,38,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(220,38,38,0.08); }
        }
      `}</style>
    </div>
  )
}

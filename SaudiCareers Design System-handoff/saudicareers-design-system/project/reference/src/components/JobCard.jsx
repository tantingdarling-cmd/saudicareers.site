import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Coins, ArrowLeft } from 'lucide-react'

/* توحيد أسلوب الأزرار — يُدمج مع أي خصائص إضافية */
function createButtonStyle(overrides = {}) {
  return {
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-ar)',
    transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)',
    ...overrides,
  }
}

export default function JobCard({ job, onApply, onDetails, onTagClick, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

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
        background:'var(--white)',
        border: hovered ? '1.5px solid var(--g400)' : '1.5px solid var(--gray200)',
        borderRadius:20,
        padding:24,
        display:'flex', flexDirection:'column',
        transition:'all 0.45s cubic-bezier(0.32,0.72,0,1)',
        transform: pressed ? 'scale(0.97)' : hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : '0 8px 32px rgba(0,0,0,0.08)',
        animationDelay: `${delay}ms`,
        position: 'relative',
        cursor: 'default',
      }}>

      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:46, height:46, borderRadius:'var(--r-sm)',
            background:'var(--g50)', border:'1px solid var(--g100)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, flexShrink:0,
          }}>{job.icon}</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--g800)' }}>{job.company}</div>
            <div style={{ fontSize:11, color:'var(--gray400)', marginTop:2 }}>{job.posted}</div>
          </div>
        </div>
        {job.badge && (
          <span style={{
            fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:50,
            whiteSpace:'nowrap', flexShrink:0,
            background:bc.bg, color:bc.color, border:`1px solid ${bc.border}`,
          }}>{job.badgeText}</span>
        )}
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
          { Icon: MapPin, text: job.location },
          { Icon: Briefcase, text: job.type },
        ].map(({ Icon, text }) => (
          <span key={text} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--gray600)' }}>
            <Icon size={13} style={{ opacity:0.65 }} />{text}
          </span>
        ))}
      </div>

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
      <div style={{ fontSize:15, fontWeight:700, color:'var(--g800)', marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
        <Coins size={15} style={{ color:'var(--gold500)' }} />
        {job.salary} <span style={{ fontSize:12, fontWeight:400, color:'var(--gray400)' }}>ر.س / شهرياً</span>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:'auto' }}>
        <button
          onClick={() => onApply(job)}
          onPointerDown={e => e.currentTarget.style.transform='scale(0.98)'}
          onPointerUp={e => e.currentTarget.style.transform='scale(1)'}
          onPointerLeave={e => e.currentTarget.style.transform='scale(1)'}
          style={createButtonStyle({
            flex:1, padding:'11px 0',
            background:'linear-gradient(135deg, var(--g900) 0%, var(--g950) 100%)',
            color:'var(--white)', borderRadius:'var(--r-md)',
            fontSize:14, fontWeight:600,
          })}
          onMouseEnter={e => e.currentTarget.style.background='var(--g700)'}
          onMouseLeave={e => e.currentTarget.style.background='linear-gradient(135deg, var(--g900) 0%, var(--g950) 100%)'}
        >
          التقديم ←
        </button>
        {onDetails ? (
          <button
            onClick={() => onDetails(job)}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              padding:'11px 14px', background:'var(--g50)', color:'var(--g800)',
              border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)',
              fontSize:13, fontWeight:600, whiteSpace:'nowrap', cursor:'pointer',
              transition:'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--g100)'; e.currentTarget.style.borderColor='var(--g400)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--g50)'; e.currentTarget.style.borderColor='var(--g200)' }}
          >
            <ArrowLeft size={13} /> التفاصيل
          </button>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              padding:'11px 14px', background:'var(--g50)', color:'var(--g800)',
              border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)',
              fontSize:13, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap',
              transition:'all 0.3s cubic-bezier(0.32,0.72,0,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--g100)'; e.currentTarget.style.borderColor='var(--g400)' }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--g50)'; e.currentTarget.style.borderColor='var(--g200)' }}
          >
            <ArrowLeft size={13} /> التفاصيل
          </Link>
        )}
      </div>
    </div>
  )
}

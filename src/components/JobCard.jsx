import { useState } from 'react'
import { MapPin, Briefcase, Coins } from 'lucide-react'

export default function JobCard({ job, onApply, delay = 0 }) {
  const [hovered, setHovered] = useState(false)

  const badgeColors = {
    hot: { bg:'rgba(220,38,38,0.08)', color:'#B91C1C', border:'rgba(220,38,38,0.15)' },
    new: { bg:'var(--gold100)', color:'var(--gold700)', border:'rgba(197,160,89,0.25)' },
    featured: { bg:'var(--g50)', color:'var(--g700)', border:'var(--g200)' },
  }
  const bc = badgeColors[job.badge] || {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:'var(--white)',
        border: hovered ? '1.5px solid var(--g400)' : '1.5px solid var(--gray200)',
        borderRadius:'var(--r-lg)',
        padding:24,
        display:'flex', flexDirection:'column',
        transition:'all 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        animationDelay: `${delay}ms`,
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

      {/* Title */}
      <div style={{ fontSize:16, fontWeight:700, color:'var(--g950)', marginBottom:14, lineHeight:1.35 }}>
        {job.title}
      </div>

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

      {/* Tags */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {job.tags.map(t => (
          <span key={t} style={{
            fontSize:11, fontWeight:500, padding:'4px 10px',
            background:'var(--gray100)', color:'var(--gray600)',
            borderRadius:50,
          }}>{t}</span>
        ))}
      </div>

      {/* Salary */}
      <div style={{ fontSize:15, fontWeight:700, color:'var(--g800)', marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
        <Coins size={15} style={{ color:'var(--gold500)' }} />
        {job.salary} <span style={{ fontSize:12, fontWeight:400, color:'var(--gray400)' }}>ر.س / شهرياً</span>
      </div>

      {/* Apply */}
      <button
        onClick={() => onApply(job)}
        style={{
          padding:'11px 0', background:'var(--g900)', color:'var(--white)',
          border:'none', borderRadius:'var(--r-md)',
          fontSize:14, fontWeight:600, marginTop:'auto',
          transition:'all 0.2s',
        }}
        onMouseEnter={e => e.target.style.background='var(--g700)'}
        onMouseLeave={e => e.target.style.background='var(--g900)'}
      >
        التقديم على الوظيفة ←
      </button>
    </div>
  )
}

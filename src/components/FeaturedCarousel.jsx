import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Coins, ChevronRight, ChevronLeft } from 'lucide-react'
import { jobsApi } from '../services/api.js'
import { normalizeJob } from '../utils/normalizeJob.js'

export default function FeaturedCarousel() {
  const [jobs, setJobs] = useState([])
  const trackRef = useRef(null)

  useEffect(() => {
    jobsApi.getFeatured()
      .then(res => {
        const data = res?.data || []
        if (data.length > 0) setJobs(data.map(normalizeJob))
      })
      .catch(() => {})
  }, [])

  if (jobs.length === 0) return null

  function scroll(dir) {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: 48, direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)' }}>
            ⭐ وظائف مميزة
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--g950)', marginTop: 4, marginBottom: 0 }}>
            فرص حصرية
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => scroll(1)} aria-label="سابق" style={{
            width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--gray200)',
            background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--g700)',
          }}><ChevronRight size={16} /></button>
          <button onClick={() => scroll(-1)} aria-label="تالي" style={{
            width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--gray200)',
            background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--g700)',
          }}><ChevronLeft size={16} /></button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8,
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {jobs.map(job => (
          <div key={job.id} style={{
            flexShrink: 0, width: 'clamp(240px, 30vw, 300px)',
            background: 'var(--white)', border: '1.5px solid var(--gray200)',
            borderRadius: 16, padding: '20px 18px',
            scrollSnapAlign: 'start',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {/* Top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: 'var(--g50)', border: '1px solid var(--g100)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{job.icon}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--g950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title}</div>
                <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 2 }}>{job.company}</div>
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {job.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray600)' }}>
                  <MapPin size={11} />{job.location}
                </span>
              )}
              {job.salary && job.salary !== 'يُحدد عند التواصل' && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray600)' }}>
                  <Coins size={11} />{job.salary} ر.س
                </span>
              )}
            </div>

            {/* Badge + CTA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                background: 'var(--gold100)', color: 'var(--gold700)',
                border: '1px solid rgba(197,160,89,0.25)',
              }}>حصرية</span>
              <Link to={`/jobs/${job.id}`} style={{
                fontSize: 12, fontWeight: 600, color: 'var(--g900)',
                textDecoration: 'none', padding: '6px 14px',
                border: '1.5px solid var(--g200)', borderRadius: 8,
                background: 'var(--g50)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--g100)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--g50)' }}
              >تفاصيل</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

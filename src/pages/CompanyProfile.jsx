import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Globe, Briefcase, ArrowLeft } from 'lucide-react'
import { companyApi } from '../services/api.js'

const JOB_TYPE_LABELS = {
  full_time: 'دوام كامل', part_time: 'دوام جزئي',
  contract: 'عقد', freelance: 'مستقل', internship: 'تدريب',
}

export default function CompanyProfile() {
  const { slug } = useParams()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    companyApi.getBySlug(slug)
      .then(data => setCompany(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--gray400)', fontSize: 15 }}>جاري التحميل…</div>
  )

  if (error || !company) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--gray400)', fontSize: 15 }}>لم يتم العثور على الشركة</div>
  )

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>

      {/* Hero */}
      <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)',
        borderRadius: 20, padding: '32px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ width: 72, height: 72, borderRadius: 16,
          background: 'var(--g50)', border: '1px solid var(--g100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, flexShrink: 0, overflow: 'hidden' }}>
          {company.logo
            ? <img src={company.logo} alt={company.name} loading="lazy" width="64" height="64" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🏢'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--g950)', marginBottom: 6 }}>{company.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {company.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--gray600)' }}>
                <MapPin size={13} style={{ opacity: 0.65 }} />{company.location}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--gray600)' }}>
              <Briefcase size={13} style={{ opacity: 0.65 }} />{company.active_jobs_count} وظيفة نشطة
            </span>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
                  color: 'var(--g600)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--g400)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--g600)'}>
                <Globe size={13} /> الموقع الرسمي
              </a>
            )}
          </div>
        </div>
      </div>

      {/* About */}
      {company.about && (
        <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)',
          borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g950)', marginBottom: 12 }}>عن الشركة</h2>
          <p style={{ fontSize: 14, color: 'var(--g700)', lineHeight: 1.8, margin: 0 }}>{company.about}</p>
        </div>
      )}

      {/* Jobs */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g950)', marginBottom: 16 }}>
          الوظائف المتاحة ({company.active_jobs_count})
        </h2>
        {company.jobs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 48, fontSize: 14 }}>
            لا توجد وظائف نشطة حالياً
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {company.jobs.map(job => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12, background: 'var(--white)',
                  border: '1.5px solid var(--gray200)', borderRadius: 14, padding: '16px 20px',
                  textDecoration: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--g400)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray200)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--g950)' }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 4, display: 'flex', gap: 10 }}>
                    {job.location && <span>{job.location}</span>}
                    {job.job_type && <span>{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>}
                    {job.posted_at && <span>{job.posted_at}</span>}
                  </div>
                </div>
                <ArrowLeft size={16} style={{ color: 'var(--g400)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

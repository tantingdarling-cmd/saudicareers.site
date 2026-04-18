import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Download, ChevronDown } from 'lucide-react'
import { employerApi } from '../services/api.js'

const STORAGE_BASE = (import.meta.env.VITE_API_URL || 'https://saudicareers.site/api').replace('/api', '')

const STATUS = {
  pending:   { label: 'قيد المراجعة', bg: 'rgba(234,179,8,0.12)',    color: '#B45309' },
  reviewed:  { label: 'تمت المراجعة', bg: 'rgba(59,130,246,0.12)',   color: '#1D4ED8' },
  interview: { label: 'مقابلة',        bg: 'rgba(139,92,246,0.12)',   color: '#7C3AED' },
  accepted:  { label: 'مقبول',         bg: 'rgba(22,163,74,0.12)',    color: '#15803D' },
  rejected:  { label: 'مرفوض',         bg: 'rgba(239,68,68,0.12)',    color: '#DC2626' },
  withdrawn: { label: 'انسحب',         bg: 'rgba(156,163,175,0.12)', color: '#6B7280' },
}

const STATUS_OPTIONS = ['pending', 'reviewed', 'interview', 'accepted', 'rejected', 'withdrawn']

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending
  return (
    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 50, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function StatusDropdown({ id, current, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function pick(status) {
    if (status === current) { setOpen(false); return }
    setLoading(true)
    try {
      await employerApi.updateApplicationStatus(id, status)
      onUpdate(id, status)
    } catch (_) {}
    setLoading(false)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: 'var(--g900)', color: '#fff', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          fontFamily: 'var(--font-ar)', minHeight: 36,
          transition: 'opacity 0.2s',
        }}
      >
        تحديث <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 20,
            background: 'var(--white)', border: '1.5px solid var(--gray200)',
            borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: 160, overflow: 'hidden',
          }}>
            {STATUS_OPTIONS.map(s => {
              const st = STATUS[s]
              return (
                <button
                  key={s}
                  onClick={() => pick(s)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'right',
                    padding: '10px 16px', fontSize: 13, fontWeight: s === current ? 700 : 500,
                    color: st.color, background: s === current ? st.bg : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ar)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (s !== current) e.currentTarget.style.background = st.bg }}
                  onMouseLeave={e => { if (s !== current) e.currentTarget.style.background = 'transparent' }}
                >
                  {st.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function EmployerApplicants() {
  const { id } = useParams()
  const [applications, setApplications] = useState([])
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) { setLoading(false); return }
    setLoading(true)
    const params = { page }
    if (filterStatus) params.status = filterStatus
    employerApi.getApplications(id, params)
      .then(res => {
        setApplications(res.data || [])
        setMeta(res.meta || null)
        if (res.job?.title) setJobTitle(res.job.title)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id, filterStatus, page])

  function handleUpdate(appId, newStatus) {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a))
  }

  const cell = { padding: '14px 16px', borderBottom: '1px solid var(--gray100)', verticalAlign: 'middle', fontSize: 14, color: 'var(--g950)' }
  const th = { padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--gray600)', background: 'var(--gray50)', textAlign: 'right', whiteSpace: 'nowrap' }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 16px 64px', direction: 'rtl' }}>
      {/* Back */}
      <Link to="/employer/dashboard" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: 'var(--gray600)', marginBottom: 24,
        textDecoration: 'none',
      }}>
        <ArrowRight size={15} /> العودة إلى لوحة التحكم
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--g950)', marginBottom: 4 }}>
          المتقدمون {jobTitle && <span style={{ color: 'var(--gray400)', fontWeight: 500, fontSize: 16 }}>— {jobTitle}</span>}
        </h1>
        {meta && (
          <p style={{ color: 'var(--gray400)', fontSize: 13 }}>{meta.total} طلب</p>
        )}
      </div>

      {!isAuth && (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 16, padding: '32px 24px', textAlign: 'center', color: 'var(--g700)' }}>
          يتطلب تسجيل الدخول كصاحب عمل
        </div>
      )}

      {isAuth && (
        <>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--gray600)', fontWeight: 600 }}>تصفية:</span>
            {[['', 'الكل'], ...STATUS_OPTIONS.map(s => [s, STATUS[s].label])].map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilterStatus(val); setPage(1) }}
                style={{
                  padding: '6px 16px', borderRadius: 50, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${filterStatus === val ? 'var(--g700)' : 'var(--gray200)'}`,
                  background: filterStatus === val ? 'var(--g900)' : 'var(--white)',
                  color: filterStatus === val ? '#fff' : 'var(--gray600)',
                  cursor: 'pointer', fontFamily: 'var(--font-ar)',
                  transition: 'all 0.2s', minHeight: 36,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 64, fontSize: 15 }}>جاري التحميل…</div>
          ) : applications.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 64, fontSize: 15 }}>لا توجد طلبات</div>
          ) : (
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1.5px solid var(--gray200)', background: 'var(--white)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['الاسم', 'البريد الإلكتروني', 'الحالة', 'السيرة الذاتية', 'تاريخ التقديم', 'الإجراء'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...cell, fontWeight: 600 }}>{app.name}</td>
                      <td style={{ ...cell, color: 'var(--gray600)', direction: 'ltr', textAlign: 'right' }}>{app.email}</td>
                      <td style={cell}><StatusBadge status={app.status} /></td>
                      <td style={cell}>
                        {app.cv_path ? (
                          <a
                            href={`${STORAGE_BASE}/storage/${app.cv_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              fontSize: 13, color: 'var(--g700)', fontWeight: 600,
                              textDecoration: 'none',
                              padding: '5px 12px', borderRadius: 8,
                              border: '1px solid var(--g200)', background: 'var(--g50)',
                              minHeight: 36,
                            }}
                          >
                            <Download size={13} /> تحميل
                          </a>
                        ) : (
                          <span style={{ color: 'var(--gray400)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td style={{ ...cell, color: 'var(--gray400)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {app.applied_at ? new Date(app.applied_at).toLocaleDateString('ar-SA') : '—'}
                      </td>
                      <td style={cell}>
                        <StatusDropdown id={app.id} current={app.status} onUpdate={handleUpdate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${p === page ? 'var(--g700)' : 'var(--gray200)'}`,
                  background: p === page ? 'var(--g900)' : 'var(--white)',
                  color: p === page ? '#fff' : 'var(--gray600)',
                  cursor: 'pointer', fontFamily: 'var(--font-ar)',
                }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

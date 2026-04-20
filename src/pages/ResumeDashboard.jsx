import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { TEMPLATE_LABELS, TEMPLATE_COMPONENTS } from '../components/ResumeTemplates.jsx'

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)   return `منذ ${m || 1} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24)   return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 30)   return `منذ ${d} يوم`
  return new Date(iso).toLocaleDateString('ar-SA')
}

function PreviewModal({ snapshot, onClose, onExport, exporting }) {
  const previewRef = useRef()
  const TplComp    = TEMPLATE_COMPONENTS[snapshot.template] || TEMPLATE_COMPONENTS.classic
  const data       = snapshot.full_data || {}

  useEffect(() => {
    const close = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: '860px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Modal header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--g900)', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>{snapshot.name}</span>
            <span style={{ marginRight: '10px', fontSize: '12px', background: 'var(--g50)', color: 'var(--g700)', padding: '2px 10px', borderRadius: '20px', fontFamily: 'var(--font-ar)' }}>{TEMPLATE_LABELS[snapshot.template]}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => onExport(previewRef, snapshot.name)}
              disabled={exporting}
              style={{ background: 'var(--g700)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '8px 16px', fontFamily: 'var(--font-ar)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: exporting ? 0.7 : 1 }}
            >
              {exporting ? 'جارٍ التصدير...' : 'تصدير PDF'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'var(--gray100)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        </div>

        {/* Template preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--gray50)' }}>
          <div style={{ background: '#fff', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div ref={previewRef}>
              <TplComp data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResumeCard({ snapshot, onPreview, onEdit, onDelete, onExport, exporting }) {
  const [hovered, setHovered] = useState(false)
  const [confirm, setConfirm] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirm(false) }}
      style={{
        background: 'linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(135deg, #003D2B, #C5A059) border-box',
        border: '1.5px solid transparent',
        borderRadius: 20,
        padding: 24,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.4s cubic-bezier(0.32,0.72,0,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(0,61,43,0.18), 0 4px 16px rgba(197,160,89,0.14)' : '0 4px 20px rgba(0,61,43,0.10)',
        position: 'relative',
        direction: 'rtl',
        fontFamily: 'var(--font-ar)',
      }}
    >
      {/* Gradient top strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0', background: 'linear-gradient(90deg, #003D2B, #C5A059)' }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 'var(--r-sm)', background: 'rgba(0,61,43,0.07)', border: '1px solid rgba(0,61,43,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            📄
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', lineHeight: 1.3 }}>{snapshot.name}</div>
            <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 3 }}>🕒 {relativeTime(snapshot.updated_at)}</div>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 50, background: 'rgba(0,61,43,0.08)', color: '#003D2B', border: '1px solid rgba(0,61,43,0.2)', whiteSpace: 'nowrap' }}>
          {TEMPLATE_LABELS[snapshot.template] || 'كلاسيك'}
        </span>
      </div>

      {/* Created at */}
      <div style={{ fontSize: 12, color: 'var(--gray600)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,61,43,0.04)', border: '1px solid rgba(0,61,43,0.1)', borderRadius: 8, padding: '6px 10px' }}>
        <span style={{ fontSize: 13 }}>✓</span> تم الإنشاء {relativeTime(snapshot.created_at)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
        <ActionBtn label="معاينة" onClick={() => onPreview(snapshot)} style={{ flex: 1, background: 'rgba(0,61,43,0.07)', color: '#003D2B', border: '1.5px solid rgba(0,61,43,0.2)' }} />
        <ActionBtn label="تعديل"  onClick={() => onEdit(snapshot)}    style={{ flex: 1, background: 'linear-gradient(135deg, #003D2B 0%, #006644 100%)', color: '#fff', border: 'none' }} />
        <ActionBtn
          label={exporting ? '...' : 'تصدير'}
          onClick={() => onExport(null, snapshot.name, snapshot)}
          disabled={exporting}
          style={{ background: 'rgba(0,61,43,0.07)', color: '#003D2B', border: '1.5px solid rgba(0,61,43,0.2)', padding: '9px 12px' }}
        />
        {confirm ? (
          <ActionBtn label="تأكيد الحذف" onClick={() => onDelete(snapshot.id)} style={{ background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1.5px solid rgba(220,38,38,0.3)', fontSize: 12, padding: '9px 10px' }} />
        ) : (
          <button onClick={() => setConfirm(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '9px 8px', color: 'var(--gray400)', lineHeight: 1 }} title="حذف">🗑️</button>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ label, onClick, style: extraStyle = {}, disabled = false }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ar)', transition: 'all 0.25s cubic-bezier(0.32,0.72,0,1)', opacity: disabled ? 0.6 : 1, filter: hov && !disabled ? 'brightness(0.92)' : 'none', ...extraStyle }}
    >
      {label}
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ResumeDashboard() {
  const navigate = useNavigate()
  const [resumes,     setResumes]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [previewSnap, setPreviewSnap] = useState(null)
  const [exporting,   setExporting]   = useState(false)

  const hiddenRef = useRef()

  useEffect(() => { loadResumes() }, [])

  async function loadResumes() {
    setLoading(true)
    try {
      const res = await api.get('/v1/profile/resumes')
      setResumes(res.data || [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function handleEdit(snapshot) {
    sessionStorage.setItem('resume_edit', JSON.stringify({
      id:       snapshot.id,
      name:     snapshot.name,
      template: snapshot.template,
      data:     snapshot.full_data || snapshot.data || {},
    }))
    navigate('/resume/editor')
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/v1/profile/resumes/${id}`)
      setResumes(prev => prev.filter(r => r.id !== id))
    } catch (e) { alert(e.message) }
  }

  async function handleExport(ref, name, snapshot) {
    setExporting(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF }       = await import('jspdf')

      let el = ref?.current
      if (!el && snapshot) {
        // render hidden template to export
        setPreviewSnap({ ...snapshot, _exporting: true })
        await new Promise(r => setTimeout(r, 300))
        el = hiddenRef.current
      }
      if (!el) return

      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = 210; const h = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      pdf.save(`${name || 'resume'}-${Date.now()}.pdf`)

      if (snapshot && !ref) setPreviewSnap(null)
    } catch { alert('فشل تصدير PDF') }
    finally { setExporting(false) }
  }

  function handlePreview(snapshot) {
    // Fetch full data if not already loaded
    if (!snapshot.full_data) {
      api.get(`/v1/profile/resumes/${snapshot.id}`)
        .then(res => setPreviewSnap({ ...snapshot, full_data: res.data || {} }))
        .catch(() => setPreviewSnap({ ...snapshot, full_data: {} }))
    } else {
      setPreviewSnap(snapshot)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', padding: '40px 24px', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--g900)', marginBottom: '6px' }}>📄 سيرتي الذاتية</h1>
            <p style={{ color: 'var(--gray600)', fontSize: '15px' }}>إدارة وحفظ نسخ متعددة من سيرتك الذاتية</p>
          </div>
          <button
            onClick={() => navigate('/resume/editor')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #003D2B 0%, #006644 100%)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', padding: '14px 24px', fontFamily: 'var(--font-ar)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,61,43,0.25)', transition: 'all 0.3s cubic-bezier(0.32,0.72,0,1)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: 18 }}>＋</span> إنشاء سيرة جديدة
          </button>
        </div>

        {/* States */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '200px', borderRadius: 20, background: 'var(--gray100)', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 'var(--r-lg)', padding: '20px', color: '#DC2626', textAlign: 'center', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!loading && !error && resumes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--g900)', marginBottom: '8px' }}>لا توجد سير ذاتية محفوظة</h2>
            <p style={{ color: 'var(--gray600)', marginBottom: '28px', fontSize: '15px' }}>ابدأ بإنشاء سيرتك الذاتية الأولى الآن</p>
            <button
              onClick={() => navigate('/resume/editor')}
              style={{ background: 'linear-gradient(135deg, #003D2B 0%, #006644 100%)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', padding: '14px 32px', fontFamily: 'var(--font-ar)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,61,43,0.25)' }}
            >
              ＋ إنشاء سيرة جديدة
            </button>
          </div>
        )}

        {!loading && resumes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {resumes.map(r => (
              <ResumeCard
                key={r.id}
                snapshot={r}
                onPreview={handlePreview}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
                exporting={exporting}
              />
            ))}
          </div>
        )}

        {/* Stats bar */}
        {resumes.length > 0 && (
          <div style={{ marginTop: '32px', padding: '16px 24px', background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <Stat label="إجمالي السير" value={resumes.length} />
            <Stat label="آخر تحديث" value={resumes[0] ? relativeTime(resumes[0].updated_at) : '—'} />
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewSnap && !previewSnap._exporting && (
        <PreviewModal
          snapshot={previewSnap}
          onClose={() => setPreviewSnap(null)}
          onExport={handleExport}
          exporting={exporting}
        />
      )}

      {/* Hidden div for card-level PDF export */}
      {previewSnap?._exporting && (() => {
        const TplComp = TEMPLATE_COMPONENTS[previewSnap.template] || TEMPLATE_COMPONENTS.classic
        return (
          <div ref={hiddenRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px' }}>
            <TplComp data={previewSnap.full_data || {}} />
          </div>
        )
      })()}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ direction: 'rtl', fontFamily: 'var(--font-ar)' }}>
      <div style={{ fontSize: '11px', color: 'var(--gray400)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--g800)' }}>{value}</div>
    </div>
  )
}

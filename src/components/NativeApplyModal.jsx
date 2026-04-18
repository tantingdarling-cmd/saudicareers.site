import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, CheckCircle, Loader, FileText, ExternalLink, Copy } from 'lucide-react'
import { applicationsApi } from '../services/api'

function TrackingLink({ token }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/track/${token}`
  return (
    <div style={{
      background:'var(--g50)', border:'1.5px solid var(--g100)',
      borderRadius:'var(--r-md)', padding:'14px 16px', marginBottom:20,
    }}>
      <div style={{ fontSize:12, fontWeight:700, color:'var(--g700)', marginBottom:8 }}>🔗 تتبّع حالة طلبك</div>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <Link to={`/track/${token}`} target="_blank" style={{
          flex:1, fontSize:11, color:'var(--g600)', fontWeight:500,
          background:'var(--white)', border:'1px solid var(--g200)',
          borderRadius:'var(--r-sm)', padding:'7px 10px',
          textDecoration:'none', display:'flex', alignItems:'center', gap:5,
        }}>
          <ExternalLink size={11} /> تتبّع الطلب
        </Link>
        <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }} style={{
          padding:'7px 12px', background: copied ? 'var(--g600)' : 'var(--white)',
          color: copied ? 'var(--white)' : 'var(--g700)',
          border:'1px solid var(--g200)', borderRadius:'var(--r-sm)',
          fontSize:11, fontWeight:600, cursor:'pointer', flexShrink:0,
          display:'flex', alignItems:'center', gap:4, transition:'all 0.2s',
        }}>
          {copied ? <><CheckCircle size={11} /> تم</> : <><Copy size={11} /> نسخ</>}
        </button>
      </div>
    </div>
  )
}

export default function NativeApplyModal({ job, onClose }) {
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null } })()
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [trackingToken, setTrackingToken] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const resumeFilename = user?.resume_path
    ? user.resume_path.split('/').pop()
    : null

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await applicationsApi.nativeApply(job.id, { cover_letter: coverLetter })
      setTrackingToken(res.tracking_token)
    } catch (e) {
      setError(e.message || 'حدث خطأ أثناء الإرسال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:500,
        background:'rgba(0,26,13,0.75)', backdropFilter:'blur(5px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'1rem', animation:'nFadeIn 0.2s ease',
      }}>
      <div style={{
        background:'var(--white)', borderRadius:'var(--r-xl)',
        width:'100%', maxWidth:460,
        padding:'clamp(24px,4vw,36px)',
        boxShadow:'var(--shadow-lg)', position:'relative',
        animation:'nSlideUp 0.3s ease', maxHeight:'92vh', overflowY:'auto',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:16, left:16,
          width:32, height:32, borderRadius:'50%',
          background:'var(--gray100)', border:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'var(--gray600)', cursor:'pointer', transition:'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background='var(--gray200)'}
        onMouseLeave={e => e.currentTarget.style.background='var(--gray100)'}>
          <X size={16} />
        </button>

        {trackingToken ? (
          <div style={{ textAlign:'center', padding:'20px 8px' }}>
            <div style={{ marginBottom:16, animation:'nCheckBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              <CheckCircle size={64} color="var(--g600)" strokeWidth={1.5} />
            </div>
            <div style={{ fontSize:21, fontWeight:700, color:'var(--g950)', marginBottom:6 }}>تم إرسال طلبك!</div>
            <div style={{ fontSize:14, color:'var(--gray600)', lineHeight:1.8, marginBottom:20 }}>
              سنراجع طلبك ونتواصل معك قريباً على بريدك الإلكتروني
            </div>
            <TrackingLink token={trackingToken} />
            <Link
              to={`/?category=${job?.category || 'all'}#jobs`}
              onClick={onClose}
              style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'12px 28px', background:'var(--g900)',
                color:'var(--white)', borderRadius:'var(--r-md)',
                fontSize:14, fontWeight:600, textDecoration:'none',
                transition:'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='var(--g700)'}
              onMouseLeave={e => e.currentTarget.style.background='var(--g900)'}
            >
              قدّم على وظائف مشابهة ←
            </Link>
          </div>
        ) : (
          <>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--g950)', marginBottom:4 }}>تقديم سريع</div>
            <div style={{ fontSize:13, color:'var(--gray400)', marginBottom:20 }}>بياناتك محفوظة — فقط أضف رسالة تعريفية اختيارية</div>

            {/* Job preview */}
            <div style={{ background:'var(--g50)', border:'1px solid var(--g100)', borderRadius:'var(--r-md)', padding:16, marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--g900)' }}>{job?.title}</div>
              <div style={{ fontSize:13, color:'var(--g600)', marginTop:4 }}>{job?.company} · {job?.location}</div>
            </div>

            {/* User info preview */}
            <div style={{
              background:'var(--gray50)', border:'1.5px solid var(--gray200)',
              borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:16,
              display:'flex', flexDirection:'column', gap:6,
            }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--gray400)', marginBottom:2 }}>بيانات ملفك الشخصي</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--g900)' }}>{user?.name}</div>
              <div style={{ fontSize:13, color:'var(--gray600)' }}>{user?.email}</div>
              {resumeFilename ? (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--g700)' }}>
                  <FileText size={13} />
                  <span>{resumeFilename}</span>
                </div>
              ) : (
                <div style={{ fontSize:12, color:'var(--gold600)' }}>
                  لم يتم رفع CV بعد —{' '}
                  <Link to="/profile" style={{ color:'var(--g600)', fontWeight:600 }}>أضفه من ملفك</Link>
                </div>
              )}
            </div>

            {/* Cover letter */}
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="رسالة تعريفية (اختياري) — اذكر لماذا أنت مناسب لهذه الوظيفة..."
              rows={4}
              style={{
                width:'100%', padding:'12px 16px', marginBottom:16,
                border:'1.5px solid var(--gray200)', borderRadius:'var(--r-md)',
                fontSize:14, fontFamily:'var(--font-ar)', color:'var(--gray800)',
                background:'var(--gray50)', outline:'none',
                textAlign:'right', direction:'rtl', resize:'vertical',
                boxSizing:'border-box',
              }}
              onFocus={e => { e.target.style.borderColor='var(--g600)'; e.target.style.background='var(--white)' }}
              onBlur={e => { e.target.style.borderColor='var(--gray200)'; e.target.style.background='var(--gray50)' }}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width:'100%', padding:14,
                background: loading ? 'var(--g600)' : 'var(--g900)', color:'var(--white)',
                border:'none', borderRadius:'var(--r-md)',
                fontSize:15, fontWeight:600, cursor: loading ? 'default' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                transition:'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background='var(--g700)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background='var(--g900)' }}
            >
              {loading
                ? <><Loader size={16} style={{ animation:'nSpin 1s linear infinite' }} /> جارٍ الإرسال...</>
                : 'تأكيد التقديم ←'}
            </button>

            {error && <p style={{ fontSize:12, color:'#E24B4A', textAlign:'center', marginTop:8 }}>{error}</p>}

            <p style={{ fontSize:12, color:'var(--gray400)', textAlign:'center', marginTop:12 }}>
              بياناتك ستُشارك مع جهة العمل المعنية فقط
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes nFadeIn      { from{opacity:0} to{opacity:1} }
        @keyframes nSlideUp     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nSpin        { to{transform:rotate(360deg)} }
        @keyframes nCheckBounce { 0%{opacity:0;transform:scale(0.4)} 65%{transform:scale(1.1)} 80%{transform:scale(0.95)} 100%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}

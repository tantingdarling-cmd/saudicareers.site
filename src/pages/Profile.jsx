import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, RefreshCw, CheckCircle } from 'lucide-react'
import { api } from '../services/api.js'

export default function Profile() {
  const [resumeUrl,  setResumeUrl]  = useState(null)
  const [filename,   setFilename]   = useState('')
  const [uploading,  setUploading]  = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [error,      setError]      = useState('')
  const [dragging,   setDragging]   = useState(false)
  const inputRef = useRef()

  const isAuth = !!localStorage.getItem('auth_token')

  useEffect(() => {
    if (!isAuth) return
    api.get('/v1/profile/resume')
      .then(r => { if (r.resume_url) { setResumeUrl(r.resume_url); setFilename(r.resume_path?.split('/').pop() || '') } })
      .catch(() => {})
  }, [])

  async function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) { setError('PDF أو DOCX فقط'); return }
    if (file.size > 5 * 1024 * 1024)   { setError('الحد الأقصى 5MB'); return }

    setUploading(true); setError(''); setSuccess(false)
    const form = new FormData()
    form.append('resume', file)

    try {
      const r = await api.post('/v1/profile/resume', form)
      setResumeUrl(r.resume_url)
      setFilename(file.name)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const zone = {
    border: `2px dashed ${dragging ? 'var(--g600)' : 'var(--gray200)'}`,
    borderRadius: 16, padding: '40px 24px', textAlign: 'center',
    background: dragging ? 'var(--g50)' : 'var(--white)',
    transition: 'all 0.2s', cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>الملف الشخصي</h1>
      <p style={{ color: 'var(--gray400)', marginBottom: 36 }}>رفع وإدارة السيرة الذاتية</p>

      {!isAuth ? (
        <div style={{ background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 16,
          padding: '32px 24px', textAlign: 'center', color: 'var(--g700)' }}>
          يتطلب تسجيل الدخول
        </div>
      ) : (
        <>
          {/* Current resume */}
          {resumeUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              background: 'var(--g50)', border: '1.5px solid var(--g200)', borderRadius: 12, marginBottom: 20 }}>
              <FileText size={20} color="var(--g700)" />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--g800)', flex: 1 }}>{filename}</span>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--g600)', textDecoration: 'none' }}>عرض</a>
            </div>
          )}

          {/* Upload zone */}
          <div
            style={zone}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />

            {uploading ? (
              <p style={{ color: 'var(--g700)', fontWeight: 600 }}>جاري الرفع…</p>
            ) : success ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={32} color="#16A34A" />
                <p style={{ color: '#16A34A', fontWeight: 600 }}>تم الرفع بنجاح</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  {resumeUrl
                    ? <RefreshCw size={32} color="var(--g400)" />
                    : <Upload size={32} color="var(--g400)" />}
                </div>
                <p style={{ fontWeight: 600, color: 'var(--g800)', marginBottom: 4 }}>
                  {resumeUrl ? 'استبدال السيرة الذاتية' : 'رفع السيرة الذاتية'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--gray400)' }}>PDF أو DOCX — بحد أقصى 5MB</p>
              </>
            )}
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
        </>
      )}
    </div>
  )
}

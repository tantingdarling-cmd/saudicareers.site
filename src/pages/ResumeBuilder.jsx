import { useState, useRef } from 'react'
import { api } from '../services/api'

// ── Style constants ───────────────────────────────────────────
const S = {
  label:      { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray800)', marginBottom: '6px' },
  input:      { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)', fontSize: '13px', color: 'var(--gray800)', background: '#fff', outline: 'none', boxSizing: 'border-box' },
  textarea:   { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)', fontSize: '13px', color: 'var(--gray800)', background: '#fff', outline: 'none', boxSizing: 'border-box', resize: 'vertical', display: 'block' },
  primaryBtn: { background: 'var(--g700)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '12px 20px', fontFamily: 'var(--font-ar)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  addBtn:     { background: 'var(--g50)', color: 'var(--g700)', border: '1px dashed var(--g400)', borderRadius: 'var(--r-md)', padding: '8px 16px', fontFamily: 'var(--font-ar)', fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '4px' },
}

// ── Helper sub-components ─────────────────────────────────────
function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g800)', marginBottom: '12px', borderBottom: '1px solid var(--gray100)', paddingBottom: '8px' }}>{title}</h3>
      {children}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder = '' }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <label style={S.label}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
    </div>
  )
}

// ── Classic Template ──────────────────────────────────────────
function ClassicTemplate({ data }) {
  return (
    <div style={{ fontFamily: 'var(--font-ar)', direction: 'rtl', padding: '32px', background: '#fff', minHeight: '297mm', fontSize: '13px', lineHeight: 1.6, color: '#1E3028' }}>
      <div style={{ borderBottom: '3px solid var(--g700)', paddingBottom: '16px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--g800)' }}>{data.name || 'اسمك الكامل'}</h1>
        <p style={{ color: 'var(--g600)', fontSize: '14px' }}>{data.title || 'المسمى الوظيفي'}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--gray600)', flexWrap: 'wrap' }}>
          {data.email && <span>📧 {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.city  && <span>📍 {data.city}</span>}
        </div>
      </div>
      {data.summary && <TplSection title="الملخص"><p>{data.summary}</p></TplSection>}
      {data.experience?.some(e => e.company) && (
        <TplSection title="الخبرات">
          {data.experience.map((e, i) => e.company && (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.role}</strong>
                <span style={{ color: 'var(--gray600)' }}>{e.period}</span>
              </div>
              <div style={{ color: 'var(--g700)' }}>{e.company}</div>
              {e.desc && <p style={{ marginTop: '4px' }}>{e.desc}</p>}
            </div>
          ))}
        </TplSection>
      )}
      {data.education?.some(e => e.school) && (
        <TplSection title="التعليم">
          {data.education.map((e, i) => e.school && (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{e.degree}</strong>
                <span style={{ color: 'var(--gray600)' }}>{e.year}</span>
              </div>
              <div style={{ color: 'var(--g700)' }}>{e.school}</div>
            </div>
          ))}
        </TplSection>
      )}
      {data.skills && <TplSection title="المهارات"><p>{data.skills}</p></TplSection>}
    </div>
  )
}

function TplSection({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g800)', borderBottom: '1px solid var(--g200)', paddingBottom: '4px', marginBottom: '10px' }}>{title}</h2>
      {children}
    </div>
  )
}

// ── Modern Template ───────────────────────────────────────────
function ModernTemplate({ data }) {
  return (
    <div style={{ fontFamily: 'var(--font-ar)', direction: 'rtl', display: 'flex', minHeight: '297mm', background: '#fff', fontSize: '13px', lineHeight: 1.6 }}>
      <div style={{ width: '35%', background: 'var(--g800)', color: '#fff', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '70px', height: '70px', background: 'var(--g500)', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700 }}>
            {(data.name || 'أ')[0]}
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 700 }}>{data.name || 'اسمك'}</h1>
          <p style={{ color: 'var(--g200)', fontSize: '12px' }}>{data.title}</p>
        </div>
        {(data.email || data.phone || data.city) && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--g200)', borderBottom: '1px solid var(--g600)', paddingBottom: '6px', marginBottom: '10px' }}>التواصل</h3>
            {data.email && <p style={{ fontSize: '12px', marginBottom: '6px' }}>📧 {data.email}</p>}
            {data.phone && <p style={{ fontSize: '12px', marginBottom: '6px' }}>📞 {data.phone}</p>}
            {data.city  && <p style={{ fontSize: '12px', marginBottom: '6px' }}>📍 {data.city}</p>}
          </div>
        )}
        {data.skills && (
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--g200)', borderBottom: '1px solid var(--g600)', paddingBottom: '6px', marginBottom: '10px' }}>المهارات</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {data.skills.split(',').map((s, i) => (
                <span key={i} style={{ background: 'var(--g700)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '32px 24px', color: '#1E3028' }}>
        {data.summary && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>الملخص</h2>
            <p style={{ color: '#4A6358' }}>{data.summary}</p>
          </div>
        )}
        {data.experience?.some(e => e.company) && (
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>الخبرات</h2>
            {data.experience.map((e, i) => e.company && (
              <div key={i} style={{ marginBottom: '14px', paddingRight: '12px', borderRight: '2px solid var(--g400)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--g800)' }}>{e.role}</strong>
                  <span style={{ fontSize: '11px', color: '#8FA69A' }}>{e.period}</span>
                </div>
                <div style={{ color: 'var(--g600)', fontSize: '12px' }}>{e.company}</div>
                {e.desc && <p style={{ marginTop: '4px', fontSize: '12px' }}>{e.desc}</p>}
              </div>
            ))}
          </div>
        )}
        {data.education?.some(e => e.school) && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>التعليم</h2>
            {data.education.map((e, i) => e.school && (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{e.degree}</strong>
                  <span style={{ fontSize: '11px', color: '#8FA69A' }}>{e.year}</span>
                </div>
                <div style={{ color: 'var(--g600)', fontSize: '12px' }}>{e.school}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Creative Template ─────────────────────────────────────────
function CreativeTemplate({ data }) {
  return (
    <div style={{ fontFamily: 'var(--font-ar)', direction: 'rtl', background: '#fff', minHeight: '297mm', fontSize: '13px', lineHeight: 1.6 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--g800) 0%, var(--g600) 100%)', padding: '40px', color: '#fff' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '4px' }}>{data.name || 'اسمك'}</h1>
        <p style={{ color: 'var(--g100)', fontSize: '16px', marginBottom: '16px' }}>{data.title}</p>
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.8)', flexWrap: 'wrap' }}>
          {data.email && <span>📧 {data.email}</span>}
          {data.phone && <span>📞 {data.phone}</span>}
          {data.city  && <span>📍 {data.city}</span>}
        </div>
      </div>
      <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: '32px' }}>
        <div>
          {data.summary && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g700)', borderRight: '3px solid var(--g500)', paddingRight: '8px', marginBottom: '10px' }}>الملخص</h2>
              <p style={{ color: '#4A6358' }}>{data.summary}</p>
            </div>
          )}
          {data.experience?.some(e => e.company) && (
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g700)', borderRight: '3px solid var(--g500)', paddingRight: '8px', marginBottom: '12px' }}>الخبرات</h2>
              {data.experience.map((e, i) => e.company && (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '14px' }}>{e.role}</strong>
                      <div style={{ color: 'var(--g600)', fontSize: '12px' }}>{e.company}</div>
                    </div>
                    <span style={{ background: 'var(--g50)', color: 'var(--g700)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', whiteSpace: 'nowrap' }}>{e.period}</span>
                  </div>
                  {e.desc && <p style={{ marginTop: '6px', fontSize: '12px', color: '#4A6358' }}>{e.desc}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {data.education?.some(e => e.school) && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g700)', borderRight: '3px solid var(--g500)', paddingRight: '8px', marginBottom: '10px' }}>التعليم</h2>
              {data.education.map((e, i) => e.school && (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <strong style={{ fontSize: '13px' }}>{e.degree}</strong>
                  <div style={{ color: 'var(--g700)', fontSize: '12px' }}>{e.school}</div>
                  <div style={{ color: '#8FA69A', fontSize: '11px' }}>{e.year}</div>
                </div>
              ))}
            </div>
          )}
          {data.skills && (
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g700)', borderRight: '3px solid var(--g500)', paddingRight: '8px', marginBottom: '10px' }}>المهارات</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.split(',').map((s, i) => (
                  <span key={i} style={{ background: 'var(--g50)', border: '1px solid var(--g200)', color: 'var(--g800)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px' }}>{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Constants ─────────────────────────────────────────────────
const TABS = [
  { id: 'scratch',  label: 'من الصفر' },
  { id: 'upload',   label: 'رفع ملف' },
  { id: 'enhance',  label: 'تحسين ذكي' },
]

const TEMPLATES = { classic: 'كلاسيك', modern: 'عصري', creative: 'إبداعي' }
const TEMPLATE_COMPONENTS = { classic: ClassicTemplate, modern: ModernTemplate, creative: CreativeTemplate }

const DEFAULT_DATA = {
  name: '', title: '', email: '', phone: '', city: '', summary: '',
  experience: [{ company: '', role: '', period: '', desc: '' }],
  education:  [{ school: '', degree: '', year: '' }],
  skills: '',
}

// ── Main Page ─────────────────────────────────────────────────
export default function ResumeBuilder() {
  const [tab,        setTab]        = useState('scratch')
  const [template,   setTemplate]   = useState('classic')
  const [formData,   setFormData]   = useState(DEFAULT_DATA)
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  // upload tab
  const [uploading,  setUploading]  = useState(false)
  const [uploadMsg,  setUploadMsg]  = useState('')
  const fileRef = useRef()

  // enhance tab
  const [resumeText,    setResumeText]    = useState('')
  const [jobDesc,       setJobDesc]       = useState('')
  const [enhancing,     setEnhancing]     = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)
  const [enhanceError,  setEnhanceError]  = useState('')

  const previewRef = useRef()
  const TemplateComponent = TEMPLATE_COMPONENTS[template]

  function setField(k, v) { setFormData(p => ({ ...p, [k]: v })) }
  function setExp(i, k, v) { setFormData(p => { const a = [...p.experience]; a[i] = { ...a[i], [k]: v }; return { ...p, experience: a } }) }
  function setEdu(i, k, v) { setFormData(p => { const a = [...p.education];  a[i] = { ...a[i], [k]: v }; return { ...p, education: a } }) }
  function addExp() { setFormData(p => ({ ...p, experience: [...p.experience, { company: '', role: '', period: '', desc: '' }] })) }
  function addEdu() { setFormData(p => ({ ...p, education:  [...p.education,  { school: '', degree: '', year: '' }] })) }

  async function handleSave() {
    setSaving(true); setSaveMsg('')
    try {
      await api.post('/v1/profile/resume/save', { resume_data: formData })
      setSaveMsg('تم الحفظ بنجاح ✓')
    } catch (e) { setSaveMsg(e.message) }
    finally { setSaving(false); setTimeout(() => setSaveMsg(''), 3000) }
  }

  async function handleExportPDF() {
    if (!previewRef.current) return
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { default: jsPDF }       = await import('jspdf')
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const pdf    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w      = 210
      const h      = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      pdf.save(`resume-${Date.now()}.pdf`)
    } catch { alert('فشل تصدير PDF') }
  }

  async function handleUpload() {
    const file = fileRef.current?.files[0]
    if (!file) return
    setUploading(true); setUploadMsg('')
    try {
      const fd = new FormData(); fd.append('resume', file)
      await api.post('/v1/profile/resume', fd)
      setUploadMsg('تم رفع الملف بنجاح ✓')
    } catch (e) { setUploadMsg(e.message) }
    finally { setUploading(false) }
  }

  async function handleEnhance() {
    if (!resumeText.trim()) return
    setEnhancing(true); setEnhanceError(''); setEnhanceResult(null)
    try {
      const { job_id } = await api.post('/v1/resume/optimize', { resume_text: resumeText, job_description: jobDesc })
      let result = null
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 3000))
        const s = await api.get(`/v1/resume/status/${job_id}`)
        if (s.status === 'completed') { result = s; break }
        if (s.status === 'failed')    throw new Error('فشل التحسين')
      }
      if (!result) throw new Error('انتهت مهلة الطلب')
      setEnhanceResult(result)
    } catch (e) { setEnhanceError(e.message) }
    finally { setEnhancing(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)', padding: '40px 24px', direction: 'rtl', fontFamily: 'var(--font-ar)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--g900)', marginBottom: '6px' }}>منشئ السيرة الذاتية</h1>
          <p style={{ color: 'var(--gray600)', fontSize: '15px' }}>أنشئ سيرتك الذاتية الاحترافية بخطوات بسيطة</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--gray100)', borderRadius: 'var(--r-md)', padding: '4px', marginBottom: '32px', width: 'fit-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ar)', fontSize: '14px', fontWeight: 600, background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? 'var(--g800)' : 'var(--gray600)', boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: من الصفر ── */}
        {tab === 'scratch' && (
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'flex-start' }}>

            {/* Form */}
            <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-md)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>

              {/* Template picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>القالب</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Object.entries(TEMPLATES).map(([key, lbl]) => (
                    <button key={key} onClick={() => setTemplate(key)} style={{ flex: 1, padding: '8px', borderRadius: 'var(--r-sm)', border: `2px solid ${template === key ? 'var(--g600)' : 'var(--gray200)'}`, background: template === key ? 'var(--g50)' : '#fff', color: template === key ? 'var(--g800)' : 'var(--gray600)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-ar)', fontWeight: 600 }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <FormSection title="المعلومات الشخصية">
                <FormField label="الاسم الكامل"      value={formData.name}  onChange={v => setField('name', v)} />
                <FormField label="المسمى الوظيفي"    value={formData.title} onChange={v => setField('title', v)} />
                <FormField label="البريد الإلكتروني" value={formData.email} onChange={v => setField('email', v)} />
                <FormField label="رقم الجوال"        value={formData.phone} onChange={v => setField('phone', v)} />
                <FormField label="المدينة"           value={formData.city}  onChange={v => setField('city', v)} />
              </FormSection>

              <FormSection title="الملخص الشخصي">
                <textarea value={formData.summary} onChange={e => setField('summary', e.target.value)} rows={3} style={S.textarea} placeholder="اكتب ملخصاً مختصراً عنك..." />
              </FormSection>

              <FormSection title="الخبرات">
                {formData.experience.map((exp, i) => (
                  <div key={i} style={{ background: 'var(--gray50)', borderRadius: 'var(--r-md)', padding: '12px', marginBottom: '10px' }}>
                    <FormField label="الشركة"  value={exp.company} onChange={v => setExp(i, 'company', v)} />
                    <FormField label="المسمى"  value={exp.role}    onChange={v => setExp(i, 'role', v)} />
                    <FormField label="الفترة"  value={exp.period}  onChange={v => setExp(i, 'period', v)} placeholder="2020 - 2023" />
                    <label style={S.label}>الوصف</label>
                    <textarea value={exp.desc} onChange={e => setExp(i, 'desc', e.target.value)} rows={2} style={S.textarea} placeholder="وصف المهام والإنجازات..." />
                  </div>
                ))}
                <button onClick={addExp} style={S.addBtn}>+ إضافة خبرة</button>
              </FormSection>

              <FormSection title="التعليم">
                {formData.education.map((edu, i) => (
                  <div key={i} style={{ background: 'var(--gray50)', borderRadius: 'var(--r-md)', padding: '12px', marginBottom: '10px' }}>
                    <FormField label="المؤسسة التعليمية" value={edu.school} onChange={v => setEdu(i, 'school', v)} />
                    <FormField label="الدرجة العلمية"    value={edu.degree} onChange={v => setEdu(i, 'degree', v)} />
                    <FormField label="سنة التخرج"        value={edu.year}   onChange={v => setEdu(i, 'year', v)} />
                  </div>
                ))}
                <button onClick={addEdu} style={S.addBtn}>+ إضافة تعليم</button>
              </FormSection>

              <FormSection title="المهارات">
                <input value={formData.skills} onChange={e => setField('skills', e.target.value)} style={S.input} placeholder="Python، تواصل، قيادة الفرق، Excel..." />
                <p style={{ fontSize: '11px', color: 'var(--gray400)', marginTop: '4px' }}>افصل بين المهارات بفاصلة</p>
              </FormSection>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ ...S.primaryBtn, flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
                <button onClick={handleExportPDF} style={{ ...S.primaryBtn, flex: 1, background: 'transparent', color: 'var(--g700)', border: '1.5px solid var(--g700)' }}>
                  تصدير PDF
                </button>
              </div>
              {saveMsg && (
                <p style={{ marginTop: '10px', fontSize: '13px', textAlign: 'center', color: saveMsg.includes('✓') ? 'var(--g700)' : '#c0392b' }}>{saveMsg}</p>
              )}
            </div>

            {/* Live Preview */}
            <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--gray100)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--gray600)', fontWeight: 600 }}>معاينة مباشرة</span>
                  <span style={{ fontSize: '11px', background: 'var(--g50)', color: 'var(--g700)', padding: '2px 10px', borderRadius: '20px' }}>{TEMPLATES[template]}</span>
                </div>
                <div style={{ overflow: 'hidden', maxHeight: '80vh' }}>
                  <div ref={previewRef} style={{ transform: 'scale(0.72)', transformOrigin: 'top right', width: '138.9%', marginBottom: '-28%' }}>
                    <TemplateComponent data={formData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: رفع ملف ── */}
        {tab === 'upload' && (
          <div style={{ maxWidth: '560px', background: '#fff', borderRadius: 'var(--r-xl)', padding: '40px', boxShadow: 'var(--shadow-md)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--g900)' }}>رفع السيرة الذاتية</h2>
            <p style={{ color: 'var(--gray600)', marginBottom: '28px', fontSize: '14px' }}>يُدعم PDF و DOCX — الحد الأقصى 5 ميجابايت</p>
            <div
              style={{ border: '2px dashed var(--gray200)', borderRadius: 'var(--r-lg)', padding: '48px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}
              onClick={() => fileRef.current?.click()}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <p style={{ color: 'var(--gray600)', fontSize: '15px', fontWeight: 600 }}>انقر لاختيار ملف</p>
              <p style={{ color: 'var(--gray400)', fontSize: '12px', marginTop: '6px' }}>PDF أو DOCX</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={() => setUploadMsg('')} />
            </div>
            <button onClick={handleUpload} disabled={uploading} style={{ ...S.primaryBtn, width: '100%', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? 'جارٍ الرفع...' : 'رفع الملف'}
            </button>
            {uploadMsg && (
              <p style={{ marginTop: '14px', fontSize: '13px', textAlign: 'center', color: uploadMsg.includes('✓') ? 'var(--g700)' : '#c0392b' }}>{uploadMsg}</p>
            )}
          </div>
        )}

        {/* ── Tab: تحسين ذكي ── */}
        {tab === 'enhance' && (
          <div style={{ maxWidth: '800px' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '32px', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--g900)' }}>تحسين ذكي بالذكاء الاصطناعي</h2>
              <p style={{ color: 'var(--gray600)', marginBottom: '24px', fontSize: '14px' }}>الصق نص سيرتك الذاتية وسنحسّنها لتتوافق مع معايير ATS</p>

              <label style={S.label}>نص السيرة الذاتية *</label>
              <textarea
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={8}
                style={{ ...S.textarea, marginBottom: '16px' }}
                placeholder="الصق نص سيرتك الذاتية هنا..."
              />

              <label style={S.label}>وصف الوظيفة (اختياري — يحسّن الدقة)</label>
              <textarea
                value={jobDesc}
                onChange={e => setJobDesc(e.target.value)}
                rows={4}
                style={{ ...S.textarea, marginBottom: '20px' }}
                placeholder="الصق وصف الوظيفة المستهدفة..."
              />

              <button
                onClick={handleEnhance}
                disabled={enhancing || !resumeText.trim()}
                style={{ ...S.primaryBtn, width: '100%', opacity: enhancing || !resumeText.trim() ? 0.5 : 1 }}
              >
                {enhancing ? '⏳ جارٍ التحسين...' : '✨ تحسين السيرة الذاتية'}
              </button>
              {enhanceError && <p style={{ marginTop: '12px', fontSize: '13px', color: '#c0392b', textAlign: 'center' }}>{enhanceError}</p>}
            </div>

            {enhancing && (
              <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '40px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
                <p style={{ color: 'var(--g700)', fontWeight: 600, fontSize: '16px' }}>الذكاء الاصطناعي يحلل سيرتك الذاتية...</p>
                <p style={{ color: 'var(--gray600)', fontSize: '13px', marginTop: '8px' }}>قد يستغرق ذلك دقيقة أو أكثر</p>
              </div>
            )}

            {enhanceResult && (
              <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--g800)', marginBottom: '20px' }}>✨ النتائج المحسّنة</h3>

                {enhanceResult.result?.summary && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g700)', marginBottom: '8px' }}>الملخص المحسّن</h4>
                    <p style={{ background: 'var(--g50)', padding: '16px', borderRadius: 'var(--r-md)', fontSize: '14px', lineHeight: 1.8, color: 'var(--gray800)' }}>{enhanceResult.result.summary}</p>
                  </div>
                )}

                {enhanceResult.result?.bullets?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g700)', marginBottom: '8px' }}>نقاط القوة</h4>
                    <ul style={{ paddingRight: '20px' }}>
                      {enhanceResult.result.bullets.map((b, i) => (
                        <li key={i} style={{ color: 'var(--gray800)', marginBottom: '8px', fontSize: '14px', lineHeight: 1.6 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {enhanceResult.result?.tips?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g700)', marginBottom: '8px' }}>التوصيات</h4>
                    {enhanceResult.result.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', padding: '12px', background: 'var(--gold100)', borderRadius: 'var(--r-sm)' }}>
                        <span style={{ color: 'var(--gold600)' }}>💡</span>
                        <span style={{ fontSize: '13px', color: 'var(--gray800)', lineHeight: 1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                {!enhanceResult.result?.summary && !enhanceResult.result?.bullets && (
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', color: 'var(--gray800)', lineHeight: 1.8 }}>
                    {JSON.stringify(enhanceResult.result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

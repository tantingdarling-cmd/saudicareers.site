import { useState, useRef, useEffect } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import { TEMPLATE_LABELS, TEMPLATE_COMPONENTS } from '../components/ResumeTemplates.jsx'

// ── Style constants ───────────────────────────────────────────
const S = {
  label:      { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--gray800)', marginBottom: '6px' },
  input:      { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)', fontSize: '13px', color: 'var(--gray800)', background: '#fff', outline: 'none', boxSizing: 'border-box' },
  textarea:   { width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)', fontSize: '13px', color: 'var(--gray800)', background: '#fff', outline: 'none', boxSizing: 'border-box', resize: 'vertical', display: 'block' },
  primaryBtn: { background: 'var(--g700)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '12px 20px', fontFamily: 'var(--font-ar)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  addBtn:     { background: 'var(--g50)', color: 'var(--g700)', border: '1px dashed var(--g400)', borderRadius: 'var(--r-md)', padding: '8px 16px', fontFamily: 'var(--font-ar)', fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '4px' },
}

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

const TABS = [
  { id: 'scratch',  label: 'من الصفر' },
  { id: 'upload',   label: 'رفع ملف' },
  { id: 'enhance',  label: 'تحسين ذكي' },
]

const DEFAULT_DATA = {
  name: '', title: '', email: '', phone: '', city: '', summary: '',
  experience: [{ company: '', role: '', period: '', desc: '' }],
  education:  [{ school: '', degree: '', year: '' }],
  skills: '',
}

export default function ResumeBuilder() {
  const isAuth = !!localStorage.getItem('auth_token')
  const loc = useLocation()

  if (!isAuth) return <Navigate to={`/login?next=${loc.pathname}`} replace />

  const navigate  = useNavigate()

  const [tab,        setTab]        = useState('scratch')
  const [template,   setTemplate]   = useState('classic')
  const [formData,   setFormData]   = useState(DEFAULT_DATA)
  const [resumeName, setResumeName] = useState('سيرتي الذاتية')
  const [editId,     setEditId]     = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  const [uploading,  setUploading]  = useState(false)
  const [uploadMsg,  setUploadMsg]  = useState('')
  const fileRef = useRef()

  const [resumeText,    setResumeText]    = useState('')
  const [jobDesc,       setJobDesc]       = useState('')
  const [enhancing,     setEnhancing]     = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)
  const [enhanceError,  setEnhanceError]  = useState('')

  const previewRef = useRef()
  const TemplateComponent = TEMPLATE_COMPONENTS[template]

  useEffect(() => {
    const raw = sessionStorage.getItem('resume_edit')
    if (!raw) return
    try {
      const { id, name, template: tpl, data } = JSON.parse(raw)
      if (id)   setEditId(id)
      if (name) setResumeName(name)
      if (tpl)  setTemplate(tpl)
      if (data) setFormData(data)
    } catch {}
    sessionStorage.removeItem('resume_edit')
  }, [])

  function setField(k, v) { setFormData(p => ({ ...p, [k]: v })) }
  function setExp(i, k, v) { setFormData(p => { const a = [...p.experience]; a[i] = { ...a[i], [k]: v }; return { ...p, experience: a } }) }
  function setEdu(i, k, v) { setFormData(p => { const a = [...p.education];  a[i] = { ...a[i], [k]: v }; return { ...p, education: a } }) }
  function addExp() { setFormData(p => ({ ...p, experience: [...p.experience, { company: '', role: '', period: '', desc: '' }] })) }
  function addEdu() { setFormData(p => ({ ...p, education:  [...p.education,  { school: '', degree: '', year: '' }] })) }

  async function handleSave() {
    setSaving(true); setSaveMsg('')
    try {
      const payload = { name: resumeName, template, data: formData }
      if (editId) {
        await api.put(`/v1/profile/resumes/${editId}`, payload)
      } else {
        const res = await api.post('/v1/profile/resumes', payload)
        setEditId(res.id)
      }
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
      const w = 210; const h = (canvas.height * w) / canvas.width
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h)
      pdf.save(`${resumeName || 'resume'}-${Date.now()}.pdf`)
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
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--g900)', marginBottom: '6px' }}>
              {editId ? 'تعديل السيرة الذاتية' : 'منشئ السيرة الذاتية'}
            </h1>
            <p style={{ color: 'var(--gray600)', fontSize: '15px' }}>أنشئ سيرتك الذاتية الاحترافية بخطوات بسيطة</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/resumes')}
            style={{ background: 'rgba(0,61,43,0.07)', color: 'var(--g800)', border: '1.5px solid rgba(0,61,43,0.18)', borderRadius: 'var(--r-md)', padding: '10px 18px', fontFamily: 'var(--font-ar)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            ← سيري المحفوظة
          </button>
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
          <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '24px', boxShadow: 'var(--shadow-md)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>

              {/* Resume name */}
              <FormSection title="اسم السيرة الذاتية">
                <input value={resumeName} onChange={e => setResumeName(e.target.value)} style={S.input} placeholder="مثال: سيرة تقنية — كلاسيك" />
              </FormSection>

              {/* Template picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={S.label}>القالب</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Object.entries(TEMPLATE_LABELS).map(([key, lbl]) => (
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

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={handleSave} disabled={saving} style={{ ...S.primaryBtn, flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'جارٍ الحفظ...' : editId ? 'تحديث' : 'حفظ'}
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
                  <span style={{ fontSize: '11px', background: 'var(--g50)', color: 'var(--g700)', padding: '2px 10px', borderRadius: '20px' }}>{TEMPLATE_LABELS[template]}</span>
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
            <div style={{ border: '2px dashed var(--gray200)', borderRadius: 'var(--r-lg)', padding: '48px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }} onClick={() => fileRef.current?.click()}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <p style={{ color: 'var(--gray600)', fontSize: '15px', fontWeight: 600 }}>انقر لاختيار ملف</p>
              <p style={{ color: 'var(--gray400)', fontSize: '12px', marginTop: '6px' }}>PDF أو DOCX</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={() => setUploadMsg('')} />
            </div>
            <button onClick={handleUpload} disabled={uploading} style={{ ...S.primaryBtn, width: '100%', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? 'جارٍ الرفع...' : 'رفع الملف'}
            </button>
            {uploadMsg && <p style={{ marginTop: '14px', fontSize: '13px', textAlign: 'center', color: uploadMsg.includes('✓') ? 'var(--g700)' : '#c0392b' }}>{uploadMsg}</p>}
          </div>
        )}

        {/* ── Tab: تحسين ذكي ── */}
        {tab === 'enhance' && (
          <div style={{ maxWidth: '800px' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', padding: '32px', boxShadow: 'var(--shadow-md)', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--g900)' }}>تحسين ذكي بالذكاء الاصطناعي</h2>
              <p style={{ color: 'var(--gray600)', marginBottom: '24px', fontSize: '14px' }}>الصق نص سيرتك الذاتية وسنحسّنها لتتوافق مع معايير ATS</p>
              <label style={S.label}>نص السيرة الذاتية *</label>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8} style={{ ...S.textarea, marginBottom: '16px' }} placeholder="الصق نص سيرتك الذاتية هنا..." />
              <label style={S.label}>وصف الوظيفة (اختياري)</label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={4} style={{ ...S.textarea, marginBottom: '20px' }} placeholder="الصق وصف الوظيفة المستهدفة..." />
              <button onClick={handleEnhance} disabled={enhancing || !resumeText.trim()} style={{ ...S.primaryBtn, width: '100%', opacity: enhancing || !resumeText.trim() ? 0.5 : 1 }}>
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
                    <p style={{ background: 'var(--g50)', padding: '16px', borderRadius: 'var(--r-md)', fontSize: '14px', lineHeight: 1.8 }}>{enhanceResult.result.summary}</p>
                  </div>
                )}
                {enhanceResult.result?.bullets?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g700)', marginBottom: '8px' }}>نقاط القوة</h4>
                    <ul style={{ paddingRight: '20px' }}>
                      {enhanceResult.result.bullets.map((b, i) => <li key={i} style={{ marginBottom: '8px', fontSize: '14px', lineHeight: 1.6 }}>{b}</li>)}
                    </ul>
                  </div>
                )}
                {enhanceResult.result?.tips?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--g700)', marginBottom: '8px' }}>التوصيات</h4>
                    {enhanceResult.result.tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', padding: '12px', background: 'var(--gold100)', borderRadius: 'var(--r-sm)' }}>
                        <span style={{ color: 'var(--gold600)' }}>💡</span>
                        <span style={{ fontSize: '13px', lineHeight: 1.6 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!enhanceResult.result?.summary && !enhanceResult.result?.bullets && (
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.8 }}>{JSON.stringify(enhanceResult.result, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

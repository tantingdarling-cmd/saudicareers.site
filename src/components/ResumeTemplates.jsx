// Shared resume template components — used by ResumeBuilder + ResumeDashboard

function TplSection({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--g800)', borderBottom: '1px solid var(--g200)', paddingBottom: '4px', marginBottom: '10px' }}>{title}</h2>
      {children}
    </div>
  )
}

export function ClassicTemplate({ data }) {
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
                <strong>{e.role}</strong><span style={{ color: 'var(--gray600)' }}>{e.period}</span>
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
                <strong>{e.degree}</strong><span style={{ color: 'var(--gray600)' }}>{e.year}</span>
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

export function ModernTemplate({ data }) {
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
                  <strong>{e.degree}</strong><span style={{ fontSize: '11px', color: '#8FA69A' }}>{e.year}</span>
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

export function CreativeTemplate({ data }) {
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

export const TEMPLATE_LABELS = { classic: 'كلاسيك', modern: 'عصري', creative: 'إبداعي' }
export const TEMPLATE_COMPONENTS = { classic: ClassicTemplate, modern: ModernTemplate, creative: CreativeTemplate }

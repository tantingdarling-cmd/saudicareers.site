// JobsSection.jsx — filter chips + grid + JobCard + StatsBar combined
const JOBS = [
  { id: 1, company: 'نيوم', icon: '🏗️', title: 'مهندس بنية تحتية ذكية', location: 'تبوك', type: 'دوام كامل', salary: '22,000 – 32,000', tags: ['هندسة', 'رؤية 2030'], badge: 'hot', badgeText: 'مطلوبة', posted: 'منذ يومين', category: 'construction' },
  { id: 2, company: 'أرامكو السعودية', icon: '⛽', title: 'محلل بيانات — قطاع الطاقة', location: 'الظهران', type: 'دوام كامل', salary: '18,000 – 25,000', tags: ['تحليل البيانات', 'Python'], badge: 'new', badgeText: 'جديدة', posted: 'منذ 3 أيام', category: 'energy' },
  { id: 3, company: 'صندوق الاستثمارات العامة', icon: '🏛️', title: 'محلل استثماري أول', location: 'الرياض', type: 'دوام كامل', salary: '25,000 – 40,000', tags: ['استثمار', 'CFA'], badge: 'featured', badgeText: 'حصرية', posted: 'منذ يوم', category: 'finance' },
  { id: 4, company: 'STC', icon: '📡', title: 'مهندس شبكات 5G', location: 'الرياض', type: 'دوام كامل', salary: '16,000 – 22,000', tags: ['5G', 'شبكات', 'Cloud'], badge: 'new', badgeText: 'جديدة', posted: 'اليوم', category: 'tech' },
  { id: 5, company: 'KAEC', icon: '🌆', title: 'مدير موارد بشرية', location: 'رابغ', type: 'هجين', salary: '18,000 – 28,000', tags: ['HR', 'SHRM'], badge: '', badgeText: '', posted: 'منذ 5 أيام', category: 'hr' },
  { id: 6, company: 'الخطوط السعودية', icon: '✈️', title: 'مطور تطبيقات جوال', location: 'جدة', type: 'هجين', salary: '14,000 – 20,000', tags: ['Flutter', 'iOS'], badge: 'new', badgeText: 'جديدة', posted: 'منذ يومين', category: 'tech' },
];
const CATEGORIES = [
  { key: 'all', label: 'الكل' }, { key: 'tech', label: 'تقنية' },
  { key: 'finance', label: 'مالية' }, { key: 'energy', label: 'طاقة' },
  { key: 'construction', label: 'إنشاءات' }, { key: 'hr', label: 'موارد بشرية' },
];

function Eyebrow({ children, light }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
      color: light ? 'var(--gold400)' : 'var(--gold600)', marginBottom: 14,
    }}>
      <span style={{ width: 28, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
      {children}
    </div>
  );
}

function JobCard({ job, onApply }) {
  const [hov, setHov] = React.useState(false);
  const badgeColors = {
    hot: { bg: 'rgba(220,38,38,0.08)', color: '#B91C1C', border: 'rgba(220,38,38,0.15)', glow: 'rgba(220,38,38,0.45)' },
    new: { bg: 'var(--gold100)', color: 'var(--gold700)', border: 'rgba(197,160,89,0.25)', glow: 'rgba(197,160,89,0.55)' },
    featured: { bg: 'var(--g50)', color: 'var(--g700)', border: 'var(--g200)', glow: 'rgba(59,175,122,0.55)' },
  };
  const bc = badgeColors[job.badge] || {};
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: '#fff',
      border: hov ? '1.5px solid var(--g400)' : '1.5px solid var(--gray200)',
      borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column',
      transition: 'all 0.4s cubic-bezier(0.32,0.72,0,1)',
      transform: hov ? 'translateY(-4px)' : 'none',
      boxShadow: hov ? 'var(--shadow-lg)' : '0 8px 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-sm)',
            background: 'var(--g50)', border: '1px solid var(--g100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }}>{job.icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>{job.company}</div>
            <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 2 }}>{job.posted}</div>
          </div>
        </div>
        {job.badge && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 50,
            background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`,
            height: 'fit-content', whiteSpace: 'nowrap',
            animation: `badgeGlow-${job.badge} 2.4s ease-in-out infinite`,
          }}>{job.badgeText}</span>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--g950)', marginBottom: 14, lineHeight: 1.35 }}>{job.title}</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 12, color: 'var(--gray600)', flexWrap: 'wrap' }}>
        <span>📍 {job.location}</span><span>💼 {job.type}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {job.tags.map(t => (
          <span key={t} style={{
            fontSize: 11, fontWeight: 500, padding: '4px 10px',
            background: 'var(--gray100)', color: 'var(--gray600)', borderRadius: 50,
          }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g800)', marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ color: 'var(--gold500)' }}>●</span>
        {job.salary} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray400)' }}>ر.س / شهرياً</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button onClick={() => onApply(job)} style={{
          flex: 1, padding: '11px 0',
          background: 'linear-gradient(135deg,#003D2B 0%,#001a0d 100%)',
          color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
          fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>← التقديم</button>
        <button style={{
          padding: '11px 14px', background: 'var(--g50)', color: 'var(--g800)',
          border: '1.5px solid var(--g200)', borderRadius: 'var(--r-md)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>← التفاصيل</button>
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div style={{ background: 'var(--g900)', padding: '64px clamp(1rem,4vw,3rem)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
        gap: 32, textAlign: 'center',
      }}>
        {[['75', '%', 'من السير الذاتية تُرفض آلياً قبل مراجعتها'],
          ['+2', 'M', 'باحث عن عمل في السعودية'],
          ['70', '%', 'نسبة التوطين المستهدفة برؤية 2030'],
          ['48', 'H', 'لتحسين سيرتك الذاتية عند التسجيل']].map(([v, a, l]) => (
          <div key={l}>
            <div style={{
              fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, color: '#fff',
              lineHeight: 1, marginBottom: 6, fontFamily: 'var(--font-en)',
            }}>{v}<span style={{ color: 'var(--gold400)', marginInlineStart: 4 }}>{a}</span></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobsSection({ onApply }) {
  const [active, setActive] = React.useState('all');
  const filtered = active === 'all' ? JOBS : JOBS.filter(j => j.category === active);
  return (
    <section id="jobs" style={{ padding: 'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background: 'var(--gray50)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <Eyebrow>فرص موثوقة</Eyebrow>
        <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--g950)', marginBottom: 14 }}>أحدث الوظائف في السوق السعودي</h2>
        <p style={{ fontSize: 16, color: 'var(--gray600)', maxWidth: 540, lineHeight: 1.85, marginBottom: 36 }}>
          نجمع الفرص الوظيفية من مصادرها الرسمية ونتحقق من صحتها قبل نشرها
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
          {CATEGORIES.map(({ key, label }) => (
            <button key={key} onClick={() => setActive(key)} style={{
              padding: '8px 20px', borderRadius: 50,
              border: active === key ? '1.5px solid var(--g900)' : '1.5px solid var(--gray200)',
              fontSize: 13, fontWeight: 500,
              color: active === key ? '#fff' : 'var(--gray600)',
              background: active === key ? 'var(--g900)' : '#fff',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 20 }}>
          {filtered.map(j => <JobCard key={j.id} job={j} onApply={onApply} />)}
        </div>
      </div>
    </section>
  );
}

window.Eyebrow = Eyebrow;
window.JobCard = JobCard;
window.StatsBar = StatsBar;
window.JobsSection = JobsSection;

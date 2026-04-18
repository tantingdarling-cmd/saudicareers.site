// SectionsRest.jsx — Services, How It Works, Tips, Signup, Footer, Apply Sheet
function ServicesSection() {
  const sectionTitle = { fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--g950)', marginBottom: 14 };
  return (
    <section id="services" style={{ padding: 'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <Eyebrow>خدماتنا</Eyebrow>
        <h2 style={sectionTitle}>ثلاث خدمات، هدف واحد</h2>
        <p style={{ fontSize: 16, color: 'var(--gray600)', maxWidth: 540, lineHeight: 1.85, marginBottom: 48 }}>
          صممنا كل خدمة لتكمّل الأخرى، لأن النجاح في سوق العمل يحتاج أكثر من مجرد CV جميل
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 24 }}>
          {/* Featured dark card */}
          <div style={{
            background: 'var(--g900)',
            border: '1.5px solid rgba(197,160,89,0.2)',
            borderRadius: 'var(--r-lg)', padding: '36px 32px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ position: 'absolute', top: 0, insetInline: 0, height: 3, background: 'linear-gradient(90deg, var(--gold500), var(--gold300))' }} />
            <div style={{
              position: 'absolute', top: 18, insetInlineStart: 18, display: 'inline-flex', gap: 5,
              background: 'rgba(197,160,89,0.15)', border: '1px solid rgba(197,160,89,0.35)',
              padding: '3px 12px', borderRadius: 50, fontSize: 11, fontWeight: 700, color: 'var(--gold400)',
            }}>★ الخدمة الرئيسية</div>
            <div style={{ fontSize: 36, marginTop: 28, marginBottom: 20 }}>📄</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>تحسين السيرة الذاتية</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: 20 }}>
              مراجعة احترافية تضمن أن سيرتك تتجاوز أنظمة الفحص الآلي وتصل للمسؤولين الفعليين — مجاناً.
            </div>
            {['توافق مع معايير ATS', 'صياغة بالعربية والإنجليزية', 'مراجعة خلال 48 ساعة'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold400)' }} />{f}
              </div>
            ))}
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="#" style={{
                background: 'var(--gold500)', color: 'var(--g950)',
                padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, textDecoration: 'none',
              }}>افحص سيرتك الآن ✦</a>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '6px 18px', borderRadius: 50,
                background: 'rgba(197,160,89,0.2)', color: 'var(--gold300)',
                border: '1px solid rgba(197,160,89,0.3)',
              }}>مجاني عند التسجيل</span>
            </div>
          </div>
          {[['💼', 'وظائف ودورات موثّقة', 'نجمع الفرص من كبرى الشركات السعودية ونتحقق من مصداقيتها قبل نشرها.', ['وظائف من نيوم وأرامكو وPIF', 'دورات معتمدة ومموّلة', 'تحديث يومي للفرص'], 'مصادر رسمية موثوقة', true, 'var(--gold500)'],
            ['🎯', 'نصائح مهنية موثوقة', 'محتوى مبني على أبحاث الموارد البشرية لبناء حضور مهني قوي في السوق السعودي.', ['نصائح مقابلات الوظائف', 'تطوير ملف LinkedIn', 'مخصصة للسوق السعودي'], 'محتوى حصري', false, 'var(--g400)']
          ].map(([emoji, title, desc, features, tag, gold, accent]) => (
            <div key={title} style={{
              background: '#fff', border: '1.5px solid var(--gray200)',
              borderRadius: 'var(--r-lg)', padding: '32px 28px',
              position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}>
              <div style={{ position: 'absolute', bottom: 0, insetInline: 0, height: 3, background: accent }} />
              <div style={{ fontSize: 28, marginBottom: 20 }}>{emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g950)', marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--gray600)', lineHeight: 1.8, marginBottom: 18 }}>{desc}</div>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray600)', marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--g500)' }} />{f}
                </div>
              ))}
              <span style={{
                marginTop: 20, display: 'inline-block',
                fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 50,
                background: gold ? 'var(--gold100)' : 'var(--g50)',
                color: gold ? 'var(--gold700)' : 'var(--g700)',
              }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" style={{ padding: 'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background: 'var(--gray50)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)', marginBottom: 14 }}>
          <span style={{ width: 28, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
          كيف يعمل
          <span style={{ width: 28, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
        </div>
        <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--g950)', marginBottom: 52 }}>أربع خطوات للوظيفة المناسبة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 32 }}>
          {[['1', 'سجّل مجاناً', 'أنشئ حسابك وأخبرنا عن تخصصك وأهدافك المهنية', 'var(--g50)', 'var(--g800)', 'var(--g200)'],
            ['2', 'حسّن سيرتك', 'ارفع سيرتك الذاتية واحصل على مراجعة احترافية خلال 48 ساعة', 'var(--gold100)', 'var(--gold700)', 'var(--gold300)'],
            ['3', 'اكتشف الفرص', 'تصفّح الوظائف والدورات الموثّقة المناسبة لمجالك وخبرتك', 'var(--g50)', 'var(--g800)', 'var(--g200)'],
            ['4', 'احصل على وظيفتك', 'قدّم بثقة مع الإرشادات التي تدعمك في كل خطوة حتى التعيين', 'var(--g900)', '#fff', 'var(--g700)']
          ].map(([n, t, d, bg, color, border]) => (
            <div key={t} style={{ textAlign: 'center', padding: '0 12px' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: bg, border: `2px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color, margin: '0 auto 20px',
              }}>{n}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 13, color: 'var(--gray600)', lineHeight: 1.75 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TipsSection() {
  const tips = [
    { cat: 'السيرة الذاتية', title: 'كيف تكتب سيرة ذاتية تتجاوز أنظمة ATS في الشركات السعودية', excerpt: '75% من السير الذاتية تُرفض آلياً قبل أن تراها عين بشرية. إليك كيف تضمن وصول سيرتك للمسؤول الفعلي.', read: '5 دقائق', tag: 'الأكثر قراءة' },
    { cat: 'مقابلة العمل', title: 'أكثر 10 أسئلة شيوعاً في مقابلات كبرى الشركات السعودية', excerpt: 'خبراء الموارد البشرية يكشفون الأسئلة المتكررة في أرامكو وSTC وصندوق الاستثمارات العامة.', read: '8 دقائق', tag: '' },
    { cat: 'LinkedIn', title: 'لماذا 80% من التوظيف يحدث عبر LinkedIn وكيف تبني حضوراً مهنياً', excerpt: 'المجندون لا ينتظرون تقديمك — هم يبحثون عنك. إليك خطوات بناء ملف LinkedIn يجذبهم.', read: '6 دقائق', tag: '' },
  ];
  return (
    <section id="tips" style={{ padding: 'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background: 'var(--g950)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <Eyebrow light>نصائح مهنية</Eyebrow>
        <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: '#fff', marginBottom: 14 }}>ارفع مستواك في سوق العمل</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 540, lineHeight: 1.85, marginBottom: 48 }}>
          مقالات مبنية على أبحاث الموارد البشرية ومعطيات سوق العمل السعودي
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20 }}>
          {tips.map(t => (
            <div key={t.title} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--r-lg)', padding: 28,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold400)', marginBottom: 14 }}>
                <span style={{ width: 16, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
                {t.cat}
                {t.tag && <span style={{ marginRight: 'auto', background: 'var(--gold100)', color: 'var(--gold700)', padding: '2px 8px', borderRadius: 50, fontSize: 10 }}>{t.tag}</span>}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.4 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 20 }}>{t.excerpt}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>🕐 {t.read}</span>
                <a href="#" style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold400)', textDecoration: 'none' }}>← اقرأ المقال</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignupCTA() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [done, setDone] = React.useState(false);
  const inpStyle = {
    padding: '14px 20px', border: '1.5px solid var(--gray200)',
    borderRadius: 'var(--r-md)', fontSize: 15, fontFamily: 'var(--font-ar)',
    background: '#fff', outline: 'none', textAlign: 'right', direction: 'rtl',
    width: '100%', marginBottom: 12, boxSizing: 'border-box',
  };
  return (
    <section style={{ padding: 'clamp(60px,8vw,100px) clamp(1rem,4vw,3rem)', background: 'var(--g50)', textAlign: 'center' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)', marginBottom: 14 }}>
          <span style={{ width: 28, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
          انضم الآن
          <span style={{ width: 28, height: 2, background: 'var(--gold500)', borderRadius: 2 }} />
        </div>
        <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', fontWeight: 700, color: 'var(--g950)', marginBottom: 14 }}>كن أول من يعرف عند الإطلاق</h2>
        <p style={{ color: 'var(--gray600)', marginBottom: 36, fontSize: 15, lineHeight: 1.85 }}>
          سجّل الآن واحصل على وصول مبكر مجاني، ومراجعة سيرتك الذاتية، وتنبيهات بأحدث الوظائف.
        </p>
        {!done ? (
          <div style={{
            background: '#fff', border: '1.5px solid var(--gray200)',
            borderRadius: 'var(--r-xl)', padding: 28, boxShadow: 'var(--shadow-lg)',
          }}>
            <input style={inpStyle} placeholder="اسمك" value={name} onChange={e => setName(e.target.value)} />
            <input style={inpStyle} placeholder="بريدك الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={() => name && email.includes('@') && setDone(true)} style={{
              width: '100%', padding: 14, background: 'var(--gold500)', color: '#fff',
              border: 'none', borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 700,
              boxShadow: 'var(--shadow-gold)', cursor: 'pointer', fontFamily: 'inherit',
            }}>احجز مكانك الآن ←</button>
            <p style={{ fontSize: 12, color: 'var(--gray400)', marginTop: 14 }}>بياناتك آمنة ولن تُشارك مع أي طرف ثالث</p>
          </div>
        ) : (
          <div style={{
            background: 'var(--g50)', border: '1px solid var(--g200)',
            borderRadius: 'var(--r-md)', padding: '18px 22px',
            color: 'var(--g700)', fontWeight: 500, fontSize: 14,
          }}>✓ تم تسجيلك بنجاح! سنتواصل معك قريباً.</div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: 'var(--g950)', padding: 'clamp(40px,5vw,64px) clamp(1rem,4vw,3rem) 24px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48,
          paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 28,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src="../../assets/saudi-logo.png" alt="SaudiCareers" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontFamily: 'var(--font-en)', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                Saudi<span style={{ color: 'var(--gold400)' }}>Careers</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 280 }}>
              المنصة السعودية التي ترافقك في كل خطوة من رحلة البحث عن عمل — من تحسين سيرتك حتى الحصول على وظيفتك المثالية.
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-en)', direction: 'ltr', textAlign: 'right', marginTop: 12 }}>
              Your Path to Opportunity
            </p>
          </div>
          {[['روابط سريعة', ['الوظائف', 'خدماتنا', 'نصائح مهنية', 'التسجيل المجاني']],
            ['تواصل معنا', ['saudicareers.site', 'سياسة الخصوصية', 'شروط الاستخدام', 'اتصل بنا']]
          ].map(([heading, items]) => (
            <div key={heading}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(l => <a key={l} href="#" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</a>)}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2025 SaudiCareers.site — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}

function ApplySheet({ job, onClose }) {
  if (!job) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
        background: '#fff', borderRadius: '20px 20px 0 0',
        maxHeight: '88vh', overflowY: 'auto', padding: '12px 20px 28px',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--gray200)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--gray100)',
            border: 'none', fontSize: 20, color: 'var(--gray400)', cursor: 'pointer',
          }}>×</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)' }}>تفاصيل الوظيفة</span>
          <div style={{ width: 32 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--r-sm)',
            background: 'var(--g50)', border: '1px solid var(--g100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>{job.icon}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--g950)' }}>{job.title}</div>
            <div style={{ fontSize: 14, color: 'var(--g700)', fontWeight: 600 }}>{job.company}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[job.location, job.type, `${job.salary} ر.س`].map(t => (
            <span key={t} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 50,
              background: 'var(--g50)', color: 'var(--g700)', fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
        <button onClick={onClose} style={{
          width: '100%', padding: '14px 0',
          background: 'linear-gradient(135deg,#003D2B 0%,#001a0d 100%)',
          color: '#fff', border: 'none', borderRadius: 'var(--r-md)',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}>التقديم الآن ←</button>
      </div>
    </>
  );
}

window.ServicesSection = ServicesSection;
window.HowItWorks = HowItWorks;
window.TipsSection = TipsSection;
window.SignupCTA = SignupCTA;
window.Footer = Footer;
window.ApplySheet = ApplySheet;

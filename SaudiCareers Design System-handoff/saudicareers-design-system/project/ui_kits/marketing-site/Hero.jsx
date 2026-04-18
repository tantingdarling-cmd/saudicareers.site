// Hero.jsx — hero with resume composition beside headline
function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      padding: '120px clamp(1rem,4vw,3rem) 80px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(0,61,43,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 5% 60%, rgba(197,160,89,0.05) 0%, transparent 55%), #F5F5F7',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, insetInline: 0, height: 3, background: 'linear-gradient(90deg, transparent, var(--g700) 40%, var(--gold500) 70%, transparent)' }} />
      <div style={{
        maxWidth: 1160, width: '100%', margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(320px,1fr) minmax(320px,1.15fr)',
        gap: 'clamp(32px,5vw,64px)', alignItems: 'center',
      }} className="hero-grid">

        {/* RIGHT COLUMN (in RTL this renders first visually): copy */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--white)', color: 'var(--g800)',
            border: '1px solid var(--gray200)',
            padding: '5px 16px 5px 12px', borderRadius: 50,
            fontSize: 13, fontWeight: 500, marginBottom: 28,
            boxShadow: '0 1px 4px rgba(0,61,43,0.06)',
          }}>
            <span style={{ width: 7, height: 7, background: 'var(--g600)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            وصول مبكر مجاني — سجّل الآن
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem,4.8vw,3.4rem)', fontWeight: 700, lineHeight: 1.2,
            color: 'var(--g950)', marginBottom: 20, letterSpacing: '-0.5px',
            fontFamily: 'var(--font-ar)', textAlign: 'right',
          }}>ارفع مستواك في سوق العمل</h1>
          <p style={{
            fontSize: 'clamp(1rem,1.6vw,1.1rem)', color: 'var(--gray600)',
            maxWidth: 480, marginBottom: 36, lineHeight: 1.9, fontWeight: 500, textAlign: 'right',
          }}>
            حلّل سيرتك الذاتية، اكتشف نقاط التحسين، وتنافس على أفضل الفرص في السوق السعودي.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
            <a href="#" style={{
              background: 'linear-gradient(135deg,#003D2B 0%,#001a0d 100%)', color: '#fff',
              padding: '13px 28px', borderRadius: 'var(--r-md)',
              fontSize: 15, fontWeight: 600, textDecoration: 'none',
            }}>افحص سيرتك مجاناً ✦</a>
            <button onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })} style={{
              background: '#fff', color: 'var(--g900)',
              padding: '13px 28px', borderRadius: 'var(--r-md)',
              fontSize: 15, fontWeight: 600, border: '1.5px solid var(--gray200)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>تصفّح الوظائف</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--gray400)' }}>
            <div style={{ display: 'flex', direction: 'ltr' }}>
              {['أح', 'سم', 'عب', '+'].map((t, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%', border: '2px solid #F5F5F7',
                  marginRight: -8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: i === 3 ? 'var(--g900)' : ['var(--g100)', 'var(--gold100)', 'var(--g200)'][i],
                  color: i === 3 ? '#fff' : ['var(--g800)', 'var(--gold700)', 'var(--g900)'][i],
                }}>{t}</div>
              ))}
            </div>
            <span>انضم أكثر من <strong style={{ color: 'var(--g800)' }}>120+</strong> محترف</span>
          </div>
        </div>

        {/* LEFT COLUMN: resume composition with animated badges */}
        <div aria-hidden="true" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', maxHeight: 560 }}>
          {/* resume base with subtle float */}
          <div style={{
            position: 'absolute', inset: '4% 6% 8% 6%',
            borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(0,61,43,0.15), 0 4px 14px rgba(0,0,0,0.06)',
            background: '#fff',
            animation: 'heroFloat 7s ease-in-out infinite',
            transform: 'rotate(-1.5deg)',
          }}>
            {['../../assets/resume-1.png', '../../assets/resume-2.png', '../../assets/resume-3.png', '../../assets/resume-4.png'].map((src, i) => (
              <img key={i} src={src} alt="" style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block',
                opacity: 0,
                animation: `heroResumeCycle 14s ease-in-out infinite`,
                animationDelay: `${i * 3.5}s`,
              }} />
            ))}
          </div>

          {/* Target / improvement chip — top-right */}
          <div style={{
            position: 'absolute', top: '18%', insetInlineEnd: '-2%',
            width: 86, height: 86, borderRadius: 22,
            background: 'linear-gradient(135deg,#EDF7F2 0%,#D4EDE0 100%)',
            border: '1px solid var(--g200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(0,61,43,0.14)',
            animation: 'heroBadge1 5s ease-in-out infinite',
          }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#006644" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="#006644"/>
            </svg>
          </div>

          {/* Score ring — right side */}
          <div style={{
            position: 'absolute', top: '38%', insetInlineStart: '-4%',
            width: 150, height: 150, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 16px 40px rgba(0,61,43,0.16)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'heroBadge2 6s ease-in-out infinite',
          }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="62" fill="none" stroke="var(--gray100)" strokeWidth="11" />
              <circle cx="75" cy="75" r="62" fill="none" stroke="var(--g600)" strokeWidth="11" strokeLinecap="round"
                strokeDasharray="390" strokeDashoffset="56" transform="rotate(-90 75 75)">
                <animate attributeName="stroke-dashoffset" from="390" to="56" dur="2.5s" fill="freeze" />
              </circle>
              <text x="75" y="70" textAnchor="middle" dominantBaseline="central"
                fontSize="34" fontWeight="800" fill="var(--g950)" fontFamily="Plus Jakarta Sans">48</text>
              <text x="75" y="98" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--gray600)" fontFamily="Noto Sans Arabic">المعدل: مقبول</text>
            </svg>
          </div>

          {/* Suggestions pill — bottom */}
          <div style={{
            position: 'absolute', bottom: '4%', insetInlineEnd: '14%',
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: '#fff',
            padding: '12px 22px 12px 12px',
            borderRadius: 50,
            boxShadow: '0 12px 32px rgba(0,61,43,0.14)',
            animation: 'heroBadge3 5.5s ease-in-out infinite',
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--g700)', color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700,
            }}>!</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', whiteSpace: 'nowrap' }}>
              <span style={{ fontFamily: 'var(--font-en)', color: 'var(--gold600)' }}>4</span> اقتراحات للتحسين
            </span>
          </div>

          {/* tiny sparkle */}
          <div style={{
            position: 'absolute', top: '8%', insetInlineStart: '12%',
            width: 10, height: 10, borderRadius: '50%', background: 'var(--gold500)',
            boxShadow: '0 0 0 4px rgba(197,160,89,0.18)',
            animation: 'heroSpark 2.4s ease-in-out infinite',
          }} />
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;

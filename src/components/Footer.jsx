import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background:'var(--g950)', padding:'clamp(40px,5vw,64px) clamp(1rem,4vw,3rem) 24px' }}>
      <div style={{ maxWidth:1160, margin:'0 auto' }}>
        <div style={{
          display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:48,
          paddingBottom:40, borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:28,
        }} className="footer-grid">

          {/* Brand */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <img src="/saudi.png" alt="Saudi Careers" style={{ width:42, height:42, borderRadius:'50%', objectFit:'cover' }} />
              <span style={{ fontFamily:'var(--font-en)', fontWeight:700, fontSize:16, color:'var(--white)' }}>
                Saudi<span style={{ color:'var(--gold400)' }}>Careers</span>
              </span>
            </Link>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.8, maxWidth:280 }}>
              المنصة السعودية التي ترافقك في كل خطوة من رحلة البحث عن عمل — من تحسين سيرتك حتى الحصول على وظيفتك المثالية.
            </p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', fontFamily:'var(--font-en)', direction:'ltr', textAlign:'right' }}>
              Your Path to Opportunity
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--white)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>روابط سريعة</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['الوظائف','خدماتنا','نصائح مهنية','التسجيل المجاني'].map(l => (
                <a key={l} href="#" style={{ fontSize:14, color:'rgba(255,255,255,0.5)', transition:'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--gold400)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}>{l}</a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--white)', marginBottom:16, textTransform:'uppercase', letterSpacing:1 }}>تواصل معنا</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['saudicareers.site','سياسة الخصوصية','شروط الاستخدام','اتصل بنا'].map(l => (
                <a key={l} href="#" style={{ fontSize:14, color:'rgba(255,255,255,0.5)', transition:'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='var(--gold400)'}
                  onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.5)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>
            © 2025 <a href="https://saudicareers.site" style={{ color:'rgba(255,255,255,0.5)' }}>SaudiCareers.site</a> — جميع الحقوق محفوظة
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }
      `}</style>
    </footer>
  )
}

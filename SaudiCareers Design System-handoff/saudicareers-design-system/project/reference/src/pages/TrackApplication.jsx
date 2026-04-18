import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Building2, Loader, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { applicationsApi } from '../services/api'

const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

export default function TrackApplication() {
  const { token } = useParams()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    applicationsApi.track(token)
      .then(setData)
      .catch(() => setError('لم يُعثر على هذا الطلب أو انتهت صلاحيته'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:68 }}>
      <Loader size={36} color="var(--g600)" style={{ animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  if (error || !data) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', paddingTop:68, gap:16, padding:'80px 24px' }}>
      <AlertCircle size={48} color="var(--gray400)" />
      <div style={{ fontSize:16, color:'var(--gray600)', textAlign:'center' }}>{error}</div>
      <Link to="/" style={{ color:'var(--g700)', fontWeight:600, fontSize:14 }}>← العودة للرئيسية</Link>
    </div>
  )

  const isRejected  = data.is_rejected
  const isWithdrawn = data.is_withdrawn
  const isAccepted  = data.status === 'accepted'
  const icon = CATEGORY_ICONS[data.job?.category] || '💼'

  return (
    <>
      <Helmet>
        <title>تتبع طلب التوظيف | سعودي كارييرز</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ minHeight:'100vh', background:'var(--gray50)', paddingTop:88, paddingBottom:60 }}>
        <div style={{ maxWidth:600, margin:'0 auto', padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,1.5rem)' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--g600)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>
              تتبع طلب التوظيف
            </div>
            <h1 style={{ fontSize:'clamp(22px,4vw,28px)', fontWeight:800, color:'var(--g950)', marginBottom:6 }}>
              حالة طلبك
            </h1>
            {data.applied_at && (
              <div style={{ fontSize:13, color:'var(--gray400)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <Clock size={13} /> تاريخ التقديم: {data.applied_at}
              </div>
            )}
          </div>

          {/* Job Info Card */}
          {data.job && (
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ width:48, height:48, borderRadius:'var(--r-md)', background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                {icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:700, color:'var(--g950)', marginBottom:4 }}>{data.job.title}</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'var(--g700)', fontWeight:600 }}>
                    <Building2 size={13} />{data.job.company}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'var(--gray500)' }}>
                    <MapPin size={13} />{data.job.location}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status — Rejected / Withdrawn special case */}
          {(isRejected || isWithdrawn) ? (
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'28px 24px', marginBottom:24, textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
              <XCircle size={48} color="var(--gray400)" style={{ marginBottom:12 }} />
              <div style={{ fontSize:17, fontWeight:700, color:'var(--gray700)', marginBottom:8 }}>
                {isRejected ? 'نعتذر، لم يتم اختيارك في هذه المرة' : 'تم سحب الطلب'}
              </div>
              <div style={{ fontSize:13, color:'var(--gray500)', lineHeight:1.8 }}>
                {isRejected ? 'شكراً لاهتمامك. لا تيأس — تصفّح المزيد من الفرص المناسبة لك' : 'تم سحب هذا الطلب'}
              </div>
              <Link to="/" style={{ display:'inline-block', marginTop:20, padding:'11px 28px', background:'var(--g900)', color:'var(--white)', borderRadius:'var(--r-md)', fontSize:14, fontWeight:600, textDecoration:'none' }}>
                تصفّح وظائف أخرى ←
              </Link>
            </div>
          ) : (
            /* Timeline */
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'28px 24px', marginBottom:24, boxShadow:'var(--shadow-sm)' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--g950)', marginBottom:24 }}>مراحل طلبك</div>

              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {data.stages.map((stage, i) => {
                  const isDone    = i < data.current_stage_order
                  const isCurrent = i === data.current_stage_order && !isAccepted
                  const isLast    = isAccepted && i === data.stages.length - 1

                  const dotColor = isDone || isLast
                    ? 'var(--g600)'
                    : isCurrent
                      ? 'var(--g900)'
                      : 'var(--gray300)'

                  const labelColor = isDone || isLast || isCurrent
                    ? 'var(--g950)'
                    : 'var(--gray400)'

                  return (
                    <div key={stage.key} style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                      {/* Dot + line */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                        <div style={{
                          width:32, height:32, borderRadius:'50%',
                          background: isDone || isLast ? 'var(--g50)' : isCurrent ? 'var(--g900)' : 'var(--gray100)',
                          border: `2px solid ${dotColor}`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:16,
                          transition:'all 0.3s',
                        }}>
                          {isDone || isLast
                            ? <CheckCircle size={16} color="var(--g600)" />
                            : isCurrent
                              ? <span style={{ fontSize:14 }}>{stage.icon}</span>
                              : <span style={{ fontSize:14, opacity:0.4 }}>{stage.icon}</span>
                          }
                        </div>
                        {i < data.stages.length - 1 && (
                          <div style={{
                            width:2, height:40,
                            background: isDone ? 'var(--g300)' : 'var(--gray200)',
                            transition:'background 0.3s',
                          }} />
                        )}
                      </div>

                      {/* Label */}
                      <div style={{ paddingTop:6, paddingBottom: i < data.stages.length - 1 ? 40 : 0 }}>
                        <div style={{ fontSize:14, fontWeight: isCurrent || isDone ? 700 : 400, color: labelColor, lineHeight:1.4 }}>
                          {stage.label}
                        </div>
                        {isCurrent && (
                          <div style={{ fontSize:12, color:'var(--g600)', fontWeight:600, marginTop:3 }}>
                            ← أنت هنا الآن
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Accepted celebration */}
              {isAccepted && (
                <div style={{ marginTop:20, padding:'16px 20px', background:'var(--g50)', border:'1.5px solid var(--g200)', borderRadius:'var(--r-md)', textAlign:'center' }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>🎉</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--g800)' }}>تهانينا! تم قبولك</div>
                  <div style={{ fontSize:13, color:'var(--g600)', marginTop:4 }}>سيتواصل معك فريق التوظيف قريباً</div>
                </div>
              )}
            </div>
          )}

          {/* Match Score */}
          {data.match_score !== null && data.match_score !== undefined && (
            <div style={{ background:'var(--white)', border:'1.5px solid var(--gray200)', borderRadius:'var(--r-lg)', padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16, boxShadow:'var(--shadow-sm)' }}>
              <div style={{
                width:56, height:56, borderRadius:'50%', flexShrink:0,
                background: data.match_score >= 80 ? 'var(--g50)' : data.match_score >= 50 ? '#FEF3C7' : '#FEE2E2',
                border: `2px solid ${data.match_score >= 80 ? 'var(--g300)' : data.match_score >= 50 ? '#FCD34D' : '#FCA5A5'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:16, fontWeight:800,
                color: data.match_score >= 80 ? 'var(--g700)' : data.match_score >= 50 ? '#92400E' : '#991B1B',
              }}>
                {Math.round(data.match_score)}%
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--g950)', marginBottom:3 }}>درجة المطابقة</div>
                <div style={{ fontSize:12, color:'var(--gray500)', lineHeight:1.6 }}>
                  {data.match_score >= 80
                    ? 'طلبك من الطلبات المميزة ويُراجع بأولوية عالية'
                    : data.match_score >= 50
                      ? 'طلبك يوافق جزءاً من متطلبات الوظيفة'
                      : 'طلبك يخضع للمراجعة اليدوية'}
                </div>
              </div>
            </div>
          )}

          {/* Footer CTA */}
          {!isAccepted && (
            <div style={{ textAlign:'center' }}>
              <Link to="/" style={{ fontSize:14, color:'var(--g600)', fontWeight:600, textDecoration:'none' }}>
                ← تصفّح المزيد من الوظائف
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

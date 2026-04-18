import { useState, useEffect, useRef } from 'react'
import { salaryApi } from '../services/api.js'

const CATEGORY_LABELS = {
  tech: 'تقنية', finance: 'مالية', energy: 'طاقة', construction: 'إنشاءات',
  hr: 'موارد بشرية', marketing: 'تسويق', healthcare: 'صحة', education: 'تعليم', other: 'أخرى',
}
const EXP_LABELS = {
  entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير', lead: 'قائد', executive: 'تنفيذي',
}

function fmt(n) { return n ? Number(n).toLocaleString('en') : '—' }

function useChartJs(ready) {
  const [loaded, setLoaded] = useState(!!window.Chart)
  useEffect(() => {
    if (!ready || window.Chart) { setLoaded(!!window.Chart); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js'
    s.onload = () => setLoaded(true)
    document.head.appendChild(s)
  }, [ready])
  return loaded
}

function BarChart({ labels, data, color = '#003D2B', title }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return
    if (chartRef.current) chartRef.current.destroy()
    chartRef.current = new window.Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data, backgroundColor: color + 'CC', borderColor: color, borderWidth: 1.5, borderRadius: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { callback: v => fmt(v) + ' ر.س', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
          y: { ticks: { font: { size: 12 }, color: '#374151' } },
        },
      },
    })
    return () => chartRef.current?.destroy()
  }, [labels, data, color])

  return (
    <div>
      {title && <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 12 }}>{title}</h3>}
      <div style={{ height: Math.max(180, labels.length * 40) }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default function SalaryInsights() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const chartLoaded = useChartJs(!loading && !!stats)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (category) params.category = category
    if (location) params.location = location
    salaryApi.getStats(params)
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, location])

  const card = (label, value, sub) => (
    <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 14, padding: '20px 24px', flex: '1 1 160px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: 'var(--gray400)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--g950)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--gray400)', marginTop: 4 }}>{sub}</div>}
    </div>
  )

  const selectStyle = {
    padding: '9px 14px', borderRadius: 10, fontSize: 13,
    border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
    outline: 'none', background: 'var(--white)', color: 'var(--g950)', cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 64px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold600)', marginBottom: 8 }}>
          📊 بيانات السوق
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--g950)', marginBottom: 8 }}>رواتب سوق العمل السعودي</h1>
        <p style={{ color: 'var(--gray400)', fontSize: 14 }}>تحليل بيانات الرواتب من الوظائف المنشورة على المنصة</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          <option value="">كل التصنيفات</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          value={location} onChange={e => setLocation(e.target.value)}
          placeholder="المدينة..."
          style={{ ...selectStyle, width: 160 }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 64 }}>جاري التحليل…</div>
      )}

      {!loading && stats && (
        <>
          {/* Overall cards */}
          {stats.overall ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 36 }}>
              {card('متوسط الراتب', fmt(stats.overall.avg) + ' ر.س', 'شهرياً')}
              {card('الوسيط', fmt(stats.overall.median) + ' ر.س', 'شهرياً')}
              {card('أعلى راتب', fmt(stats.overall.max) + ' ر.س', 'شهرياً')}
              {card('عدد الوظائف', stats.overall.count, 'وظيفة براتب معلن')}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 48 }}>لا توجد بيانات رواتب كافية</div>
          )}

          {chartLoaded && stats.overall && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 24 }}>
              {/* By category */}
              {stats.by_category?.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24 }}>
                  <BarChart
                    title="متوسط الراتب حسب التصنيف"
                    labels={stats.by_category.map(r => CATEGORY_LABELS[r.category] || r.category)}
                    data={stats.by_category.map(r => r.avg)}
                    color="#003D2B"
                  />
                </div>
              )}

              {/* By experience */}
              {stats.by_experience?.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24 }}>
                  <BarChart
                    title="سلّم الراتب حسب الخبرة"
                    labels={stats.by_experience.map(r => EXP_LABELS[r.level] || r.level)}
                    data={stats.by_experience.map(r => r.avg)}
                    color="#C5A059"
                  />
                </div>
              )}

              {/* By location */}
              {stats.by_location?.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24, gridColumn: 'span 1' }}>
                  <BarChart
                    title="متوسط الراتب حسب المدينة (أعلى 8)"
                    labels={stats.by_location.map(r => r.location)}
                    data={stats.by_location.map(r => r.avg)}
                    color="#1E4A63"
                  />
                </div>
              )}

              {/* Experience table */}
              {stats.by_experience?.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1.5px solid var(--gray200)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g950)', marginBottom: 16 }}>تفاصيل الخبرة</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: 'var(--gray400)', fontSize: 11 }}>
                        {['المستوى', 'أدنى', 'متوسط', 'أعلى', 'عدد'].map(h => (
                          <th key={h} style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 600 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.by_experience.map((r, i) => (
                        <tr key={r.level} style={{ borderTop: '1px solid var(--gray100)', background: i % 2 ? 'var(--g50)' : 'transparent' }}>
                          <td style={{ padding: '8px', fontWeight: 600, color: 'var(--g800)' }}>{EXP_LABELS[r.level] || r.level}</td>
                          <td style={{ padding: '8px', color: 'var(--gray600)' }}>{fmt(r.min)}</td>
                          <td style={{ padding: '8px', fontWeight: 700, color: 'var(--g900)' }}>{fmt(r.avg)}</td>
                          <td style={{ padding: '8px', color: 'var(--gray600)' }}>{fmt(r.max)}</td>
                          <td style={{ padding: '8px', color: 'var(--gray400)' }}>{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!chartLoaded && stats.overall && (
            <div style={{ textAlign: 'center', color: 'var(--gray400)', padding: 32 }}>جاري تحميل الرسوم البيانية…</div>
          )}
        </>
      )}
    </div>
  )
}

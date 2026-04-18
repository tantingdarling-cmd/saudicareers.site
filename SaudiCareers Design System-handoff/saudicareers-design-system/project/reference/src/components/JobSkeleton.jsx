// §6: Skeleton shown while jobs API is in-flight.
// Uses .skeleton-shimmer CSS class (global.css) for the gradient sweep effect.
// RTL-aware: shimmer direction is reversed in [dir="rtl"] via global.css rule.
// Animation stops automatically when loadingJobs=false (elements unmount).
export default function JobSkeleton() {
  const bar = (width, height = 11, mb = 8) => ({
    height,
    borderRadius: 6,
    marginBottom: mb,
    width,
  })

  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--gray200)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
    }}>
      {/* Company header row */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <div className="skeleton-shimmer" style={{ width:40, height:40, borderRadius:'var(--r-md)', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skeleton-shimmer" style={bar('55%')} />
          <div className="skeleton-shimmer" style={bar('38%', 10, 0)} />
        </div>
      </div>

      {/* Job title */}
      <div className="skeleton-shimmer" style={bar('72%', 15, 10)} />

      {/* Location */}
      <div className="skeleton-shimmer" style={bar('48%', 11, 18)} />

      {/* Tag pills */}
      <div style={{ display:'flex', gap:8 }}>
        {[58, 82, 52].map((w, i) => (
          <div key={i} className="skeleton-shimmer" style={{ height:24, width:w, borderRadius:50 }} />
        ))}
      </div>
    </div>
  )
}

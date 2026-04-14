// §6: Skeleton placeholder shown while jobs API is loading.
// Matches the visual footprint of JobCard to prevent layout shift.
export default function JobSkeleton() {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1.5px solid var(--gray200)',
      borderRadius: 'var(--r-lg)',
      padding: 24,
      animation: 'skPulse 1.5s ease-in-out infinite',
    }}>
      {/* Company header row */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <div style={{ width:40, height:40, borderRadius:'var(--r-md)', background:'var(--gray200)', flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div style={{ height:11, background:'var(--gray200)', borderRadius:6, width:'55%', marginBottom:8 }} />
          <div style={{ height:10, background:'var(--gray200)', borderRadius:6, width:'38%' }} />
        </div>
      </div>
      {/* Job title */}
      <div style={{ height:15, background:'var(--gray200)', borderRadius:6, width:'72%', marginBottom:10 }} />
      {/* Location line */}
      <div style={{ height:11, background:'var(--gray200)', borderRadius:6, width:'48%', marginBottom:18 }} />
      {/* Tag pills */}
      <div style={{ display:'flex', gap:8 }}>
        {[58, 82, 52].map((w, i) => (
          <div key={i} style={{ height:24, width:w, background:'var(--gray100)', borderRadius:50 }} />
        ))}
      </div>
      <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.42} }`}</style>
    </div>
  )
}

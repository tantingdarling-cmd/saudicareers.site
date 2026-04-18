export default function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gray50)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--g100)',
          animation: 'pgPulse 1.4s ease-in-out infinite',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {[140, 100, 120].map((w, i) => (
            <div key={i} style={{
              height: 11,
              width: w,
              borderRadius: 6,
              background: 'var(--gray200)',
              animation: `pgPulse 1.4s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pgPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

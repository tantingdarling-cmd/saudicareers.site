import { useRef, useEffect } from 'react'

/**
 * Hook: يُضيف كلاس `is-visible` عند ظهور العنصر في الـ viewport.
 * يعتمد على CSS class في global.css:
 *   .fade-in-section { opacity:0; transform:translateY(30px); transition:... }
 *   .fade-in-section.is-visible { opacity:1; transform:none; }
 *
 * الاستخدام:
 *   const ref = useFadeIn()
 *   return <section ref={ref} className="fade-in-section">...</section>
 */
export function useFadeIn(threshold = 0.1) {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible')
        obs.disconnect()
      }
    }, { threshold, rootMargin: '0px 0px -50px 0px' })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'

const PUBLIC_SETTINGS_URL =
  (import.meta.env.VITE_API_URL || 'https://saudicareers.site/api') + '/v1/settings/public'

/**
 * AnalyticsHead — يحقن GA4 / GTM / Facebook Pixel تلقائياً
 * بناءً على الإعدادات المخزّنة في جدول settings.
 *
 * يُضاف مرة واحدة في App.jsx فوق <Routes>.
 * الـ IDs تُجلب من /api/v1/settings/public (cached 1h في الـ backend).
 */
export default function AnalyticsHead() {
  const [ids, setIds] = useState({ ga: null, gtm: null, pixel: null })
  const [siteSchema, setSiteSchema] = useState(null)

  useEffect(() => {
    // تحقق من الـ cache المحلي أولاً (TTL: 1 ساعة)
    const cached = sessionStorage.getItem('sc_analytics')
    if (cached) {
      try { 
        const parsed = JSON.parse(cached)
        setIds(parsed)
        if (parsed.siteSchema) setSiteSchema(parsed.siteSchema)
        return 
      } catch (_) {}
    }

    fetch(PUBLIC_SETTINGS_URL)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        const newIds = {
          ga:    data['analytics.ga_id']    || null,
          gtm:   data['analytics.gtm_id']   || null,
          pixel: data['analytics.fb_pixel'] || null,
          siteSchema: data['site_schema']   || null,
        }
        setIds(newIds)
        setSiteSchema(newIds.siteSchema)
        sessionStorage.setItem('sc_analytics', JSON.stringify(newIds))
      })
      .catch(() => {})
  }, [])

  return (
    <Helmet>
      {/* ── §Google: Site-wide Structured Data (Organization + WebSite) ── */}
      {siteSchema && (
        <script type="application/ld+json">
          {JSON.stringify(siteSchema).replace(/<\/script>/gi, '<\\/script>')}
        </script>
      )}
      {/* ── Google Tag Manager ──────────────────────────────────── */}
      {ids.gtm && (
        <script>{`
          (function(w,d,s,l,i){
            w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${ids.gtm}');
        `}</script>
      )}

      {/* ── Google Analytics 4 (مباشرة بدون GTM) ──────────────── */}
      {ids.ga && !ids.gtm && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ids.ga}`}/>
      )}
      {ids.ga && !ids.gtm && (
        <script>{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','${ids.ga}',{send_page_view:true});
        `}</script>
      )}

      {/* ── Facebook Pixel ──────────────────────────────────────── */}
      {ids.pixel && (
        <script>{`
          !function(f,b,e,v,n,t,s){
            if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)
          }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${ids.pixel}');
          fbq('track','PageView');
        `}</script>
      )}
    </Helmet>
  )
}

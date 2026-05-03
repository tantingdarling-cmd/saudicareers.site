import { useEffect } from 'react'

/**
 * Injects JSON-LD JobPosting structured data for Google Jobs.
 * Google can show these directly in search results — very high impact for a job board.
 */
export default function JobStructuredData({ jobs }) {
  useEffect(() => {
    if (!jobs?.length) return

    const existing = document.getElementById('job-structured-data')
    if (existing) existing.remove()

    const jobListings = jobs.slice(0, 20).map(job => ({
      '@type': 'JobPosting',
      '@context': 'https://schema.org',
      title: job.title,
      description: job.description || `وظيفة ${job.title} في ${job.company} — ${job.location}`,
      keywords: buildKeywords(job),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
        ...(job.company_logo && { logo: job.company_logo }),
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'SA',
        },
      },
      employmentType: mapEmploymentType(job.job_type || job.type),
      // url canonical — يطابق الـ sitemap
      url: `https://saudicareers.site/jobs/${job.slug || job.id}`,
      datePosted: job.created_at || new Date().toISOString().split('T')[0],
      validThrough: getValidThrough(),
      // directApply فقط عند وجود رابط خارجي
      directApply: job.apply_url ? true : false,
      ...(job.salary_min && {
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'SAR',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salary_min,
            maxValue: job.salary_max || job.salary_min,
            unitText: 'MONTH',
          },
        },
      }),
      jobBenefits: 'حزمة رواتب تنافسية، تأمين طبي، بيئة عمل احترافية',
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'Saudi Arabia',
      },
    }))

    const script = document.createElement('script')
    script.id = 'job-structured-data'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jobListings.length === 1 ? jobListings[0] : {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: jobListings.map((job, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: job,
      })),
    })
    document.head.appendChild(script)

    return () => {
      const el = document.getElementById('job-structured-data')
      if (el) el.remove()
    }
  }, [jobs])

  return null
}

function buildKeywords(job) {
  const base = ['وظائف السعودية', 'سوق العمل السعودي', 'رؤية 2030', 'توطين', 'توطين الوظائف']
  const location = job.location?.includes('الرياض') ? ['وظائف الرياض', 'وظائف شاغرة الرياض'] : []
  const tech = ['tech', 'تقنية', 'technology'].some(k => (job.category || '').includes(k))
    ? ['وظائف تقنية', 'وظائف برمجة', 'وظائف تكنولوجيا السعودية'] : []
  return [...base, ...location, ...tech, job.title, job.company].filter(Boolean).join(', ')
}

function mapEmploymentType(type) {
  const map = {
    full_time: 'FULL_TIME', 'دوام كامل': 'FULL_TIME',
    part_time: 'PART_TIME', 'دوام جزئي': 'PART_TIME',
    contract: 'CONTRACTOR', 'عقد': 'CONTRACTOR',
    internship: 'INTERN', 'تدريب': 'INTERN',
    remote: 'FULL_TIME', 'عن بعد': 'FULL_TIME',
    hybrid: 'FULL_TIME', 'هجين': 'FULL_TIME',
  }
  return map[type] || 'FULL_TIME'
}

function getValidThrough() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

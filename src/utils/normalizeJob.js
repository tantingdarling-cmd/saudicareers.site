const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

const EXP_LABELS = {
  entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير', lead: 'قائد', executive: 'تنفيذي',
}

const fmtNum = n => { const v = parseInt(n, 10); return isNaN(v) ? String(n) : v.toLocaleString('en-US') }

export function normalizeJob(job) {
  const tags = [job.category_label, EXP_LABELS[job.experience_level], job.job_type_label]
    .filter(Boolean).slice(0, 3)

  const salary = job.salary_min && job.salary_max
    ? `${fmtNum(job.salary_min)} - ${fmtNum(job.salary_max)} ر.س`
    : job.salary ? `${fmtNum(job.salary)} ر.س` : 'يُحدد عند التواصل'

  return {
    id: job.id,
    company: job.company,
    company_slug: job.company_slug || null,
    icon: CATEGORY_ICONS[job.category] || '💼',
    title: job.title,
    location: job.location,
    type: job.job_type_label || job.job_type,
    salary,
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    tags,
    badge: job.is_featured ? 'featured' : '',
    badgeText: job.is_featured ? 'حصرية' : '',
    posted: job.posted_at || 'حديثاً',
    category: job.category,
    description: job.description,
    apply_url: job.apply_url || null,
    is_government_partner: job.is_government_partner || false,
    is_urgent: job.is_urgent || false,
    partner_logo: job.partner_logo || null,
  }
}

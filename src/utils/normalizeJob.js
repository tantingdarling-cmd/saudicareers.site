const CATEGORY_ICONS = {
  tech: '💻', finance: '🏦', energy: '⚡', construction: '🏗️',
  hr: '👥', marketing: '📣', healthcare: '🏥', education: '🎓', other: '💼',
}

const EXP_LABELS = {
  entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير', lead: 'قائد', executive: 'تنفيذي',
}

export function normalizeJob(job) {
  const tags = [job.category_label, EXP_LABELS[job.experience_level], job.job_type_label]
    .filter(Boolean).slice(0, 3)
  return {
    id: job.id,
    company: job.company,
    company_slug: job.company_slug || null,
    icon: CATEGORY_ICONS[job.category] || '💼',
    title: job.title,
    location: job.location,
    type: job.job_type_label || job.job_type,
    salary: job.salary || 'يُحدد عند التواصل',
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    tags,
    badge: job.is_featured ? 'featured' : '',
    badgeText: job.is_featured ? 'حصرية' : '',
    posted: job.posted_at || 'حديثاً',
    category: job.category,
    description: job.description,
    is_government_partner: job.is_government_partner || false,
    is_urgent: job.is_urgent || false,
    partner_logo: job.partner_logo || null,
  }
}

import { useState, useEffect } from 'react'
import { jobsApi } from '../services/api.js'
import { normalizeJob } from '../utils/normalizeJob.js'
import JobCard from '../components/JobCard.jsx'
import ApplyModal from '../components/ApplyModal.jsx'

export default function SavedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applyJob, setApplyJob] = useState(null)

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('saved_jobs') || '[]')
    if (!ids.length) { setLoading(false); return }

    Promise.all(ids.map(id => jobsApi.getById(id).then(r => normalizeJob(r.data)).catch(() => null)))
      .then(results => setJobs(results.filter(Boolean)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth:1200, margin:'0 auto', padding:'100px 24px 64px', direction:'rtl' }}>
      <h1 style={{ fontSize:28, fontWeight:800, color:'var(--g950)', marginBottom:8 }}>
        الوظائف المحفوظة
      </h1>
      <p style={{ color:'var(--gray400)', marginBottom:36 }}>{jobs.length} وظيفة</p>

      {loading && (
        <div style={{ color:'var(--gray400)', textAlign:'center', padding:64 }}>جاري التحميل…</div>
      )}

      {!loading && jobs.length === 0 && (
        <div style={{ textAlign:'center', padding:80, color:'var(--gray400)' }}>
          لم تحفظ أي وظيفة بعد
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:24 }}>
        {jobs.map((job, i) => (
          <JobCard key={job.id} job={job} onApply={setApplyJob} delay={i * 60} />
        ))}
      </div>

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </div>
  )
}

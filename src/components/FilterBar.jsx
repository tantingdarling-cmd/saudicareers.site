import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Bell } from 'lucide-react'

const CATEGORIES = [
  { key: '', label: 'كل التصنيفات' },
  { key: 'tech', label: 'تقنية' },
  { key: 'finance', label: 'مالية' },
  { key: 'energy', label: 'طاقة' },
  { key: 'construction', label: 'إنشاءات' },
  { key: 'hr', label: 'موارد بشرية' },
  { key: 'marketing', label: 'تسويق' },
  { key: 'healthcare', label: 'صحة' },
  { key: 'education', label: 'تعليم' },
  { key: 'other', label: 'أخرى' },
]

const JOB_TYPES = [
  { key: '', label: 'كل الأنواع' },
  { key: 'full_time', label: 'دوام كامل' },
  { key: 'part_time', label: 'دوام جزئي' },
  { key: 'contract', label: 'عقد' },
  { key: 'freelance', label: 'مستقل' },
  { key: 'internship', label: 'تدريب' },
]

const EXPERIENCE = [
  { key: '', label: 'كل المستويات' },
  { key: 'entry', label: 'مبتدئ' },
  { key: 'mid', label: 'متوسط' },
  { key: 'senior', label: 'خبير' },
  { key: 'lead', label: 'قائد' },
  { key: 'executive', label: 'تنفيذي' },
]

const selectStyle = {
  padding: '10px 14px', borderRadius: 10, fontSize: 13,
  border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
  outline: 'none', background: 'var(--white)', color: 'var(--g950)',
  cursor: 'pointer', minWidth: 0,
}

const inputStyle = {
  padding: '10px 14px', borderRadius: 10, fontSize: 13,
  border: '1.5px solid var(--gray200)', fontFamily: 'var(--font-ar)',
  outline: 'none', background: 'var(--white)', color: 'var(--g950)',
  width: '100%', boxSizing: 'border-box',
}

export default function FilterBar({ filters, onChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [alertSaved, setAlertSaved]     = useState(false)
  const navigate = useNavigate()

  function saveSearch() {
    sessionStorage.setItem('alert_prefill', JSON.stringify({
      q: filters.q || '',
      location: filters.location || '',
      category: filters.category || '',
    }))
    navigate('/alerts')
  }

  const hasFilters = Object.values(filters).some(v => v !== '' && v != null)

  function set(key, val) {
    onChange({ ...filters, [key]: val })
  }

  function clearAll() {
    onChange({ q: '', location: '', category: '', job_type: '', experience_level: '', salary_min: '', salary_max: '' })
  }

  return (
    <div style={{ marginBottom: 32, direction: 'rtl' }}>
      {/* Search row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <Search size={15} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--gray400)', pointerEvents: 'none',
          }} />
          <input
            value={filters.q || ''}
            onChange={e => set('q', e.target.value)}
            placeholder="ابحث عن وظيفة، شركة..."
            style={{ ...inputStyle, paddingRight: 36 }}
          />
        </div>
        <div style={{ flex: '1 1 160px', position: 'relative' }}>
          <input
            value={filters.location || ''}
            onChange={e => set('location', e.target.value)}
            placeholder="المدينة..."
            style={inputStyle}
          />
        </div>
        <select value={filters.category || ''} onChange={e => set('category', e.target.value)} style={{ ...selectStyle, flex: '1 1 140px' }}>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <button
          onClick={() => setShowAdvanced(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${showAdvanced ? 'var(--g900)' : 'var(--gray200)'}`,
            background: showAdvanced ? 'var(--g900)' : 'var(--white)',
            color: showAdvanced ? '#fff' : 'var(--g700)',
            cursor: 'pointer', fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap',
          }}
        >
          <SlidersHorizontal size={14} /> فلاتر
        </button>

        {hasFilters && (
          <>
            <button
              onClick={saveSearch}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1.5px solid rgba(0,102,68,0.3)', background: 'rgba(0,102,68,0.07)', color: 'var(--g700)', cursor: 'pointer', fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,102,68,0.13)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,102,68,0.07)' }}
            >
              <Bell size={13} /> حفظ هذا البحث
            </button>
            <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1.5px solid rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)', color: '#DC2626', cursor: 'pointer', fontFamily: 'var(--font-ar)', whiteSpace: 'nowrap' }}>
              <X size={13} /> مسح
            </button>
          </>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10, padding: '16px', background: 'var(--white)',
          border: '1.5px solid var(--gray200)', borderRadius: 12,
        }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>نوع الوظيفة</label>
            <select value={filters.job_type || ''} onChange={e => set('job_type', e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {JOB_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>مستوى الخبرة</label>
            <select value={filters.experience_level || ''} onChange={e => set('experience_level', e.target.value)} style={{ ...selectStyle, width: '100%' }}>
              {EXPERIENCE.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>راتب أدنى (ر.س)</label>
            <input
              type="number" value={filters.salary_min || ''} onChange={e => set('salary_min', e.target.value)}
              placeholder="5000" style={{ ...inputStyle }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--g700)', display: 'block', marginBottom: 5 }}>راتب أقصى (ر.س)</label>
            <input
              type="number" value={filters.salary_max || ''} onChange={e => set('salary_max', e.target.value)}
              placeholder="50000" style={{ ...inputStyle }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

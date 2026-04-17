// src/components/ResumeUploader.jsx

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedNumber from './AnimatedNumber.jsx';

const API_SUBMIT = '/api/v1/resume/optimize';
const API_STATUS = (id) => `/api/v1/resume/status/${id}`;

// Polling backoff steps in ms: 1s → 2s → 3s → 5s → 8s → 13s
const BACKOFF = [1000, 2000, 3000, 5000, 8000, 13000];
const TERMINAL = new Set(['completed', 'failed', 'quota_exceeded']);

const STATUS_LABELS = {
  processing:    'جاري التحليل...',
  retrying:      'جاري إعادة المحاولة...',
  completed:     '✓ اكتمل التحليل',
  failed:        '✗ فشل التحليل',
  quota_exceeded:'✗ استُنفدت الحصة المتاحة',
};

export default function ResumeUploader() {
  const navigate = useNavigate();
  const [mode, setMode]         = useState('text');   // 'text' | 'file'
  const [resumeText, setText]   = useState('');
  const [jobDesc, setJobDesc]   = useState('');
  const [tier, setTier]         = useState('free');
  const [consent, setConsent]   = useState(false);
  const [file, setFile]         = useState(null);
  const [jobId, setJobId]       = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError]       = useState(null);

  const pollTimer = useRef(null);
  const pollStep  = useRef(0);

  // ── Polling ────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const poll = useCallback(async (id) => {
    try {
      const res  = await fetch(API_STATUS(id));
      if (!res.ok) throw new Error('status_check_failed');
      const data = await res.json();
      setProgress(data);

      if (TERMINAL.has(data.status)) {
        stopPolling();
        return;
      }

      const delay = BACKOFF[Math.min(pollStep.current, BACKOFF.length - 1)];
      pollStep.current += 1;
      pollTimer.current = setTimeout(() => poll(id), delay);
    } catch {
      stopPolling();
    }
  }, [stopPolling]);

  useEffect(() => {
    if (!jobId) return;
    pollStep.current = 0;
    poll(jobId);
    return stopPolling;
  }, [jobId, poll, stopPolling]);

  // ── Redirect to results page on completion ──────────────────────────
  useEffect(() => {
    if (progress?.status !== 'completed' || !progress?.data?.result || !jobId) return;
    try {
      const raw = JSON.parse(progress.data.result);
      const criteria = raw.criteria || {};
      const passed = Object.entries(criteria).filter(([, v]) => v === true).map(([k]) => k);
      const failed = Object.entries(criteria).filter(([, v]) => v === false).map(([k]) => k);
      const normalized = {
        score: raw.score ?? raw.ats_score ?? raw.match_percentage ?? 0,
        passed,
        failed,
        recommendations: raw.recommendations || [],
      };
      localStorage.setItem(`resume_result_${jobId}`, JSON.stringify(normalized));
      navigate(`/resume-results/${jobId}`);
    } catch {
      // result not parseable — stay on page and show raw output
    }
  }, [progress?.status, jobId, navigate]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProgress(null);
    setJobId(null);

    const body = new FormData();
    body.append('consent', '1');
    body.append('consent_version', '1.0');
    body.append('tier', tier);
    if (jobDesc)             body.append('job_description', jobDesc);
    if (mode === 'file' && file) body.append('file', file);
    else                         body.append('resume_text', resumeText);

    try {
      const res  = await fetch(API_SUBMIT, { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.errors
          ? Object.values(data.errors).flat().join(' / ')
          : (data.message || 'حدث خطأ غير متوقع');
        setError(msg);
        return;
      }

      setJobId(data.job_id);
    } catch {
      setError('تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.');
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const isRunning  = progress && !TERMINAL.has(progress.status);
  const hasResult  = progress?.status === 'completed' && progress?.data?.result;
  const hasFailed  = TERMINAL.has(progress?.status) && progress?.status !== 'completed';
  const canSubmit  = consent && !isRunning &&
    (mode === 'text' ? resumeText.length >= 100 : !!file);

  // ── Styles (inline — no Tailwind) ─────────────────────────────────────────
  const s = {
    wrap:  { maxWidth: 740, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'inherit', direction: 'rtl' },
    card:  { background: 'var(--white, #fff)', border: '1px solid var(--g200, #e5e7eb)', borderRadius: 12, padding: '1.75rem' },
    h2:    { margin: '0 0 1.5rem', color: 'var(--g900, #111)', fontSize: '1.25rem', fontWeight: 700 },
    tabs:  { display: 'flex', gap: 8, marginBottom: '1.25rem' },
    tab:   (a) => ({
      flex: 1, padding: '0.55rem', border: `2px solid ${a ? 'var(--gold500,#d4a017)' : 'var(--g200,#e5e7eb)'}`,
      borderRadius: 8, background: a ? 'var(--gold50,#fefce8)' : 'transparent',
      color: a ? 'var(--gold700,#92400e)' : 'var(--g600,#4b5563)',
      cursor: 'pointer', fontWeight: a ? 600 : 400, fontSize: '0.9rem',
    }),
    tierRow: { display: 'flex', gap: 8, marginBottom: '1.25rem' },
    tierBtn: (a) => ({
      flex: 1, padding: '0.5rem', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
      border: `2px solid ${a ? 'var(--gold500,#d4a017)' : 'var(--g200,#e5e7eb)'}`,
      background: a ? 'var(--gold500,#d4a017)' : 'transparent',
      color: a ? '#fff' : 'var(--g600,#4b5563)',
    }),
    field: { marginBottom: '1.25rem' },
    label: { display: 'block', marginBottom: 6, color: 'var(--g700,#374151)', fontWeight: 500, fontSize: '0.875rem' },
    textarea: { width: '100%', padding: '0.75rem', border: '1px solid var(--g200,#e5e7eb)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' },
    fileInput: { width: '100%', padding: '0.5rem', border: '1px solid var(--g200,#e5e7eb)', borderRadius: 8, boxSizing: 'border-box' },
    hint: { color: 'var(--g500,#6b7280)', fontSize: '0.8rem', marginTop: 4 },
    consentRow: { display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer', marginBottom: '0.5rem' },
    consentText: { fontSize: '0.85rem', color: 'var(--g600,#4b5563)', lineHeight: 1.5 },
    link: { color: 'var(--gold600,#b45309)', textDecoration: 'underline' },
    btn: (disabled) => ({
      width: '100%', padding: '0.875rem', borderRadius: 8, border: 'none', fontWeight: 700,
      fontSize: '1rem', marginTop: '1rem', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? 'var(--g200,#e5e7eb)' : 'var(--gold500,#d4a017)',
      color: disabled ? 'var(--g500,#6b7280)' : '#fff',
      transition: 'background 0.2s',
    }),
    errBox: { color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: 8, marginTop: '1rem', fontSize: '0.9rem' },
    prog:  { marginTop: '1.75rem' },
    barBg: { background: 'var(--g100,#f3f4f6)', borderRadius: 4, overflow: 'hidden', height: 8, margin: '0.5rem 0' },
    bar:   (pct, fail) => ({ height: '100%', borderRadius: 4, transition: 'width 0.4s ease', width: `${pct}%`, background: fail ? '#ef4444' : 'var(--gold500,#d4a017)' }),
    statusRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--g700,#374151)' },
    result:  { background: 'var(--g50,#f9fafb)', border: '1px solid var(--g200,#e5e7eb)', borderRadius: 8, padding: '1.25rem', marginTop: '1rem' },
    pre:     { margin: '0.5rem 0 0', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--g800,#1f2937)' },
    cacheTag:{ fontSize: '0.78rem', color: 'var(--g500,#6b7280)', marginTop: 8 },
  };

  const pct    = progress?.percent ?? 0;
  const failed = hasFailed;

  const matchScore = (() => {
    if (!hasResult) return null;
    try {
      const r = JSON.parse(progress.data.result);
      const v = r?.score ?? r?.match_percentage ?? r?.ats_score ?? r?.match_score ?? null;
      return (typeof v === 'number' && v >= 0 && v <= 100) ? Math.round(v) : null;
    } catch { return null; }
  })();

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h2 style={s.h2}>تحليل وتحسين السيرة الذاتية بالذكاء الاصطناعي</h2>

        {/* Tier */}
        <div style={s.tierRow}>
          {[['free','⚡ مجاني'], ['pro','🚀 احترافي']].map(([t, label]) => (
            <button key={t} type="button" style={s.tierBtn(tier === t)} onClick={() => setTier(t)}>
              {label}
            </button>
          ))}
        </div>

        {/* Input mode tabs */}
        <div style={s.tabs}>
          {[['text','نص مباشر'], ['file','رفع PDF']].map(([m, label]) => (
            <button key={m} type="button" style={s.tab(mode === m)} onClick={() => setMode(m)}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            {mode === 'text' ? (
              <>
                <label style={s.label}>نص السيرة الذاتية *</label>
                <textarea
                  style={{ ...s.textarea, minHeight: 180 }}
                  placeholder="الصق نص سيرتك الذاتية هنا (الحد الأدنى 100 حرف)..."
                  value={resumeText}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isRunning}
                />
                <div style={s.hint}>{resumeText.length.toLocaleString('ar-SA')} / 15,000 حرف</div>
              </>
            ) : (
              <>
                <label style={s.label}>ملف PDF *</label>
                <input
                  type="file" accept=".pdf" style={s.fileInput}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={isRunning}
                />
                <div style={s.hint}>PDF فقط · الحد الأقصى 2MB</div>
              </>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>وصف الوظيفة المستهدفة (اختياري)</label>
            <textarea
              style={{ ...s.textarea, minHeight: 100 }}
              placeholder="الصق إعلان الوظيفة لتحليل الفجوات وتحسين المطابقة..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <label style={s.consentRow}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span style={s.consentText}>
              أوافق على معالجة بيانات سيرتي وفق{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" style={s.link}>
                سياسة الخصوصية
              </a>
              {' '}(البيانات الشخصية تُخفى قبل المعالجة)
            </span>
          </label>

          <button type="submit" style={s.btn(!canSubmit)} disabled={!canSubmit}>
            {isRunning ? 'جاري التحليل...' : 'تحليل وتحسين السيرة'}
          </button>
        </form>

        {error && <div style={s.errBox}>⚠️ {error}</div>}

        {progress && (
          <div style={s.prog}>
            <div style={s.statusRow}>
              <span>{STATUS_LABELS[progress.status] ?? progress.status}</span>
              <span>{pct}%</span>
            </div>
            <div style={s.barBg}>
              <div style={s.bar(pct, failed)} />
            </div>

            {hasResult && (
              <div style={s.result}>
                {matchScore !== null && (
                  <div style={{
                    textAlign: 'center', padding: '1rem 0 1.25rem',
                    borderBottom: '1px solid var(--g200,#e5e7eb)', marginBottom: '1rem',
                  }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--g600,#4b5563)', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      نسبة المطابقة
                    </div>
                    <div style={{
                      fontSize: '3rem', fontWeight: 800, lineHeight: 1,
                      color: matchScore >= 70 ? 'var(--gold500,#C5A059)' : matchScore >= 50 ? 'var(--g600)' : '#ef4444',
                    }}>
                      <AnimatedNumber target={matchScore} arabic={false} suffix="%" />
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: 6, color: 'var(--g600,#4b5563)' }}>
                      {matchScore >= 70 ? '✦ مطابقة ممتازة' : matchScore >= 50 ? 'مطابقة جيدة' : 'تحتاج إلى تحسين'}
                    </div>
                  </div>
                )}
                <strong style={{ color: 'var(--g800,#1f2937)' }}>نتيجة التحليل:</strong>
                <pre style={s.pre}>
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(progress.data.result), null, 2);
                    } catch {
                      return progress.data.result;
                    }
                  })()}
                </pre>
                {progress.data.cache_hit && (
                  <div style={s.cacheTag}>⚡ استجابة أسرع — تم استخدام الـ Prompt Cache</div>
                )}
              </div>
            )}

            {hasFailed && progress?.data?.message && (
              <div style={s.errBox}>{progress.data.message}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

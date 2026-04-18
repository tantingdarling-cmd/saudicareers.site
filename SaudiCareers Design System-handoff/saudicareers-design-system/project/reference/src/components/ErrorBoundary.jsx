import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#f9fafb', direction: 'rtl',
          fontFamily: 'var(--font-ar, system-ui)',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 420, padding: '2rem' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              حدث خطأ غير متوقع
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
              نعتذر عن الإزعاج. حاول تحديث الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px', background: '#14532d', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

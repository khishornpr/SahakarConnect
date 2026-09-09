import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SahakarConnect Error Boundary Caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.hash = '#/login'
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#0b0d11] text-white p-6">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#12151c] border border-white/[0.1] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ff6b00]/20 text-[#ff7a00] border border-[#ff6b00]/30 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(255,107,0,0.3)]">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Something unexpected occurred</h2>
              <p className="text-xs text-slate-400 mt-1">
                The portal encountered a temporary rendering issue. Please reload or return to the login portal.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-[#ff6b00] hover:bg-[#ff7a00] text-white font-bold text-xs tracking-wide shadow-lg cursor-pointer transition-all"
              >
                🔄 Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs tracking-wide border border-white/10 cursor-pointer transition-all"
              >
                🚪 Back to Login
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

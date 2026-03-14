import * as React from 'react'

interface State {
  error: Error | null
  retryKey: number
}

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, retryKey: 0 }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState((prev) => ({ error: null, retryKey: prev.retryKey + 1 }))
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-900/50 bg-slate-900/80 p-8 text-center">
          <p className="text-sm font-medium text-red-400">Something went wrong</p>
          <p className="mt-2 max-w-md text-xs text-slate-500">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-4 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      )
    }
    return (
      <div key={this.state.retryKey} className="min-h-[200px]">
        {this.props.children}
      </div>
    )
  }
}

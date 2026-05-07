import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-bg-surface border border-danger/20 rounded-2xl">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-barlow font-extrabold text-text-primary uppercase mb-2">Something went wrong</h2>
          <p className="text-text-secondary font-inter mb-6 max-w-md">
            The application encountered a React hook error or a context mismatch. 
            Prasidakan jalankan "npm install" dan "npx convex dev" untuk sinkronisasi.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-accent text-white px-6 py-2 rounded-xl font-semibold hover:bg-accent-hover transition-all"
          >
            Bersihkan & Muat Ulang
          </button>
          {this.state.error && (
            <pre className="mt-6 p-4 bg-bg-base text-left rounded-lg text-xs text-danger overflow-auto max-w-full">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 shadow-lg space-y-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Umhlaba Wami hit an unexpected error. Your session data is in Supabase; try reloading. If this
              continues, contact support.
            </p>
            <pre className="text-[10px] p-2 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

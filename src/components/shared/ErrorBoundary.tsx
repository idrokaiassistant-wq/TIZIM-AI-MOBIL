import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './UI';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    if (import.meta.env.PROD && this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-ios-bg flex items-center justify-center p-5">
          <div className="max-w-md w-full bg-white rounded-ios-2xl shadow-ios-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Xatolik yuz berdi
            </h1>
            
            <p className="text-slate-600 text-sm mb-6">
              Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg text-left">
                <p className="text-xs font-bold text-slate-500 mb-2">Xatolik tafsilotlari:</p>
                <p className="text-xs text-red-600 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-slate-500 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-[10px] text-slate-600 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Qayta urinish
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Bosh sahifaga qaytish
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


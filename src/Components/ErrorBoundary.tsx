// Error Boundary Component for React
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
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
    // Log error to error reporting service (e.g., Sentry, LogRocket)
    console.error("Error Boundary Caught:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Our team has been notified and we're working to fix it.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-sm text-gray-700 mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </button>
              
              <a
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo, this.state.errorId);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when props change if resetOnPropsChange is true
    if (this.props.resetOnPropsChange && prevProps !== this.props) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    // Reset error state and navigate to home
    this.handleReset();
    // You could also add navigation logic here
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    if (error && errorInfo) {
      // Create error report
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Error Report:', errorReport);
      }

      // Here you could send to an error reporting service
      // sendErrorReport(errorReport);

      // Show user feedback
      alert('Error report generated. Please contact support with error ID: ' + errorId);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </motion.div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 text-lg mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className="mt-2">
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Error ID */}
            {this.state.errorId && (
              <div className="mb-6 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please include this ID when reporting the issue
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Go Home
              </button>

              <button
                onClick={this.handleReportError}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Report Error
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-sm text-gray-500">
              <p>
                If this problem persists, please contact our support team.
              </p>
              <p className="mt-1">
                We're working to fix this issue as quickly as possible.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for manually triggering error boundary (useful for testing)
export function useErrorBoundary() {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
}

export default ErrorBoundary;
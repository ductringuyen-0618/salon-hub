import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  goHome: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, goHome }) => (
  <div className="min-h-screen bg-dynamic-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md bg-dynamic-surface border-dynamic-border">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-xl font-semibold text-dynamic-text">
          Something went wrong
        </CardTitle>
        <CardDescription className="text-dynamic-text-secondary">
          We encountered an unexpected error. Please try refreshing the page or return to the home page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <details className="bg-dynamic-background border border-dynamic-border rounded-lg p-3">
            <summary className="cursor-pointer text-sm font-medium text-dynamic-text-secondary hover:text-dynamic-text">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex flex-col gap-2">
          <Button onClick={resetError} className="w-full" style={{backgroundColor: '#d34000'}}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={goHome} variant="outline" className="w-full">
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  goHome = () => {
    this.resetError();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const ErrorFallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <ErrorFallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          goHome={this.goHome}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

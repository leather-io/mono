import React, { Component, ReactNode } from 'react';

import { isAbortError } from '@/utils/query-error-handler';
import { captureMessage } from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary that specifically handles React Query AbortErrors gracefully
 */
export class QueryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Don't catch AbortErrors - they should be handled by React Query
    if (isAbortError(error)) {
      captureMessage('AbortError caught in boundary, not showing error UI');
      return { hasError: false };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Don't log AbortErrors as they're expected
    if (isAbortError(error)) {
      return;
    }

    captureMessage('QueryErrorBoundary caught an error:', {
      level: 'error',
      extra: {
        error,
        errorInfo,
      },
    });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    // if (this.state.hasError) {
    //   // FIXME don't do this as error handled elsewhere
    //   return (
    //     this.props.fallback || (
    //       <div>
    //         <h2>Something went wrong with balance loading.</h2>
    //         <button onClick={() => this.setState({ hasError: false })}>Try again</button>
    //       </div>
    //     )
    //   );
    // }

    return this.props.children;
  }
}

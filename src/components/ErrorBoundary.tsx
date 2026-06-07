"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Component Error:', error, errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);

        // Log to error tracking service (e.g., Sentry, LogRocket)
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
        // }

        // Log to localStorage for debugging 
        if (typeof window !== 'undefined') {
            try {
                const errorLog = {
                    timestamp: new Date().toISOString(),
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    url: window.location.href
                };
                localStorage.setItem('last_error', JSON.stringify(errorLog));
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="glass-card inline-flex p-6 rounded-3xl">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
                                <svg
                                    className="h-8 w-8 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-display font-semibold">
                                Something went wrong
                            </h2>
                            <p className="text-muted-foreground">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={this.handleReset} variant="default">
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Reload Page
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="ghost"
                            >
                                Go Home
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left">
                                <details>
                                    <summary className="cursor-pointer text-sm font-medium mb-2">
                                        Error Details (Development Only)
                                    </summary>
                                    <pre className="text-xs text-muted-foreground overflow-auto max-h-40 p-2 bg-background rounded">
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
"use client";

import React from "react";
import { FiAlertCircle, FiRefreshCw, FiHome } from "react-icons/fi";
import Link from "next/link";
import Button from "@/components/ui/Button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    if (typeof window !== "undefined" && window.logger) {
      window.logger.log(error, {
        type: "react_error_boundary",
        componentStack: errorInfo.componentStack,
      });
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;

      if (Fallback) {
        return <Fallback error={this.state.error} resetError={this.handleReset} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 px-4">
          <div className="max-w-2xl w-full">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 shadow-2xl">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <FiAlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-white text-center mb-4">
                Something went wrong
              </h1>
              <p className="fc-body-lg text-center mb-8">
                We encountered an unexpected error. Please try refreshing the page or returning to the home page.
              </p>

              {showDetails && this.state.error && (
                <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                  <p className="text-sm text-red-400 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="fc-muted text-xs">
                      <summary className="cursor-pointer hover:text-white/55">
                        Stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button type="button" variant="primary" onClick={this.handleReset}>
                  <FiRefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Link href="/" className="fc-btn-dashboard-cancel !flex-none inline-flex items-center justify-center gap-2">
                  <FiHome className="w-4 h-4" />
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

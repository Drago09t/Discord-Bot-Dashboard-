import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                    <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/20 max-w-2xl w-full">
                        <div className="flex items-center gap-4 text-red-500 mb-6">
                            <AlertTriangle size={48} />
                            <h1 className="text-3xl font-bold">Something went wrong</h1>
                        </div>

                        <div className="bg-black/50 p-4 rounded-lg overflow-auto max-h-96">
                            <h2 className="text-xl text-white font-mono mb-2">{this.state.error && this.state.error.toString()}</h2>
                            <pre className="text-slate-400 font-mono text-sm whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-6 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

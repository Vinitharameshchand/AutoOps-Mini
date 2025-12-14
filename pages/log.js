import { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { Activity, Brain, GitBranch, Terminal, CheckCircle, Loader2, Play, Cpu, Database, Zap } from 'lucide-react';

const LogItem = memo(({ log }) => {
    const getAgentIcon = (agent) => {
        switch (agent) {
            case 'Metrics Agent': return <Database className="w-4 h-4" />;
            case 'Summary Agent': return <Brain className="w-4 h-4" />;
            case 'Decision Agent': return <GitBranch className="w-4 h-4" />;
            case 'Execution Agent': return <Zap className="w-4 h-4" />;
            default: return <Terminal className="w-4 h-4" />;
        }
    };

    const getAgentColor = (agent) => {
        switch (agent) {
            case 'Metrics Agent': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
            case 'Summary Agent': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
            case 'Decision Agent': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
            case 'Execution Agent': return 'text-green-400 border-green-500/30 bg-green-500/10';
            default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
        }
    };

    return (
        <div className="flex gap-4 animate-fade-in group">
            <span className="text-gray-600 w-20 flex-shrink-0 text-xs mt-1">{log.timestamp}</span>
            <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border mb-2 ${getAgentColor(log.agent)}`}>
                    {getAgentIcon(log.agent)}
                    <span className="font-semibold uppercase text-xs tracking-wider">
                        {log.agent}
                    </span>
                </div>
                <p className="leading-relaxed text-gray-300 whitespace-pre-wrap ml-1">{log.message}</p>
            </div>
        </div>
    );
});

export default function Log() {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, running, completed
    const [data, setData] = useState(null);
    const [progress, setProgress] = useState(0);

    const runAutoOps = async () => {
        setStatus('running');
        setLogs([]);
        setProgress(0);

        // Simulate initial connection
        addLog('System', 'Initializing AutoOps Agent...', 0);

        try {
            addLog('System', 'Connecting to 4 active agents...', 500);
            setProgress(10);

            const res = await fetch('/api/run-flow', { method: 'POST' });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            setData(result);

            // Sequence the UI updates to feel like real-time processing
            setTimeout(() => {
                addLog('Metrics Agent', 'Ingesting system telemetry...', 0);
                setProgress(25);
                addLog('Metrics Agent', `Found: Errors=${result.metrics.errors}, Latency=${result.metrics.latency_ms}ms`, 800);
                setProgress(35);
            }, 1000);

            setTimeout(() => {
                addLog('Summary Agent', 'Analyzing root cause with LLM...', 0);
                setProgress(50);
                addLog('Summary Agent', result.summary, 1500);
                setProgress(65);
            }, 3000);

            setTimeout(() => {
                addLog('Decision Agent', 'Evaluating best course of action...', 0);
                setProgress(75);
                addLog('Decision Agent', `DECISION: ${result.decision.decision.toUpperCase()}`, 1000);
                addLog('Decision Agent', `Reasoning: ${result.decision.reason}`, 1200);
                setProgress(85);
            }, 6000);

            setTimeout(() => {
                addLog('Execution Agent', 'Initiating automated fix...', 0);
                setProgress(95);
                addLog('Execution Agent', result.actionResult.action_log, 1500);
                setProgress(100);
                setStatus('completed');
            }, 9000);

        } catch (err) {
            console.error(err);
            addLog('System', `CRITICAL ERROR: ${err.message}`, 0);
            setStatus('error');
        }
    };

    const addLog = (agent, message, delay) => {
        setTimeout(() => {
            setLogs(prev => [...prev, { agent, message, timestamp: new Date().toLocaleTimeString() }]);
        }, delay);
    };

    // Auto-run on mount
    useEffect(() => {
        runAutoOps();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-gray-200 p-4 md:p-12" style={{ fontFamily: 'Inter, sans-serif' }}>
            <Head>
                <title>AutoOps Live Log</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="max-w-5xl mx-auto">
                {/* Header Card */}
                <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full ${status === 'running' ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' : status === 'completed' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-500'}`}></div>
                            <h1 className="font-bold text-2xl tracking-tight text-white">AutoOps Terminal</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={async () => {
                                    await fetch('/api/clear-cache', { method: 'POST' });
                                    alert('Cache cleared!');
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                Clear Cache
                            </button>
                            <div className="text-xs text-gray-500 uppercase tracking-widest font-mono">v1.3.0</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {status === 'running' && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>Processing...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Terminal */}
                <div className="rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900/50">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">autoops-mini/agent-flow</div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 md:p-8 space-y-4 min-h-[600px] max-h-[70vh] overflow-y-auto font-mono text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {logs.map((log, i) => (
                            <LogItem key={i} log={log} />
                        ))}

                        {status === 'running' && (
                            <div className="flex items-center space-x-3 text-gray-500 animate-pulse pl-24">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">Processing...</span>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="mt-12 p-8 border border-green-900/30 bg-gradient-to-br from-green-900/20 to-emerald-900/10 rounded-2xl text-center animate-fade-in backdrop-blur-sm">
                                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 drop-shadow-lg" />
                                <h3 className="text-2xl font-bold text-green-400 mb-2">Issue Resolved</h3>
                                <p className="text-gray-400 text-sm mb-6">Autonomous execution complete. System monitoring resumed.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-sm font-bold transition-all duration-300 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                                >
                                    Run Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Footer */}
                {data && status === 'completed' && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Errors Detected" value={data.metrics.errors} color="text-red-400" />
                        <StatCard label="Latency (ms)" value={data.metrics.latency_ms} color="text-yellow-400" />
                        <StatCard label="Execution Time" value={data.executionTime} color="text-purple-400" />
                        <StatCard label="Fix Applied" value="✓" color="text-green-400" />
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        </div>
    );
}


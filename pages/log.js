import { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { Activity, Brain, GitBranch, Terminal, CheckCircle, Loader2, Play, Cpu, Database, Zap, Bot, Code2 } from 'lucide-react';

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

    const [isMonitoring, setIsMonitoring] = useState(false);
    const [cycleCount, setCycleCount] = useState(0);

    const toggleMonitoring = () => {
        if (isMonitoring) {
            setIsMonitoring(false);
            setStatus('idle');
            setCycleCount(0);
        } else {
            setIsMonitoring(true);
            setStatus('running');
            setLogs([]); // Clear logs on new run
            runMonitoringLoop();
        }
    };

    const runMonitoringLoop = async () => {
        // Core loop function
        try {
            addLog('System', `Initiating Monitoring Cycle...`, 0);
            setProgress(10);

            const res = await fetch('/api/run-flow', { method: 'POST' });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error);

            setData(result);
            setProgress(50);

            // Log Key Events only to avoid spam
            addLog('Metrics Agent', `Telemetry: CPU=${result.metrics.cpu_load}%, RAM=${result.metrics.memory_usage}%, Procs=${result.metrics.process_count}`, 500);

            if (result.decision.decision !== 'monitor') {
                addLog('Decision Agent', `ACTION REQUIRED: ${result.decision.decision}`, 1000);
                addLog('Execution Agent', result.actionResult.action_log, 1500);

                // Stop monitoring on fix to show report
                setTimeout(() => {
                    setStatus('completed');
                    setIsMonitoring(false);
                }, 2000);
            } else {
                addLog('Decision Agent', 'System Healthy. No action required.', 1000);
            }

            setProgress(100);

            // Schedule next run if still monitoring and no fix was applied
            if (result.decision.decision === 'monitor') {
                setTimeout(() => {
                    setCycleCount(c => c + 1);
                }, 5000);
            }

        } catch (err) {
            console.error(err);
            addLog('System', `monitor error: ${err.message}`, 0);
            setIsMonitoring(false); // Stop on error
            setStatus('error');
        }
    };

    // Effect for continuous loop
    useEffect(() => {
        let timeoutId;
        if (isMonitoring && status !== 'error' && status !== 'completed') {
            timeoutId = setTimeout(() => {
                runMonitoringLoop();
            }, 5000); // Interval
        }
        return () => clearTimeout(timeoutId);
    }, [isMonitoring, cycleCount]);

    const addLog = (agent, message, delay) => {
        setTimeout(() => {
            setLogs(prev => [...prev, { agent, message, timestamp: new Date().toLocaleTimeString() }]);
        }, delay);
    };

    // Auto-run removed for manual start

    const generatePDF = async () => {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('AutoOps Mini - Execution Report', 20, 20);

        // Metadata
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
        doc.text(`Execution Time: ${data.executionTime}`, 20, 35);

        // Horizontal Line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 40, 190, 40);

        // Section 1: Metrics
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('1. System Telemetry', 20, 50);

        const metricsData = Object.entries(data.metrics).map(([key, value]) => [key, value]);
        autoTable(doc, {
            startY: 55,
            head: [['Metric', 'Value']],
            body: metricsData,
            theme: 'grid',
            headStyles: { fillColor: [66, 133, 244] }
        });

        // Section 2: AI Analysis
        let finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('2. AI Root Cause Analysis', 20, finalY);

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        const splitSummary = doc.splitTextToSize(data.summary, 170);
        doc.text(splitSummary, 20, finalY + 7);

        // Section 3: Decision & Action
        finalY = finalY + 15 + (splitSummary.length * 5);
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('3. Autonomous Decision & Action', 20, finalY);

        autoTable(doc, {
            startY: finalY + 5,
            head: [['Component', 'Output']],
            body: [
                ['Decision Agent', `DECISION: ${data.decision.decision.toUpperCase()}\nReason: ${data.decision.reason}`],
                ['Execution Agent', data.actionResult.action_log]
            ],
            theme: 'striped',
            headStyles: { fillColor: [15, 157, 88] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
        });

        // Save
        doc.save(`autoops-report-${Date.now()}.pdf`);
    };

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
                            {isMonitoring && (
                                <button
                                    onClick={toggleMonitoring}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-all animate-pulse"
                                >
                                    Stop Monitoring
                                </button>
                            )}
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

                        {/* Start View */}
                        {!isMonitoring && logs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-in text-center">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Bot className="w-10 h-10 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ready to Monitor</h3>
                                <p className="text-gray-400 max-w-md mb-8">System is connected. Click below to start the autonomous monitoring agent cycle.</p>
                                <button
                                    onClick={toggleMonitoring}
                                    className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-white/10 flex items-center gap-3"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Start Live Monitoring
                                </button>
                            </div>
                        )}

                        {/* Logs View */}
                        {logs.length > 0 && logs.map((log, i) => (
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
                                <div className="flex justify-center gap-4 flex-wrap">
                                    <button
                                        onClick={() => toggleMonitoring()}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all text-white border border-white/10"
                                    >
                                        Resume Monitoring
                                    </button>
                                    <button
                                        onClick={generatePDF}
                                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-sm font-bold transition-all duration-300 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                        Download Report
                                    </button>
                                    <button
                                        onClick={() => {
                                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `autoops-result-${Date.now()}.json`;
                                            a.click();
                                        }}
                                        className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-sm font-bold transition-all text-blue-400 flex items-center gap-2"
                                    >
                                        <Code2 className="w-4 h-4" />
                                        Raw JSON
                                    </button>
                                </div>
                                {data && (
                                    <div className="mt-6 text-left p-4 bg-black/50 rounded-lg border border-white/10 overflow-auto max-h-60 text-xs font-mono">
                                        <pre className="text-gray-400">{JSON.stringify(data, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Footer */}
                {data && status === 'completed' && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="CPU Load" value={`${data.metrics.cpu_load}%`} color="text-red-400" />
                        <StatCard label="Memory Usage" value={`${data.metrics.memory_usage}%`} color="text-yellow-400" />
                        <StatCard label="Processes" value={data.metrics.process_count} color="text-purple-400" />
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


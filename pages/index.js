import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import { ArrowRight, Bot, Zap, Activity, Sparkles, Code2, GitBranch, LogOut, User } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleRun = () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }
        router.push('/log');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white font-sans selection:bg-purple-500 selection:text-white overflow-hidden relative">
            <Head>
                <title>AutoOps Mini | Autonomous Operator</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>


            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] z-0"></div>

            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                {/* User Profile / Sign In */}
                {session && (
                    <div className="absolute top-6 right-6 flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
                            {session.user?.image && (
                                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
                            )}
                            <span className="text-sm font-medium">{session.user?.name}</span>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Status Badge */}
                <div className="mb-8 inline-flex items-center px-5 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-lg shadow-emerald-500/20 animate-fade-in-down">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 mr-3 animate-pulse shadow-lg shadow-emerald-400/50"></span>
                    <span className="text-sm font-semibold text-emerald-300 tracking-wide">SYSTEM AUTONOMOUS</span>
                </div>

                {/* Main Title with Enhanced Gradient */}
                <div className="relative mb-6">
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white via-purple-200 to-purple-500 text-transparent bg-clip-text animate-fade-in-up drop-shadow-2xl">
                        AutoOps
                    </h1>
                    <div className="flex items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
                        <span className="text-2xl md:text-3xl font-bold text-purple-400 tracking-widest">MINI</span>
                        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
                    </div>
                </div>

                {/* Subtitle with Icon */}
                <div className="max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <p className="text-xl md:text-2xl text-gray-300 mb-3 leading-relaxed font-medium">
                        The autonomous AI engineer that monitors, diagnoses, and fixes your production issues
                    </p>
                    <p className="text-lg text-purple-400 font-semibold flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        in real-time
                        <Sparkles className="w-5 h-5" />
                    </p>
                </div>

                {/* CTA Button with Glow */}
                <button
                    onClick={handleRun}
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/80 animate-fade-in-up overflow-hidden"
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    <span className="relative flex items-center gap-3">
                        <Code2 className="w-6 h-6" />
                        {session ? 'Run AutoOps' : 'Sign In to Continue'}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                </button>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-28 max-w-5xl text-left animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <FeatureCard
                        icon={<Activity className="w-7 h-7" />}
                        title="Real-time Metrics"
                        desc="Ingests errors, latency, and business KPIs instantly with sub-second precision."
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <FeatureCard
                        icon={<Bot className="w-7 h-7" />}
                        title="AI Decision Engine"
                        desc="Llama-3 & GPT-4o powered reasoning engine for optimal fix strategies."
                        gradient="from-purple-500 to-pink-500"
                    />
                    <FeatureCard
                        icon={<Zap className="w-7 h-7" />}
                        title="Autonomous Execution"
                        desc="Self-healing code modifications, rollbacks, and infrastructure changes."
                        gradient="from-yellow-500 to-orange-500"
                    />
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    {['Cline', 'Kestra', 'Vercel', 'Together AI', 'OpenAI'].map((tech, i) => (
                        <span key={i} className="px-4 py-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition-colors">
                            {tech}
                        </span>
                    ))}
                </div>
            </main>

            <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
        </div>
    );
}

function FeatureCard({ icon, title, desc, gradient }) {
    return (
        <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className={`mb-5 p-4 bg-gradient-to-br ${gradient} rounded-2xl inline-block shadow-lg`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

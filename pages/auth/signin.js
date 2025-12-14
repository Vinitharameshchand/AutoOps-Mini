import { signIn } from 'next-auth/react';
import Head from 'next/head';
import { Chrome } from 'lucide-react';

export default function SignIn() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white font-sans flex items-center justify-center p-6">
            <Head>
                <title>Sign In - AutoOps Mini</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
            </Head>

            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Sign In Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {/* Logo/Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-br from-white via-purple-200 to-purple-500 text-transparent bg-clip-text">
                            AutoOps Mini
                        </h1>
                        <p className="text-gray-400 text-sm">Autonomous AI Operator</p>
                    </div>

                    {/* Sign In Message */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Sign in to access your autonomous agent dashboard</p>
                    </div>

                    {/* Instant Sign In Button */}
                    <button
                        onClick={() => signIn('credentials', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-purple-500/20"
                    >
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Chrome className="w-5 h-5" />
                        </div>
                        Sign In Instantly
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-transparent text-gray-500">Secure authentication</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center text-xs text-gray-500">
                        <p>By signing in, you agree to our Terms of Service</p>
                        <p className="mt-2">Your data is encrypted and secure</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Powered by NextAuth & Google OAuth 2.0</p>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}

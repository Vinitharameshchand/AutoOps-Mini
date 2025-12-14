export default function Test() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">Tailwind CSS Works!</h1>
                <p className="text-xl text-gray-300">If you can see styled text, Tailwind is configured correctly.</p>
                <div className="mt-8 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                    <p className="text-emerald-400 font-semibold">✓ Gradients working</p>
                    <p className="text-purple-400 font-semibold">✓ Colors working</p>
                    <p className="text-blue-400 font-semibold">✓ Backdrop blur working</p>
                </div>
            </div>
        </div>
    );
}

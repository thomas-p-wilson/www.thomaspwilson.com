import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// The simulation engine and its rendering are a separate module, fetched
// only when a visitor actually navigates here — this page itself stays
// eager and tiny so the game's code never bloats the site's main bundle.
const Game = lazy(() => import("@/games/simple-evolution-simulator/components/Game"));

function GameLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[420px] rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Loading the simulator&hellip;</p>
    </div>
  );
}

export default function SimpleEvolutionSimulator() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/projects/gaming" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Gaming Projects
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
            Simple Evolution
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Simulator
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Organisms whose traits are genuinely encoded in a mutating RNA-like sequence — watch a population drift,
            speciate, and occasionally stumble into a whole new gene, one generation at a time.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <Suspense fallback={<GameLoadingFallback />}>
            <Game />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Lazily fetched so the level data and checklist UI stay out of the main bundle.
const ShapezSpeedrunChecklist = lazy(() => import("@/games/shapez-speedrun/components/ShapezSpeedrunChecklist"));

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[420px] rounded-2xl border border-dashed border-slate-300 text-slate-500">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Loading the checklist&hellip;</p>
    </div>
  );
}

export default function ShapezSpeedrun() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/projects/gaming" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Gaming & Misc Projects
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">
            shapez: Level 12 in
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}30 Minutes
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A speedrun checklist for the Speedrun Master achievement in shapez: every level goal from 1 to 12, how to build
            each shape, machine counts for the pace, and a split timer to track how far ahead or behind you are.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <Suspense fallback={<LoadingFallback />}>
            <ShapezSpeedrunChecklist />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

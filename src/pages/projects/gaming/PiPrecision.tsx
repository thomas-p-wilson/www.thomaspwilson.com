import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Kept as a separate lazily-fetched module so its data tables and math don't
// bloat the site's main bundle for visitors who never open this page.
const PiPrecisionExplorer = lazy(() => import("@/games/pi-precision/components/PiPrecisionExplorer"));

function ExplorerLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[420px] rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Loading the explorer&hellip;</p>
    </div>
  );
}

export default function PiPrecision() {
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
            How Much
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Pi{" "}
            </span>
            Do You Need?
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Every planetary position is computed with a value of &pi; that's been cut off somewhere. Cut it off too
            early and a "precise" position can drift by kilometers — or light-years. See how many digits it actually
            takes.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <Suspense fallback={<ExplorerLoadingFallback />}>
            <PiPrecisionExplorer />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

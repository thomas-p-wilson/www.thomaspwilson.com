import { lazy, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// The simulation engine and its rendering are a separate module, fetched
// only when a visitor actually navigates here — this page itself stays
// eager and tiny so the game's code never bloats the site's main bundle.
const Game = lazy(() => import("@/games/simple-evolution-simulator/components/Game"));

function GameLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 h-screen bg-slate-950 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Loading the simulator&hellip;</p>
    </div>
  );
}

export default function SimpleEvolutionSimulator() {
  return (
    <div className="fixed inset-0 bg-slate-950">
      <Link
        to="/projects/gaming"
        className="absolute top-4 left-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gaming Projects
      </Link>

      <Suspense fallback={<GameLoadingFallback />}>
        <Game />
      </Suspense>
    </div>
  );
}

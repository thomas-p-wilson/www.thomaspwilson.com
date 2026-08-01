import { useMemo, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { randomEquivalent } from "@/data/energy-equivalents";

/** A shuffleable "how much is that, really?" comparison for a kWh figure. Renders nothing while `kWh` isn't a usable positive number. */
export function FunEnergyFact({ kWh, fuelKey }: { kWh: number; fuelKey?: string }) {
  const [nonce, setNonce] = useState(0);
  const lastId = useRef<string | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: nonce is an intentional cache-buster to force a reshuffle
  const fact = useMemo(() => {
    const result = randomEquivalent(kWh, fuelKey, lastId.current);
    lastId.current = result?.id;
    return result;
  }, [kWh, fuelKey, nonce]);

  if (!fact) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
      <span>≈ {fact.text}</span>
      <button
        type="button"
        onClick={() => setNonce((n) => n + 1)}
        aria-label="Show a different comparison"
        className="shrink-0 p-0.5 rounded hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Shuffle className="w-3 h-3" />
      </button>
    </div>
  );
}

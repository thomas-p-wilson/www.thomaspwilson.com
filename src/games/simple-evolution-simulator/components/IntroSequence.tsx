import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface IntroSequenceProps {
  onComplete: () => void;
}

interface Step {
  title: string;
  body: string;
  dots: number;
  variant: "scatter" | "cluster" | "chain" | "strand" | "cell";
}

// Low-fidelity flavor beat: the pre-life chemistry genesis gets a few
// lightweight text/animation slides rather than its own simulation — the
// deep, inspectable loop starts once the seed organism is "born".
const STEPS: Step[] = [
  {
    title: "A barren world",
    body: "Lightning cracks over a cooling planet. Its atmosphere is thick with hydrogen, methane, ammonia, water vapor — raw atoms with nowhere to be.",
    dots: 18,
    variant: "scatter",
  },
  {
    title: "Atoms find each other",
    body: "Energy from storms and starlight jostles atoms into bonds. Simple molecules — water, formaldehyde, hydrogen cyanide — begin to accumulate in warm tide pools.",
    dots: 14,
    variant: "cluster",
  },
  {
    title: "Molecules become amino acids",
    body: "Given enough time and enough chemistry, molecules assemble into amino acids — the alphabet that every living thing on this planet will eventually share.",
    dots: 10,
    variant: "cluster",
  },
  {
    title: "A strand of proto-RNA",
    body: "By chance, a chain of nucleotides forms that can — imperfectly, rarely — copy itself. That's all evolution needs to get started: a sequence, and variation.",
    dots: 8,
    variant: "chain",
  },
  {
    title: "The first replicator",
    body: "A stray lipid membrane wraps around one such strand, protecting it long enough to copy itself again. This is your organism. Everything from here is genuinely encoded in its sequence.",
    dots: 1,
    variant: "cell",
  },
];

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-[520px] text-center px-6">
      <div className="relative w-full max-w-md h-56 mb-8">
        <IntroVisual variant={step.variant} dots={step.dots} keyProp={index} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg"
        >
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">{step.title}</h2>
          <p className="text-slate-400 leading-relaxed">{step.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-8">
        <div className="flex gap-1.5 mr-3">
          {STEPS.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-indigo-400" : "bg-slate-700"}`} />
          ))}
        </div>
        {!isLast && (
          <Button variant="ghost" onClick={onComplete} className="text-slate-400">
            Skip intro
          </Button>
        )}
        <Button onClick={() => (isLast ? onComplete() : setIndex((i) => i + 1))}>
          {isLast ? "Begin simulation" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function IntroVisual({ variant, dots, keyProp }: { variant: Step["variant"]; dots: number; keyProp: number }) {
  const seeded = Array.from({ length: dots }, (_, i) => {
    // Deterministic pseudo-random layout per slide, purely cosmetic.
    const seed = (i + 1) * 37 + keyProp * 101;
    const rand = (n: number) => ((Math.sin(seed * n) + 1) / 2);
    return { x: rand(1), y: rand(2), delay: rand(3) * 0.6 };
  });

  if (variant === "cell") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative w-24 h-24 rounded-full border-2 border-emerald-400/60 flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full bg-emerald-400/80"
          />
        </motion.div>
      </div>
    );
  }

  if (variant === "chain") {
    return (
      <div className="absolute inset-0 flex items-center justify-center gap-1">
        {seeded.map((dot, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{ delay: dot.delay, duration: 1.6, repeat: Infinity, repeatType: "mirror" }}
            className="w-3 h-3 rounded-full bg-sky-400"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {seeded.map((dot, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.4, 1, 0.4],
            left: variant === "cluster" ? "50%" : `${dot.x * 100}%`,
            top: variant === "cluster" ? "50%" : `${dot.y * 100}%`,
          }}
          transition={{ duration: 2 + dot.delay, repeat: Infinity, repeatType: "mirror" }}
          style={{ position: "absolute", left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
          className="w-2 h-2 rounded-full bg-indigo-400"
        />
      ))}
    </div>
  );
}

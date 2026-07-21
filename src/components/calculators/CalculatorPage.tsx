import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GenericCalculator from "./GenericCalculator";
import CalculatorHelp from "./CalculatorHelp";
import type { CalculatorSpec } from "@/lib/calculator";

export default function CalculatorPage({ spec }: { spec: CalculatorSpec }) {
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const hasHelp = !!spec.helpIntro || spec.sections.some((s) => s.help || s.fields.some((f) => f.help));

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className={`mx-auto px-6 ${hasHelp ? "max-w-7xl" : "max-w-4xl"}`}>
        <div className="mb-8">
          <Link to="/projects/calculators" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Calculators
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-4">{spec.title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{spec.description}</p>
        </motion.div>
        {hasHelp ? (
          // A single shared grid (not two independently-flowing columns) so each card and its
          // paired help block land in the same row — see calculatorGridAlignment for why that
          // needs explicit per-row placement rather than just matching document order.
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-12"
          >
            <GenericCalculator spec={spec} activeHelp={activeHelp} onActiveHelpChange={setActiveHelp} />
            <CalculatorHelp spec={spec} activeHelp={activeHelp} setActiveHelp={setActiveHelp} />
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <GenericCalculator spec={spec} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

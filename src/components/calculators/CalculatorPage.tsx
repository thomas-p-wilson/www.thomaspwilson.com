import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GenericCalculator from "./GenericCalculator";
import type { CalculatorSpec } from "@/lib/calculator";

export default function CalculatorPage({ spec }: { spec: CalculatorSpec }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <GenericCalculator spec={spec} />
        </motion.div>
      </div>
    </div>
  );
}

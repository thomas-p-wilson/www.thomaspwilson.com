import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ResistiveElementCalculator from "../components/calculators/resistive_element/ResistiveElementCalculator";
import ResistiveElementHelp from "../components/calculators/resistive_element/ResistiveElementHelp";

export default function ResistiveElementSizing() {
  const [activeField, setActiveField] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Resistive Element
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Sizing
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Calculate the physical properties of a resistive heating element based on electrical targets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 lg:mb-0"
          >
            <ResistiveElementCalculator activeField={activeField} setActiveField={setActiveField} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ResistiveElementHelp activeField={activeField} setActiveField={setActiveField} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

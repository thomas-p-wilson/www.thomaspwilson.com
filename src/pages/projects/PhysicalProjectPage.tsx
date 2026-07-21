import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import type { PhysicalProject } from "@/data/physical-projects";

export default function PhysicalProjectPage({ project }: { project: PhysicalProject }) {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-8">
          <Link to="/projects/physical" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Physical Projects
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-8">{project.title}</h1>
          <div className="flex flex-col items-center gap-4 py-16 px-8 border border-dashed border-slate-200 rounded-2xl">
            <Wrench className="w-10 h-10 text-slate-300" />
            <p className="text-slate-500">{project.description}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

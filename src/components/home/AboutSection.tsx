import { motion } from "framer-motion";
import { Briefcase, Calendar } from "lucide-react";
import { positions } from "@/data/positions";

const currentRole = positions.find((p) => p.is_current) ?? positions[0];
const earliestStartYear = Math.min(...positions.map((p) => new Date(p.start_date).getFullYear()));
const yearsOfExperience = new Date().getFullYear() - earliestStartYear;

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-8 leading-tight">
              Crafting solutions for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
                complex challenges
              </span>
            </h2>

            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                I've been designing and building software professionally for {yearsOfExperience} years,
                driven by a motivation to keep learning about everything I encounter — from writing
                elegant code to designing robust infrastructure, implementing security best practices,
                and guiding teams through complex technical decisions.
              </p>
              <p>{currentRole.description}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 bg-slate-50 rounded-3xl border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Currently</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-1">{currentRole.title}</h3>
            <p className="text-slate-600 font-medium mb-4">{currentRole.company}</p>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Calendar className="w-4 h-4" />
              <span>Since {new Date(currentRole.start_date).getFullYear()}</span>
            </div>
            {currentRole.technologies && (
              <div className="flex flex-wrap gap-2">
                {currentRole.technologies.slice(0, 8).map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white text-slate-700 rounded-full text-sm font-medium border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

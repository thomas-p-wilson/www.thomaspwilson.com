import { motion } from "framer-motion";
import { ArrowDown, Code, Shield, Server, Users } from "lucide-react";

export default function HeroSection() {
  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
          opacity: 0.5,
        }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-7xl font-light text-slate-900 mb-6 tracking-tight">
            Senior Software
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              Developer
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-8 font-light leading-relaxed max-w-3xl mx-auto">
            Building software professionally since 2003, with a recent focus on data privacy and security.
            <span className="block mt-2 text-slate-500">
              Passionate about building tools that solve real problems.
            </span>
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200">
              <Code className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-medium">Development</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200">
              <Server className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-700 font-medium">DevOps</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="text-slate-700 font-medium">Security</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-slate-200">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-medium">Consulting</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          onClick={scrollToAbout}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
        >
          <span className="font-medium">Explore my journey</span>
          <ArrowDown className="w-4 h-4 transform group-hover:translate-y-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
}

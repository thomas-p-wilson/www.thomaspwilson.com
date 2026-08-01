import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Calculator, Gamepad2, Github, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { contact } from "@/data/contact";

// Fetched from the GitHub API (`gh api users/thomas-p-wilson --jq .public_repos`)
// at the time this page was written — a static snapshot, not live data, so
// it will drift as repos are added/removed.
const GITHUB_PUBLIC_REPO_COUNT = 17;

const categories = [
  {
    title: "Physical Projects",
    description: "Hardware builds and things made with hands rather than just code.",
    icon: Wrench,
    href: "/projects/physical",
    external: false,
  },
  {
    title: "GitHub",
    description: `${GITHUB_PUBLIC_REPO_COUNT} public repos.`,
    icon: Github,
    href: contact.github,
    external: true,
  },
  {
    title: "Calculators",
    description: "Practical tools born from real-world needs — engineering, finance, and unit conversion.",
    icon: Calculator,
    href: "/projects/calculators",
    external: false,
  },
  {
    title: "Gaming & Misc",
    description: "Games worth tinkering with, plus interactive odds and ends that didn't fit anywhere else.",
    icon: Gamepad2,
    href: "/projects/gaming",
    external: false,
  },
];

export default function Projects() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Project
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Collection
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Calculators, hardware builds, code, and games — organized by kind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, index) => {
            const card = (
              <div className="p-8 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500">
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">{category.title}</h2>
                <p className="text-slate-600">{category.description}</p>
              </div>
            );
            return (
              <motion.div key={category.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                {category.external ? (
                  <a href={category.href} target="_blank" rel="noopener noreferrer">{card}</a>
                ) : (
                  <Link to={category.href}>{card}</Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

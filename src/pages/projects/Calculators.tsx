import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { projectPath, projects, type Project, type ProjectGroup } from "@/data/projects";

// Display order and labels for every group besides "featured" (the Unit
// Converter, pinned above these). Add a case here when a new calculator
// group is introduced in src/data/calculator-specs/index.ts.
const GROUP_ORDER: Exclude<ProjectGroup, "featured">[] = ["geometry", "physics", "materials", "energy", "financial"];
const GROUP_LABELS: Record<Exclude<ProjectGroup, "featured">, string> = {
  geometry: "Geometry",
  physics: "Physics & Mechanics",
  materials: "Materials & Electrical",
  energy: "Energy",
  financial: "Financial",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const card = (
    <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{project.description}</p>
    </div>
  );

  return project.kind === "internal" ? (
    <Link to={projectPath(project)}>{card}</Link>
  ) : (
    <a href={project.url} target="_blank" rel="noopener noreferrer">{card}</a>
  );
};

export default function CalculatorsList() {
  const featured = projects.filter((project) => project.group === "featured");
  const sections = GROUP_ORDER
    .map((group) => ({ group, label: GROUP_LABELS[group], items: projects.filter((project) => project.group === group) }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
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
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Calculator
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Collection
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Practical tools born from real-world needs. Each calculator represents a problem solved.
          </p>
          <div className="text-sm text-slate-500">
            {projects.length} calculator{projects.length !== 1 ? "s" : ""}
          </div>
        </motion.div>

        <div className="space-y-14">
          {featured.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          )}

          {sections.map((section) => (
            <div key={section.group}>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">{section.label}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

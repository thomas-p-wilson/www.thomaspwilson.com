import { motion } from "framer-motion";
import { FolderKanban, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { categoryLabels, projectPath, projects, type Project } from "@/data/projects";

const categoryColors: Record<Project["category"], string> = {
  calculators: "bg-indigo-100 text-indigo-800",
  "save-editors": "bg-purple-100 text-purple-800",
  "hobby-projects": "bg-orange-100 text-orange-800",
};

const ProjectCard = ({ project }: { project: Project }) => {
  const card = (
    <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500">
          <FolderKanban className="w-6 h-6 text-white" />
        </div>
        {project.kind === "external" && <ExternalLink className="w-5 h-5 text-slate-400" />}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{project.description}</p>
      <div className="flex flex-wrap gap-2 mt-auto">
        <Badge className={categoryColors[project.category]}>{categoryLabels[project.category]}</Badge>
        {project.technologies.map((tech) => (
          <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
        ))}
      </div>
    </div>
  );

  return project.kind === "internal" ? (
    <Link to={projectPath(project)}>{card}</Link>
  ) : (
    <a href={project.url} target="_blank" rel="noopener noreferrer">{card}</a>
  );
};

export default function Projects() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            Project
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Collection
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Calculators, save-game tools, and other things built out of curiosity.
          </p>
          <div className="text-sm text-slate-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
    </div>
  );
}

import { motion } from "framer-motion";
import { Wrench, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  physicalProjectGroupLabels, physicalProjectGroupOrder, physicalProjects, type PhysicalProject,
} from "@/data/physical-projects";

const ProjectCard = ({ project }: { project: PhysicalProject }) => {
  const card = (
    <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        {project.url && <ExternalLink className="w-5 h-5 text-slate-400" />}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.title}</h3>
      <p className="text-slate-600 mb-4 flex-grow">{project.description}</p>
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
          ))}
        </div>
      )}
    </div>
  );

  return project.url ? (
    <a href={project.url} target="_blank" rel="noopener noreferrer">{card}</a>
  ) : (
    <Link to={`/projects/physical/${project.slug}`}>{card}</Link>
  );
};

export default function Physical() {
  const ungrouped = physicalProjects.filter((project) => !project.group);
  const sections = physicalProjectGroupOrder
    .map((group) => ({
      group,
      label: physicalProjectGroupLabels[group],
      items: physicalProjects.filter((project) => project.group === group),
    }))
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
            Physical
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Projects
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Hardware builds and things made with hands rather than just code.
          </p>
        </motion.div>

        {physicalProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16 border border-dashed border-slate-200 rounded-2xl"
          >
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nothing published here yet — check back soon.</p>
          </motion.div>
        ) : (
          <div className="space-y-14">
            {ungrouped.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ungrouped.map((project) => (
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
        )}
      </div>
    </div>
  );
}

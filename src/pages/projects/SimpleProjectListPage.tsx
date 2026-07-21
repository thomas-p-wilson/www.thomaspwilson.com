import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export interface SimpleProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies?: string[];
}

interface SimpleProjectListPageProps {
  title: string;
  titleAccent: string;
  description: string;
  icon: LucideIcon;
  items: SimpleProject[];
  emptyMessage: string;
}

export default function SimpleProjectListPage({ title, titleAccent, description, icon: Icon, items, emptyMessage }: SimpleProjectListPageProps) {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-slate-900 mb-6">
            {title}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}{titleAccent}
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{description}</p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16 border border-dashed border-slate-200 rounded-2xl"
          >
            <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{emptyMessage}</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const card = (
                <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {item.url && <ExternalLink className="w-5 h-5 text-slate-400" />}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 mb-4 flex-grow">{item.description}</p>
                  {item.technologies && item.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {item.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
              return item.url ? (
                <motion.a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  {card}
                </motion.a>
              ) : (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                  {card}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

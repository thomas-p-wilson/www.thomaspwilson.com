import { motion } from "framer-motion";
import { Code, Server, Database, Users } from "lucide-react";

// Sourced from real, self-written skills content recovered from this site's
// prior branches (2022/2024), rather than the generic Base44-generated list.
const skillCategories = [
  {
    icon: Code,
    title: "Software Development",
    description: "Full-stack development across languages, frameworks, and eras",
    skills: ["TypeScript", "JavaScript", "Python", "Java", "PHP", "Ruby", "C/C++", "React", "Node.js"],
    color: "blue",
  },
  {
    icon: Server,
    title: "DevOps & Infrastructure",
    description: "Infrastructure automation and continuous delivery pipelines",
    skills: ["Docker", "Linux", "Git", "AWS", "Terraform", "CircleCI", "Jenkins/Hudson"],
    color: "indigo",
  },
  {
    icon: Database,
    title: "Data & Messaging",
    description: "Relational, document, and streaming data systems",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Elasticsearch", "Redis", "Kafka", "GraphQL"],
    color: "purple",
  },
  {
    icon: Users,
    title: "Leadership & Practice",
    description: "Technical leadership and engineering practice",
    skills: ["Architecture", "Team Leadership", "TDD", "BDD", "Security Consulting"],
    color: "emerald",
  },
];

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  indigo: "from-indigo-500 to-indigo-600",
  purple: "from-purple-500 to-purple-600",
  emerald: "from-emerald-500 to-emerald-600",
};

export default function SkillsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6">
            Core
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Expertise
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Deep technical knowledge across the entire software development lifecycle
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${colorMap[category.color]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-semibold text-slate-900 mb-3">{category.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{category.description}</p>

              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

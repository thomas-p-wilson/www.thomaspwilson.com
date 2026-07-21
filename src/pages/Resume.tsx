import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { positions, type Position } from "@/data/positions";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Present";
  return format(new Date(dateString), "MMM yyyy");
};

const calculateDuration = (startDate: string, endDate?: string | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
  } else if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years} year${years !== 1 ? "s" : ""} ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
};

const companyTypeColors: Record<NonNullable<Position["company_type"]>, string> = {
  startup: "bg-green-100 text-green-800",
  enterprise: "bg-blue-100 text-blue-800",
  consulting: "bg-purple-100 text-purple-800",
  government: "bg-red-100 text-red-800",
  "non-profit": "bg-orange-100 text-orange-800",
  agency: "bg-indigo-100 text-indigo-800",
};

const earliestStartYear = Math.min(...positions.map((p) => new Date(p.start_date).getFullYear()));
const yearsOfExperience = new Date().getFullYear() - earliestStartYear;

export default function Resume() {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
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
            Professional
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-medium">
              {" "}Experience
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {yearsOfExperience}+ years of building software across startups, consulting, and education.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 hidden md:block"></div>

          <div className="space-y-8">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full border-4 border-white shadow-lg hidden md:block"></div>

                <div className="md:ml-16 bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-slate-900">{position.title}</h3>
                        {position.is_current && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="text-lg font-semibold text-slate-700">{position.company}</span>
                        {position.company_type && (
                          <Badge className={companyTypeColors[position.company_type]} variant="secondary">
                            {position.company_type}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(position.start_date)} - {formatDate(position.end_date)}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          {calculateDuration(position.start_date, position.end_date)}
                        </div>
                        {position.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{position.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600 text-lg leading-relaxed mb-6">{position.description}</p>

                  {position.accomplishments && position.accomplishments.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Key Accomplishments</h4>
                      <ul className="space-y-3">
                        {position.accomplishments.map((accomplishment, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">{accomplishment}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {position.technologies && position.technologies.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-3">Technologies & Tools</h4>
                      <div className="flex flex-wrap gap-2">
                        {position.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Career Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{yearsOfExperience}+</div>
                <div className="text-slate-600">Years of Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">{positions.length}</div>
                <div className="text-slate-600">Professional Roles</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

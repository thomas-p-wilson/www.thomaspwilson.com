import { genericCalculatorSpecs } from "./calculator-specs";

export type ProjectCategory = "calculators" | "save-editors" | "hobby-projects";

export const categoryLabels: Record<ProjectCategory, string> = {
  calculators: "Calculators",
  "save-editors": "Save Editors",
  "hobby-projects": "Hobby Projects",
};

interface BaseProject {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  technologies: string[];
}

export interface InternalProject extends BaseProject {
  kind: "internal";
  /** Combined with category to build /projects/{category}/{slug} */
  slug: string;
}

export interface ExternalProject extends BaseProject {
  kind: "external";
  url: string;
}

export type Project = InternalProject | ExternalProject;

export function projectPath(project: InternalProject): string {
  return `/projects/${project.category}/${project.slug}`;
}

const bespokeCalculators: InternalProject[] = [
  {
    kind: "internal",
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between length, mass, temperature, volume, energy, power, time, frequency, pressure, and angle — including several historical/surveying units.",
    category: "calculators",
    slug: "unit-converter",
    technologies: ["TypeScript", "decimal.js"],
  },
  {
    kind: "internal",
    id: "resistive-element-sizing",
    title: "Resistive Element Sizing",
    description: "Calculate the physical properties of a resistive heating element from electrical targets.",
    category: "calculators",
    slug: "resistive-element-sizing",
    technologies: ["TypeScript"],
  },
  {
    kind: "internal",
    id: "mortgage",
    title: "Mortgage Calculator",
    description: "Full amortization schedule with payment-frequency options and rate changes at each renewal term.",
    category: "calculators",
    slug: "mortgage",
    technologies: ["TypeScript"],
  },
  {
    kind: "internal",
    id: "retirement",
    title: "Retirement Calculator",
    description: "Projects when investment income alone can cover expenses, with an inflation-adjusted comparison chart.",
    category: "calculators",
    slug: "retirement",
    technologies: ["TypeScript", "Recharts"],
  },
  {
    kind: "internal",
    id: "telescope-mirror",
    title: "Telescope Mirror Design",
    description: "Sagitta, dish geometry, and blank mass for a spherical or paraboloidal primary mirror, plus spin-casting speed.",
    category: "calculators",
    slug: "telescope-mirror",
    technologies: ["TypeScript"],
  },
];

const genericCalculators: InternalProject[] = genericCalculatorSpecs.map((spec) => ({
  kind: "internal",
  id: spec.slug,
  title: spec.title,
  description: spec.description,
  category: "calculators",
  slug: spec.slug,
  technologies: ["TypeScript"],
}));

// Room here for save-game editors (e.g. a Big Pharma save-file tool, built
// in prior eras of this site), other hobby projects, and cards that just
// link out to external repos/sites.
export const projects: Project[] = [...bespokeCalculators, ...genericCalculators];

import { genericCalculatorSpecs, type CalculatorGroup } from "./calculator-specs";

// Calculators are the only project category with its own listing page under
// this data model — Physical Projects and Gaming live in their own data
// files (src/data/physical-projects.ts, src/data/gaming-projects.ts) since
// they aren't calculator-shaped (no fields/formula to run).
export type ProjectCategory = "calculators";

// How the calculators listing page groups its cards. "featured" is reserved
// for the Unit Converter, pinned above the topical groups.
export type ProjectGroup = CalculatorGroup | "featured";

interface BaseProject {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  group: ProjectGroup;
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
    group: "featured",
    slug: "unit-converter",
    technologies: ["TypeScript", "decimal.js"],
  },
  {
    kind: "internal",
    id: "resistive-element-sizing",
    title: "Resistive Element Sizing",
    description: "Calculate the physical properties of a resistive heating element from electrical targets.",
    category: "calculators",
    group: "materials",
    slug: "resistive-element-sizing",
    technologies: ["TypeScript"],
  },
  {
    kind: "internal",
    id: "mortgage",
    title: "Mortgage Calculator",
    description: "Full amortization schedule with payment-frequency options and rate changes at each renewal term.",
    category: "calculators",
    group: "financial",
    slug: "mortgage",
    technologies: ["TypeScript"],
  },
  {
    kind: "internal",
    id: "retirement",
    title: "Retirement Calculator",
    description: "Projects when investment income alone can cover expenses, with an inflation-adjusted comparison chart.",
    category: "calculators",
    group: "financial",
    slug: "retirement",
    technologies: ["TypeScript", "Recharts"],
  },
];

const genericCalculators: InternalProject[] = genericCalculatorSpecs.map((spec) => ({
  kind: "internal",
  id: spec.slug,
  title: spec.title,
  description: spec.description,
  category: "calculators",
  group: spec.group,
  slug: spec.slug,
  technologies: ["TypeScript"],
}));

export const projects: Project[] = [...bespokeCalculators, ...genericCalculators];

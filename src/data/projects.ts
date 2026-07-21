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

// Only real, working, internal tools are listed so far. Room here for
// save-game editors (e.g. a Big Pharma save-file tool, built in prior
// eras of this site), other hobby projects, and cards that just link
// out to external repos/sites.
export const projects: Project[] = [
  {
    kind: "internal",
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between common units of length, mass, and temperature.",
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
];

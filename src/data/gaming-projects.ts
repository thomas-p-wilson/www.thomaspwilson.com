export interface GamingProject {
  id: string;
  title: string;
  description: string;
  /** Combined with /projects/gaming/ to build this project's own page. Mutually exclusive with `url`. */
  slug?: string;
  url?: string;
  technologies?: string[];
}

// A good future candidate: the Big Pharma save-file calculator/simulator
// built in origin/2021-rework and origin/2022 — a real, well-built
// ingredient/effect/product-line engine for the video game Big Pharma,
// never ported forward into this rewrite.
export const gamingProjects: GamingProject[] = [
  {
    id: "pi-precision",
    slug: "pi-precision",
    title: "How Much Pi Do You Need?",
    description:
      "Truncate pi to as few or as many digits as you like and watch the resulting position error ripple across " +
      "the solar system — from Mercury out to the edge of the observable universe.",
    technologies: ["React", "TypeScript", "decimal.js"],
  },
  {
    id: "simple-evolution-simulator",
    slug: "simple-evolution-simulator",
    title: "Simple Evolution Simulator",
    description:
      "A Game-of-Life-styled 2D world of organisms whose traits are genuinely encoded in a mutating RNA-like " +
      "sequence — reproduction, mutation, and lineage all playable and inspectable.",
    technologies: ["React", "TypeScript", "Canvas", "SVG"],
  },
];

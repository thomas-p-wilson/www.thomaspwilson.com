export interface GamingProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies?: string[];
}

// Nothing published here yet. A good first candidate: the Big Pharma
// save-file calculator/simulator built in origin/2021-rework and
// origin/2022 — a real, well-built ingredient/effect/product-line engine
// for the video game Big Pharma, never ported forward into this rewrite.
export const gamingProjects: GamingProject[] = [];

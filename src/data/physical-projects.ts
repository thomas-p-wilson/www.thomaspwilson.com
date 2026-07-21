export interface PhysicalProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  technologies?: string[];
}

// Nothing published here yet — add entries as physical builds are ready to show.
export const physicalProjects: PhysicalProject[] = [];

export type PhysicalProjectGroup = "home" | "shop";

export interface PhysicalProject {
  id: string;
  /** Combined with /projects/physical/ to build this project's detail page. */
  slug: string;
  title: string;
  description: string;
  /** Groups this card under a section header on the listing page (e.g. "Home", "Shop"). Omit for top-level items. */
  group?: PhysicalProjectGroup;
  url?: string;
  technologies?: string[];
}

export const physicalProjectGroupOrder: PhysicalProjectGroup[] = ["home", "shop"];
export const physicalProjectGroupLabels: Record<PhysicalProjectGroup, string> = {
  home: "Home",
  shop: "Shop",
};

const COMING_SOON = "Full write-up coming soon.";

// Real builds with a dedicated page each. Every entry is a stub — title and
// slug only — until its actual write-up (photos, specs, process notes) is
// ready to publish; PhysicalProjectPage renders that honest "coming soon"
// state rather than fabricated content.
export const physicalProjects: PhysicalProject[] = [
  { id: "telescope", slug: "telescope", title: "Telescope", description: COMING_SOON },
  { id: "trommel", slug: "trommel", title: "Trommel", description: COMING_SOON },
  { id: "model-rocketry", slug: "model-rocketry", title: "Model Rocketry", description: COMING_SOON },
  { id: "3d-printing", slug: "3d-printing", title: "3D Printing", description: COMING_SOON },
  {
    id: "air-handling-unit", slug: "air-handling-unit", title: "Self-Contained Air Handling Unit",
    description: COMING_SOON, group: "home",
  },
  { id: "dust-collection", slug: "dust-collection", title: "Dust Collection", description: COMING_SOON, group: "shop" },
  { id: "storage-system", slug: "storage-system", title: "Storage System", description: COMING_SOON, group: "shop" },
];

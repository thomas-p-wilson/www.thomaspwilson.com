import { describe, expect, it } from "vitest";
import { physicalProjectGroupOrder, physicalProjects } from "./physical-projects";

describe("physical projects", () => {
  it("has a unique id and slug per project", () => {
    expect(new Set(physicalProjects.map((p) => p.id)).size).toBe(physicalProjects.length);
    expect(new Set(physicalProjects.map((p) => p.slug)).size).toBe(physicalProjects.length);
  });

  it("every group used by a project is a known group", () => {
    for (const project of physicalProjects) {
      if (project.group) expect(physicalProjectGroupOrder).toContain(project.group);
    }
  });
});

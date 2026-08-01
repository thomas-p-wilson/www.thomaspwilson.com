import { describe, expect, it } from "vitest";
import { gamingProjects } from "./gaming-projects";

describe("gaming projects", () => {
  it("has a unique id per project", () => {
    expect(new Set(gamingProjects.map((p) => p.id)).size).toBe(gamingProjects.length);
  });

  it("every project links somewhere: either an internal slug or an external url, not both", () => {
    for (const project of gamingProjects) {
      expect(Boolean(project.slug)).not.toBe(Boolean(project.url));
    }
  });
});

// Shared by mass-moment-of-inertia and flywheel, ported from origin/2020's
// mass-moment-of-inertia/constants.js. That file's "XY-axis" formulas were
// unimplemented stubs for every configuration except solid_cylinder, and its
// hollow_cylinder Z-axis formula was wired to receive the same radius twice
// (a real bug) instead of separate inner/outer radii — both are fixed here
// rather than ported faithfully, since reproducing them would just be broken.
export interface InertiaConfiguration {
  label: string;
  /** Inertial constant used by the flywheel's kinetic-energy calculation. */
  k: number;
  needsInnerOuterRadius?: boolean;
  inertiaZ: (mass: number, radiusOrOuter: number, innerRadius?: number) => number;
}

export const inertiaConfigurations: Record<string, InertiaConfiguration> = {
  solid_cylinder: {
    label: "Solid Cylinder",
    k: 0.5,
    inertiaZ: (mass, radius) => 0.5 * mass * radius * radius,
  },
  thin_wall_cylinder: {
    label: "Thin-Wall Cylinder",
    k: 1,
    inertiaZ: (mass, radius) => mass * radius * radius,
  },
  hollow_cylinder: {
    label: "Hollow Cylinder",
    k: 0.5,
    needsInnerOuterRadius: true,
    inertiaZ: (mass, outer, inner = 0) => 0.5 * mass * (inner * inner + outer * outer),
  },
  solid_sphere: {
    label: "Solid Sphere",
    k: 2 / 5,
    inertiaZ: (mass, radius) => (2 / 5) * mass * radius * radius,
  },
  thin_wall_sphere: {
    label: "Thin-Wall Sphere",
    k: 2 / 3,
    inertiaZ: (mass, radius) => (2 / 3) * mass * radius * radius,
  },
};

export const inertiaConfigurationOptions = Object.entries(inertiaConfigurations).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

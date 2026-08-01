export type CelestialBodyCategory = "planet" | "dwarf-planet" | "probe" | "star" | "galaxy" | "universe";

export interface CelestialBody {
  id: string;
  name: string;
  category: CelestialBodyCategory;
  /** Distance from the Sun (or, for the last few entries, from Earth), in kilometers. */
  distanceKm: number;
  /** Human-scale distance for display — kept as a fixed label since the natural unit (AU, ly) varies by scale. */
  distanceLabel: string;
}

const AU_KM = 149_597_870;
const LIGHT_YEAR_KM = 9_460_730_472_580.8;

// Semi-major axes for planets/dwarf planets (JPL/IAU reference values); Voyager
// 1's distance is approximate and grows daily, given here as of ~2025.
// Distances beyond the solar system are approximate by nature.
export const celestialBodies: CelestialBody[] = [
  { id: "mercury", name: "Mercury", category: "planet", distanceKm: 0.387 * AU_KM, distanceLabel: "0.39 AU" },
  { id: "venus", name: "Venus", category: "planet", distanceKm: 0.723 * AU_KM, distanceLabel: "0.72 AU" },
  { id: "earth", name: "Earth", category: "planet", distanceKm: 1 * AU_KM, distanceLabel: "1 AU" },
  { id: "mars", name: "Mars", category: "planet", distanceKm: 1.524 * AU_KM, distanceLabel: "1.52 AU" },
  { id: "jupiter", name: "Jupiter", category: "planet", distanceKm: 5.203 * AU_KM, distanceLabel: "5.20 AU" },
  { id: "saturn", name: "Saturn", category: "planet", distanceKm: 9.537 * AU_KM, distanceLabel: "9.54 AU" },
  { id: "uranus", name: "Uranus", category: "planet", distanceKm: 19.191 * AU_KM, distanceLabel: "19.2 AU" },
  { id: "neptune", name: "Neptune", category: "planet", distanceKm: 30.069 * AU_KM, distanceLabel: "30.1 AU" },
  { id: "pluto", name: "Pluto", category: "dwarf-planet", distanceKm: 39.482 * AU_KM, distanceLabel: "39.5 AU" },
  { id: "voyager-1", name: "Voyager 1", category: "probe", distanceKm: 167 * AU_KM, distanceLabel: "~167 AU (2025)" },
  {
    id: "proxima-centauri",
    name: "Proxima Centauri",
    category: "star",
    distanceKm: 4.2465 * LIGHT_YEAR_KM,
    distanceLabel: "4.25 light-years",
  },
  {
    id: "milky-way-diameter",
    name: "Milky Way (diameter)",
    category: "galaxy",
    distanceKm: 100_000 * LIGHT_YEAR_KM,
    distanceLabel: "~100,000 light-years",
  },
  {
    id: "observable-universe",
    name: "Edge of the observable universe",
    category: "universe",
    distanceKm: 46_500_000_000 * LIGHT_YEAR_KM,
    distanceLabel: "~46.5 billion light-years",
  },
];

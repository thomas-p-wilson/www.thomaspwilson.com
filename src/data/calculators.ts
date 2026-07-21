export interface CalculatorSummary {
  id: string;
  title: string;
  description: string;
  category: "conversion" | "engineering";
  path: string;
  technologies: string[];
}

// Statically defined — replaces the Base44-hosted `Calculator` entity list.
// Only real, working, internal tools are listed here; nothing external or
// stubbed. Good future additions (deferred this round): mortgage/amortization
// and telescope-mirror calculators, both of which recur across nearly every
// prior branch of this site.
export const calculators: CalculatorSummary[] = [
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between common units of length, mass, and temperature.",
    category: "conversion",
    path: "/UnitConverter",
    technologies: ["TypeScript", "decimal.js"],
  },
  {
    id: "resistive-element-sizing",
    title: "Resistive Element Sizing",
    description: "Calculate the physical properties of a resistive heating element from electrical targets.",
    category: "engineering",
    path: "/ResistiveElementSizing",
    technologies: ["TypeScript"],
  },
];

import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";
import { weightFromMass } from "./physics";
import { TensionDiagram } from "@/components/calculators/diagrams/TensionDiagrams";

// New — a single vertical line, a single line strung horizontally that sags under the load, and
// two independent angled lines all reduce to the same two-equation force balance at the load
// point (horizontal components cancel, vertical components support the weight); only the geometry
// feeding those two angles differs per scenario. The sagging line is modeled as two straight
// segments meeting at the load rather than a smooth catenary — matching how the diagram draws it,
// and avoiding an iterative solver for a shape this calculator doesn't otherwise need.

const scenarioOptions = [
  { value: "vertical", label: "Single Vertical Line" },
  { value: "horizontal-single", label: "Single Horizontal Line (Sagging)" },
  { value: "horizontal-double", label: "Two Horizontal Lines" },
];

const RAD_PER_DEG = Math.PI / 180;
const DEG_PER_RAD = 180 / Math.PI;

// T1 = W*cos(a2)/sin(a1+a2), T2 = W*cos(a1)/sin(a1+a2) — solved from horizontal components
// canceling (T1*cos(a1) = T2*cos(a2)) and vertical components summing to the weight.
function tensionsFromAngles(weight: number, angle1Deg: number, angle2Deg: number): { t1: number; t2: number } | null {
  if (isNaN(angle1Deg) || isNaN(angle2Deg) || angle1Deg <= 0 || angle2Deg <= 0 || angle1Deg >= 180 || angle2Deg >= 180) return null;
  const a1 = angle1Deg * RAD_PER_DEG, a2 = angle2Deg * RAD_PER_DEG;
  const denom = Math.sin(a1 + a2);
  if (Math.abs(denom) < 1e-9) return null;
  return { t1: (weight * Math.cos(a2)) / denom, t2: (weight * Math.cos(a1)) / denom };
}

export const tensionCalculator: CalculatorSpec = {
  slug: "tension",
  title: "Tension Calculator",
  description: "Line tension for a weight hanging from a single vertical line, a sagging horizontal line, or two angled lines.",
  helpIntro: "This calculator finds the tension in the line(s) holding up a hanging weight, for three common setups: a single vertical line, a single line strung between two fixed points that sags under the load, or two separate lines angled up from the load at their own independent angles. Each card below has a matching explanation here.",
  sections: [
    {
      title: "Load",
      help: "Weight is derived from mass and gravitational acceleration (W = m × g) — expand the Weight tile to explore that calculation on its own, or just edit mass/gravity directly here.",
      fields: [
        { id: "mass", label: "Mass", unit: "kg", measure: "mass" },
        { id: "gravity", label: "Gravitational Acceleration", unit: "m/s²" },
        { id: "weight", label: "Weight", unit: "N", measure: "force", readOnly: true, subCalculator: () => ({
          spec: weightFromMass,
          prefill: (values) => ({ mass: values.mass, gravity: values.gravity }),
        }) },
      ],
    },
    {
      title: "Line Geometry",
      help: [
        "A single vertical line simply carries the full weight. Two angled lines (or the two halves of one sagging line) instead split the load between them, each pulling at its own angle from horizontal.",
        "A sagging horizontal line is treated as two straight segments meeting at the load, not a smooth curve — set the span between the two fixed anchors, how far the line dips at the load, and where along the span the load actually sits.",
      ],
      fields: [
        { id: "scenario", label: "Scenario", type: "select", options: scenarioOptions },
        {
          id: "span", label: "Span (Anchor-to-Anchor Distance)", unit: "m", measure: "length",
          hidden: (v) => v.scenario !== "horizontal-single",
        },
        {
          id: "sagDepth", label: "Sag Depth", unit: "m", measure: "length",
          hidden: (v) => v.scenario !== "horizontal-single",
        },
        {
          id: "position", label: "Weight Position (from Left Anchor)", unit: "m", measure: "length",
          hidden: (v) => v.scenario !== "horizontal-single",
          help: "Moving the load closer to one anchor makes that segment shorter and steeper, and the other longer and shallower. The steeper (nearer) segment ends up carrying more tension than the shallower (farther) one — in the extreme, a load right next to one anchor is carried almost entirely by that side.",
        },
        {
          id: "angle1", label: "Angle 1 (from Horizontal)", unit: "deg", measure: "angle",
          hidden: (v) => v.scenario === "vertical",
          readOnly: (v) => v.scenario === "horizontal-single",
        },
        {
          id: "angle2", label: "Angle 2 (from Horizontal)", unit: "deg", measure: "angle",
          hidden: (v) => v.scenario === "vertical",
          readOnly: (v) => v.scenario === "horizontal-single",
        },
        {
          id: "lineLength1", label: "Line 1 Length", unit: "m", measure: "length", readOnly: true,
          hidden: (v) => v.scenario !== "horizontal-single",
        },
        {
          id: "lineLength2", label: "Line 2 Length", unit: "m", measure: "length", readOnly: true,
          hidden: (v) => v.scenario !== "horizontal-single",
        },
        {
          id: "totalLineLength", label: "Total Line Length", unit: "m", measure: "length", readOnly: true,
          hidden: (v) => v.scenario !== "horizontal-single",
        },
      ],
    },
    {
      title: "Tension",
      fields: [
        { id: "tension1", label: "Tension in Line 1", unit: "N", measure: "force", readOnly: true },
        {
          id: "tension2", label: "Tension in Line 2", unit: "N", measure: "force", readOnly: true,
          hidden: (v) => v.scenario === "vertical",
        },
      ],
    },
  ],
  defaults: {
    mass: "10",
    gravity: "9.80665",
    scenario: "horizontal-single",
    span: "4",
    sagDepth: "0.5",
    position: "1.5",
    angle1: "40",
    angle2: "50",
  },
  calculate: (values) => {
    const mass = num(values, "mass");
    const gravity = num(values, "gravity");
    if (isNaN(mass) || mass < 0 || isNaN(gravity) || gravity <= 0) return values;
    const weight = parseFloat(weightFromMass.calculate({ ...weightFromMass.defaults, mass: String(mass), gravity: String(gravity) }).weight);

    const result = { ...values, weight: weight.toFixed(3) };

    if (values.scenario === "vertical") {
      return {
        ...result,
        angle1: "", angle2: "", lineLength1: "", lineLength2: "", totalLineLength: "",
        tension1: weight.toFixed(2), tension2: "",
      };
    }

    if (values.scenario === "horizontal-single") {
      const span = num(values, "span");
      const sag = num(values, "sagDepth");
      const position = num(values, "position");
      if ([span, sag, position].some((n) => isNaN(n)) || span <= 0 || sag <= 0 || position <= 0 || position >= span) {
        return { ...result, angle1: "", angle2: "", lineLength1: "", lineLength2: "", totalLineLength: "", tension1: "", tension2: "" };
      }
      const remaining = span - position;
      const angle1 = Math.atan2(sag, position) * DEG_PER_RAD;
      const angle2 = Math.atan2(sag, remaining) * DEG_PER_RAD;
      const lineLength1 = Math.sqrt(position * position + sag * sag);
      const lineLength2 = Math.sqrt(remaining * remaining + sag * sag);
      const tensions = tensionsFromAngles(weight, angle1, angle2);
      return {
        ...result,
        angle1: angle1.toFixed(2),
        angle2: angle2.toFixed(2),
        lineLength1: lineLength1.toFixed(3),
        lineLength2: lineLength2.toFixed(3),
        totalLineLength: (lineLength1 + lineLength2).toFixed(3),
        tension1: tensions ? tensions.t1.toFixed(2) : "",
        tension2: tensions ? tensions.t2.toFixed(2) : "",
      };
    }

    // horizontal-double: angle1/angle2 are free inputs, passed through unchanged in `...result`.
    const tensions = tensionsFromAngles(weight, num(values, "angle1"), num(values, "angle2"));
    return {
      ...result,
      lineLength1: "", lineLength2: "", totalLineLength: "",
      tension1: tensions ? tensions.t1.toFixed(2) : "",
      tension2: tensions ? tensions.t2.toFixed(2) : "",
    };
  },
  notes: [
    "Weight: W = m × g.",
    "Single vertical line: T1 = W.",
    "Two angled lines (or a sagging line's two segments): T1 = W·cos(θ2) / sin(θ1+θ2), T2 = W·cos(θ1) / sin(θ1+θ2), where θ1/θ2 are each line's angle from horizontal — derived from the horizontal components canceling and the vertical components summing to the weight.",
    "Sagging single line: modeled as two straight segments meeting at the load (not a catenary); each segment's angle and length follow from the span, sag depth, and the load's position along the span.",
  ],
  visual: (values) => {
    if (values.scenario === "vertical") return <TensionDiagram scenario={{ kind: "vertical" }} />;
    if (values.scenario === "horizontal-single") {
      return (
        <TensionDiagram scenario={{
          kind: "horizontal-single",
          span: num(values, "span"),
          sagDepth: num(values, "sagDepth"),
          position: num(values, "position"),
          angle1: parseFloat(values.angle1),
          angle2: parseFloat(values.angle2),
        }}
        />
      );
    }
    return <TensionDiagram scenario={{ kind: "horizontal-double", angle1: num(values, "angle1"), angle2: num(values, "angle2") }} />;
  },
};

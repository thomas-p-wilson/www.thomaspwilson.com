import {
  circleGeometry, circularSegment, sphereGeometry, sphericalCap, boxVolume, cylinderSurfaceArea,
  cylinderVolume, parabolicSegment, paraboloidalCap,
} from "./geometry";
import { idealGasLaw, centrifugalForce, flywheel, massMomentOfInertia, spinCastRotation } from "./physics";
import { loanPayment, effectiveInterestRate } from "./financial-simple";
import { wireGauge, helixSizing, kilnWattage, thermalMassStorage, materialMass } from "./materials";
import { solarPanels, woodgasConversion, chemicalStorage } from "./energy-domain";
import { telescopeMirror } from "./telescope";
import type { CalculatorSpec } from "@/lib/calculator";

export type CalculatorGroup = "geometry" | "physics" | "materials" | "energy" | "financial";

const tag = (group: CalculatorGroup, specs: CalculatorSpec[]) => specs.map((spec) => ({ ...spec, group }));

export const genericCalculatorSpecs: (CalculatorSpec & { group: CalculatorGroup })[] = [
  ...tag("geometry", [
    circleGeometry, circularSegment, sphereGeometry, sphericalCap, boxVolume, cylinderSurfaceArea,
    parabolicSegment, paraboloidalCap, cylinderVolume, telescopeMirror,
  ]),
  ...tag("physics", [idealGasLaw, centrifugalForce, flywheel, massMomentOfInertia, spinCastRotation]),
  ...tag("financial", [loanPayment, effectiveInterestRate]),
  ...tag("materials", [wireGauge, helixSizing, kilnWattage, thermalMassStorage, materialMass]),
  ...tag("energy", [solarPanels, woodgasConversion, chemicalStorage]),
];

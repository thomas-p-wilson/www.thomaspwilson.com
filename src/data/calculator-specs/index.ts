import { circleGeometry, circularSegment, sphereGeometry, sphericalCap, boxVolume, cylinderSurfaceArea } from "./geometry";
import { idealGasLaw, centrifugalForce, flywheel, massMomentOfInertia } from "./physics";
import { loanPayment, effectiveInterestRate } from "./financial-simple";
import { wireGauge, helixSizing, kilnWattage, thermalMassStorage } from "./materials";
import { solarPanels, woodgasConversion, chemicalStorage } from "./energy-domain";
import type { CalculatorSpec } from "@/lib/calculator";

export const genericCalculatorSpecs: CalculatorSpec[] = [
  circleGeometry, circularSegment, sphereGeometry, sphericalCap, boxVolume, cylinderSurfaceArea,
  idealGasLaw, centrifugalForce, flywheel, massMomentOfInertia,
  loanPayment, effectiveInterestRate,
  wireGauge, helixSizing, kilnWattage, thermalMassStorage,
  solarPanels, woodgasConversion, chemicalStorage,
];

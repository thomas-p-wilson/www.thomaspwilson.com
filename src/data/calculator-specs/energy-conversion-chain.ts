import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";

// New — a fuel's heating value only tells you what's available at the source; anything short of
// burning it directly for heat passes through one or more real machines (engine, generator,
// electrolyzer, battery...) that each throw away some fraction as waste heat. This chains up to
// three such steps in series. Three fixed slots rather than a dynamic list since the field spec
// has no repeatable-row primitive — matches how Telescope bounds its optional secondary mirror to
// one toggleable section rather than an arbitrary list of optics.

const stepTypeOptions = [
  { value: "ice", label: "Internal Combustion Engine" },
  { value: "heatEngine", label: "Heat Engine / Turbine" },
  { value: "generator", label: "Generator (Mechanical → Electrical)" },
  { value: "motor", label: "Electric Motor (Electrical → Mechanical)" },
  { value: "electrolyzer", label: "Electrolyzer (Electrical → Hydrogen)" },
  { value: "fuelCell", label: "Fuel Cell (Hydrogen → Electrical)" },
  { value: "battery", label: "Battery (Round-Trip Charge/Discharge)" },
  { value: "transmission", label: "Transmission / Gearbox" },
  { value: "gridLosses", label: "Transmission & Distribution Losses" },
  { value: "other", label: "Other" },
];

interface StepKeys {
  enabledKey?: string;
  typeKey: string;
  efficiencyKey: string;
  outKey: string;
}

const steps: StepKeys[] = [
  { typeKey: "step1Type", efficiencyKey: "step1Efficiency", outKey: "step1EnergyOut" },
  { enabledKey: "step2Enabled", typeKey: "step2Type", efficiencyKey: "step2Efficiency", outKey: "step2EnergyOut" },
  { enabledKey: "step3Enabled", typeKey: "step3Type", efficiencyKey: "step3Efficiency", outKey: "step3EnergyOut" },
];

const stepSection = (index: number, step: StepKeys) => ({
  title: `Step ${index + 1}${step.enabledKey ? " (Optional)" : ""}`,
  oneColumn: true,
  ...(step.enabledKey ? { toggle: { id: step.enabledKey, label: "Add Step" } } : {}),
  help: "\"Conversion Type\" is just a label for your own reference — it doesn't drive the math. Set Efficiency directly; real-world efficiency for any of these varies a lot by equipment and operating point, so there's no single right default.",
  fields: [
    { id: step.typeKey, label: "Conversion Type", type: "select" as const, options: stepTypeOptions },
    { id: step.efficiencyKey, label: "Efficiency", unit: "%" },
    { id: step.outKey, label: "Energy After This Step", unit: "kWh", measure: "energy" as const, readOnly: true },
  ],
});

export const energyConversionChain: CalculatorSpec = {
  slug: "energy-conversion-chain",
  title: "Energy Conversion Chain",
  description: "Energy actually delivered after a series of real-world conversion steps, each with its own efficiency loss.",
  helpIntro: "Converting energy from one form to another is never lossless — an engine, a generator, an electrolyzer, a battery, all waste some fraction as heat. Chain up to three steps (e.g. fuel → engine → generator) to see how much of the original energy survives to the far end, and how much the losses compound.",
  sections: [
    {
      title: "Input Energy",
      fields: [
        { id: "energyIn", label: "Energy In", unit: "kWh", measure: "energy" },
      ],
    },
    stepSection(0, steps[0]),
    stepSection(1, steps[1]),
    stepSection(2, steps[2]),
    {
      title: "Result",
      fields: [
        { id: "energyOut", label: "Energy Delivered", unit: "kWh", measure: "energy", readOnly: true, funFact: true },
        { id: "overallEfficiency", label: "Overall Efficiency", unit: "%", readOnly: true },
      ],
    },
  ],
  defaults: {
    energyIn: "33.7",
    step1Type: "ice", step1Efficiency: "30",
    step2Enabled: "true", step2Type: "generator", step2Efficiency: "95",
    step3Enabled: "false", step3Type: "other", step3Efficiency: "90",
  },
  calculate: (values) => {
    const cleared = { ...values, step1EnergyOut: "", step2EnergyOut: "", step3EnergyOut: "", energyOut: "", overallEfficiency: "" };
    const energyIn = num(values, "energyIn");
    if (Number.isNaN(energyIn) || energyIn < 0) return cleared;

    const result = { ...cleared };
    let energy = energyIn;
    let broken = false;

    for (const step of steps) {
      const enabled = !step.enabledKey || values[step.enabledKey] === "true";
      if (!enabled) continue;
      const efficiency = num(values, step.efficiencyKey);
      if (broken || Number.isNaN(efficiency) || efficiency < 0 || efficiency > 100) {
        broken = true;
        continue;
      }
      energy = energy * (efficiency / 100);
      (result as Record<string, string>)[step.outKey] = energy.toFixed(3);
    }

    if (broken) return result;

    result.energyOut = energy.toFixed(3);
    result.overallEfficiency = energyIn === 0 ? "0.00" : ((energy / energyIn) * 100).toFixed(2);
    return result;
  },
  notes: [
    "Typical illustrative efficiencies: internal combustion engine 20–35%; generator 90–97%; electric motor 85–95%; electrolyzer 60–80%; fuel cell 40–60%; battery round-trip 85–95%; transmission & distribution ~90–95%. Real equipment varies widely — edit each step's efficiency directly rather than trusting these as defaults.",
    "Steps chain in order: Step 2 acts on Step 1's output, Step 3 on Step 2's. Overall efficiency is the product of every enabled step's efficiency.",
  ],
};

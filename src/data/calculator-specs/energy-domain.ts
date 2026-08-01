import type { CalculatorSpec } from "@/lib/calculator";
import { num } from "@/lib/calculator";

// Ported from origin/2021-rework/2022's photovoltaic calculator (their
// defaults — 2019/2021 used dailyLightHours=6 instead of 5).
export const solarPanels: CalculatorSpec = {
  slug: "solar-panels",
  title: "Solar Panel Bank Sizing",
  description: "Number and cost of solar panels needed to meet a daily energy demand.",
  sections: [{
    title: "Demand & Panels",
    fields: [
      { id: "dailyDemand", label: "Daily Demand", unit: "Wh", measure: "energy" },
      { id: "insolation", label: "Peak Sun Hours / Day", unit: "h", measure: "time" },
      { id: "panelRating", label: "Panel Rating", unit: "W", measure: "power" },
      { id: "panelPrice", label: "Panel Price", unit: "$" },
      { id: "efficiencyModifier", label: "Efficiency Modifier", unit: "fraction (e.g. 0.8)" },
      { id: "demandPerInsolationHour", label: "Demand per Insolation Hour", unit: "W", measure: "power", readOnly: true },
      { id: "realRating", label: "Real Panel Rating", unit: "W", measure: "power", readOnly: true },
      { id: "costPerWatt", label: "Cost per Watt", unit: "$", readOnly: true },
      { id: "panelCount", label: "Panels Required", readOnly: true },
      { id: "totalCost", label: "Total Cost", unit: "$", readOnly: true },
    ],
  }],
  defaults: { dailyDemand: "30000", insolation: "5", panelRating: "280", panelPrice: "210", efficiencyModifier: "0.8" },
  calculate: (values) => {
    const dailyDemand = num(values, "dailyDemand");
    const insolation = num(values, "insolation");
    const panelRating = num(values, "panelRating");
    const panelPrice = num(values, "panelPrice");
    const efficiency = num(values, "efficiencyModifier");
    if ([dailyDemand, insolation, panelRating, panelPrice, efficiency].some(Number.isNaN) || insolation === 0) return values;

    const demandPerInsolationHour = dailyDemand / insolation;
    const realRating = panelRating * efficiency;
    const costPerWatt = panelPrice / realRating;
    const panelCount = Math.ceil(demandPerInsolationHour / realRating);
    const totalCost = panelCount * panelPrice;

    return {
      ...values,
      demandPerInsolationHour: demandPerInsolationHour.toFixed(1),
      realRating: realRating.toFixed(1),
      costPerWatt: costPerWatt.toFixed(3),
      panelCount: panelCount.toFixed(0),
      totalCost: totalCost.toFixed(2),
    };
  },
};

const batteryChemistries: Record<string, { label: string; nominalChargeCycle: number }> = {
  lion: { label: "Lithium Ion", nominalChargeCycle: 0.8 },
  lipo: { label: "Lithium Polymer", nominalChargeCycle: 0.8 },
  lifepo: { label: "Lithium Iron Phosphate", nominalChargeCycle: 1 },
  leadacid: { label: "Lead Acid", nominalChargeCycle: 0.5 },
};

// Ported from origin/2021-rework/2022's chemical-storage ("Battery Storage")
// calculator — the first working version; every earlier branch's
// ChemicalStorage.js was dead legacy code (a broken copy-paste of an
// unrelated EV-range calculator, never wired to any UI).
export const chemicalStorage: CalculatorSpec = {
  slug: "battery-storage",
  title: "Battery Storage Sizing",
  description: "Cell count and cost to build a battery bank of a target usable capacity.",
  sections: [{
    title: "Battery Bank",
    fields: [
      {
        id: "material", label: "Chemistry", type: "select",
        options: Object.entries(batteryChemistries).map(([value, c]) => ({ value, label: c.label })),
      },
      { id: "capacity", label: "Usable Capacity", unit: "kWh", measure: "energy" },
      { id: "cellCapacity", label: "Cell Capacity", unit: "Wh", measure: "energy" },
      { id: "cellCost", label: "Cell Cost", unit: "$" },
      { id: "taxes", label: "Taxes", unit: "fraction (e.g. 0.13)" },
      { id: "nameplateCapacity", label: "Nameplate Capacity", unit: "kWh", measure: "energy", readOnly: true },
      { id: "cellCount", label: "Cell Count", readOnly: true },
      { id: "totalCost", label: "Total Cost", unit: "$", readOnly: true },
    ],
  }],
  defaults: { material: "lion", capacity: "300", cellCapacity: "0.74", cellCost: "1.5", taxes: "0.13" },
  calculate: (values) => {
    const chemistry = batteryChemistries[values.material];
    const capacity = num(values, "capacity");
    const cellCapacity = num(values, "cellCapacity");
    const cellCost = num(values, "cellCost");
    const taxes = num(values, "taxes");
    if (!chemistry || [capacity, cellCapacity, cellCost, taxes].some(Number.isNaN) || cellCapacity === 0) return values;

    const nameplateCapacity = capacity / chemistry.nominalChargeCycle;
    const cellCount = nameplateCapacity / (cellCapacity / 1000);
    const totalCost = cellCount * cellCost * (1 + taxes);

    return {
      ...values,
      nameplateCapacity: nameplateCapacity.toFixed(2),
      cellCount: cellCount.toFixed(0),
      totalCost: totalCost.toFixed(2),
    };
  },
};

// A grab-bag of "how much is that, really?" comparisons for a kWh figure. Unlike a raw unit
// conversion, these are colloquial machine/fuel pairings — a Prius runs on gasoline, not diesel;
// nobody brews coffee off a diesel generator in casual conversation — so each entry is tagged with
// the fuel key(s) (from fuel-equivalence.ts) it plausibly goes with, and `randomEquivalent` only
// draws from the ones that fit the fuel actually selected. A few (marathons, dynamite, the nuclear
// detonations) don't imply any specific machine and so apply regardless of fuel, tagged "any".
// "custom" has no assumed real-world use and so intentionally falls back to only the "any" pool —
// same reasoning the calculator itself uses for not assuming a heating value for it.
//
// Several entries are calibrated directly off real-world reference points (Prius, GTO, Kenworth,
// Abrams, DoD, Canadian home heating, the named nuclear tests) rather than picked to look tidy, so
// the same fact reads sensibly whether the input is a fraction of a gallon or a tanker's worth.
//
// Each entry offers a few alternate phrasings of the same underlying number rather than one fixed
// sentence — "70 km behind the wheel of a Prius" vs "enough to drive a Prius 70 km" — so shuffling
// doesn't always read in the same voice even when it lands on the same comparison twice.

const fmt = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });

/** 1 kiloton TNT-equivalent = 4.184e12 J, the standard definition used for nuclear weapon yields. */
const KWH_PER_KILOTON_TNT = 1_162_222;

/** Matches a fuel-equivalence.ts fuel key, or "any" for a comparison that doesn't imply a specific machine. */
type FuelTag = string;

export interface EnergyEquivalent {
  id: string;
  /** kWh required for one unit of the activity this equivalent describes. */
  kWhPerUnit: number;
  /** Fuel keys this comparison plausibly pairs with, or "any" if it's fuel-agnostic. */
  fuels: FuelTag[];
  /** Alternate ways to phrase this comparison given the resulting quantity; one is picked at random each time it's shown. */
  phrasings: ((units: number) => string)[];
}

export const energyEquivalents: EnergyEquivalent[] = [
  {
    id: "prius-km",
    kWhPerUnit: 33.7 / 70,
    fuels: ["gasoline"],
    phrasings: [
      (km) => `${fmt.format(km)} km behind the wheel of a Toyota Prius`,
      (km) => `enough to drive a Toyota Prius ${fmt.format(km)} km`,
    ],
  },
  {
    id: "gto-miles",
    kWhPerUnit: 33.7 / 10,
    fuels: ["gasoline"],
    phrasings: [
      (mi) => `${fmt.format(mi)} miles of tire smoke in a 1967 Pontiac GTO`,
      (mi) => `enough to send a 1967 Pontiac GTO ${fmt.format(mi)} miles down the strip`,
    ],
  },
  {
    id: "kenworth-miles",
    kWhPerUnit: 38 / 4,
    fuels: ["diesel"],
    phrasings: [
      (mi) => `${fmt.format(mi)} miles hauling an empty trailer in a Kenworth T880`,
      (mi) => `enough to haul an empty trailer ${fmt.format(mi)} miles in a Kenworth T880`,
    ],
  },
  {
    id: "locomotive-hours",
    kWhPerUnit: 175 * 38, // a freight locomotive at full throttle burns roughly 175 gal diesel/hour
    fuels: ["diesel"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours pulling a freight train at full throttle`,
      (hours) => `enough to run a freight locomotive at full throttle for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "abrams-miles",
    kWhPerUnit: 38 * 2,
    fuels: ["diesel"],
    phrasings: [
      (mi) => `${fmt.format(mi)} miles rolling in an M1 Abrams tank`,
      (mi) => `enough to roll an M1 Abrams tank ${fmt.format(mi)} miles`,
    ],
  },
  {
    id: "dod-days",
    kWhPerUnit: 38 * 12_600_000,
    fuels: ["diesel"],
    phrasings: [
      (days) => `${fmt.format(days)} days of fuel for the entire US Department of Defense`,
      (days) => `enough to fuel the entire US Department of Defense for ${fmt.format(days)} days`,
    ],
  },
  {
    id: "canadian-home-heating-days",
    kWhPerUnit: 10.72 * 7,
    fuels: ["naturalGas", "propane", "biomass", "syngas"],
    phrasings: [
      (days) => `${fmt.format(days)} days heating a Canadian home through a prairie winter`,
      (days) => `enough to heat a Canadian home through ${fmt.format(days)} days of a prairie winter`,
    ],
  },
  {
    id: "gas-stove-hours",
    kWhPerUnit: 3,
    fuels: ["naturalGas", "propane", "syngas"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours simmering on a gas stove burner`,
      (hours) => `enough to keep a gas stove burner going for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "bbq-grill-hours",
    kWhPerUnit: 6.5,
    fuels: ["propane"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours grilling on a propane BBQ`,
      (hours) => `enough to keep a propane BBQ lit for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "hot-air-balloon-hours",
    kWhPerUnit: 18 * 26.8, // a burner run continuously at ~18 gal propane/hour in flight
    fuels: ["propane"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours aloft in a hot air balloon`,
      (hours) => `enough to keep a hot air balloon aloft for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "campfire-hours",
    kWhPerUnit: 4.52 * 3,
    fuels: ["biomass"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours keeping a campfire fed`,
      (hours) => `enough to keep a campfire fed for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "pizza-oven-hours",
    kWhPerUnit: 4.52 * 7, // a wood-fired pizza oven burns roughly 7 kg/hour at cooking temperature
    fuels: ["biomass"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours firing a wood-fired pizza oven`,
      (hours) => `enough to keep a wood-fired pizza oven firing for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "generator-10kw-days",
    kWhPerUnit: 10 * 24, // a steady 10kW load, 24 hours a day
    fuels: ["gasoline", "diesel", "syngas"],
    phrasings: [
      (days) => `${fmt.format(days)} days running a 10kW generator at full load`,
      (days) => `enough to run a 10kW generator at full load for ${fmt.format(days)} days`,
    ],
  },
  {
    id: "chainsaw-hours",
    kWhPerUnit: 5.3, // ~0.6 L/hour typical two-stroke chainsaw fuel burn
    fuels: ["gasoline"],
    phrasings: [
      (hours) => `${fmt.format(hours)} hours running a two-stroke chainsaw`,
      (hours) => `enough to keep a two-stroke chainsaw running for ${fmt.format(hours)} hours`,
    ],
  },
  {
    id: "coal-steel-tonnes",
    kWhPerUnit: 700 * 6.67, // ~700 kg of coking coal typically consumed per tonne of steel produced
    fuels: ["coal"],
    phrasings: [
      (tonnes) => `${fmt.format(tonnes)} tonnes of steel forged in a blast furnace`,
      (tonnes) => `enough to forge ${fmt.format(tonnes)} tonnes of steel in a blast furnace`,
    ],
  },
  {
    id: "coal-railcars",
    kWhPerUnit: 110_000 * 6.67, // a loaded coal hopper car carries roughly 110 tonnes
    fuels: ["coal"],
    phrasings: [
      (cars) => `${fmt.format(cars)} loaded coal railcars`,
      (cars) => `enough coal to fill ${fmt.format(cars)} loaded railcars`,
    ],
  },
  {
    id: "tesla-km",
    kWhPerUnit: 0.17,
    fuels: ["electricity"],
    phrasings: [
      (km) => `${fmt.format(km)} km in a Tesla Model 3`,
      (km) => `enough to drive a Tesla Model 3 ${fmt.format(km)} km`,
    ],
  },
  {
    id: "us-home-days",
    kWhPerUnit: 30,
    fuels: ["electricity", "coal"],
    phrasings: [
      (days) => `${fmt.format(days)} days powering an average American home`,
      (days) => `enough to power an average American home for ${fmt.format(days)} days`,
    ],
  },
  {
    id: "phone-charges",
    kWhPerUnit: 0.012,
    fuels: ["electricity"],
    phrasings: [
      (charges) => `${fmt.format(charges)} full smartphone charges`,
      (charges) => `enough to fully charge a smartphone ${fmt.format(charges)} times`,
    ],
  },
  {
    id: "led-bulb-years",
    kWhPerUnit: (10 * 24 * 365) / 1000,
    fuels: ["electricity"],
    phrasings: [
      (years) => `${fmt.format(years)} years running a 10W LED bulb nonstop`,
      (years) => `enough to run a 10W LED bulb nonstop for ${fmt.format(years)} years`,
    ],
  },
  {
    id: "iss-days",
    kWhPerUnit: 2000,
    fuels: ["electricity"],
    phrasings: [
      (days) => `${fmt.format(days)} days powering the International Space Station`,
      (days) => `enough to power the International Space Station for ${fmt.format(days)} days`,
    ],
  },
  {
    id: "coffee-pots",
    kWhPerUnit: 0.1,
    fuels: ["electricity"],
    phrasings: [
      (pots) => `${fmt.format(pots)} pots of coffee brewed`,
      (pots) => `enough to brew ${fmt.format(pots)} pots of coffee`,
    ],
  },
  {
    id: "marathons",
    kWhPerUnit: 3.02,
    fuels: ["any"],
    phrasings: [
      (marathons) => `${fmt.format(marathons)} marathons' worth of calories burned`,
      (marathons) => `enough calories to run ${fmt.format(marathons)} marathons`,
    ],
  },
  {
    id: "dynamite-sticks",
    kWhPerUnit: 0.23,
    fuels: ["any"],
    phrasings: [
      (sticks) => `${fmt.format(sticks)} sticks of dynamite going off`,
      (sticks) => `enough to set off ${fmt.format(sticks)} sticks of dynamite`,
    ],
  },
  {
    id: "davy-crockett-blasts",
    kWhPerUnit: 0.01 * KWH_PER_KILOTON_TNT, // W54 warhead, the smallest-yield US nuclear weapon fielded, ~10 tons
    fuels: ["any"],
    phrasings: [
      (n) => `${fmt.format(n)} Davy Crockett tactical nuke detonations (10 tons TNT each)`,
      (n) => `enough to set off ${fmt.format(n)} Davy Crockett tactical nukes (10 tons TNT each)`,
    ],
  },
  {
    id: "trinity-blasts",
    kWhPerUnit: 21 * KWH_PER_KILOTON_TNT, // the first nuclear test, July 1945
    fuels: ["any"],
    phrasings: [
      (n) => `${fmt.format(n)} Trinity-test-sized detonations (21 kilotons each)`,
      (n) => `enough to set off ${fmt.format(n)} Trinity-test-sized detonations (21 kilotons each)`,
    ],
  },
  {
    id: "castle-bravo-blasts",
    kWhPerUnit: 15_000 * KWH_PER_KILOTON_TNT, // the largest US nuclear test, 1954
    fuels: ["any"],
    phrasings: [
      (n) => `${fmt.format(n)} Castle Bravo-sized detonations (15 megatons each)`,
      (n) => `enough to set off ${fmt.format(n)} Castle Bravo-sized detonations (15 megatons each)`,
    ],
  },
  {
    id: "tsar-bomba-blasts",
    kWhPerUnit: 50_000 * KWH_PER_KILOTON_TNT, // the largest weapon ever detonated, 1961
    fuels: ["any"],
    phrasings: [
      (n) => `${fmt.format(n)} Tsar Bomba detonations (50 megatons each)`,
      (n) => `enough to set off ${fmt.format(n)} Tsar Bomba detonations (50 megatons each)`,
    ],
  },
];

/**
 * Picks a random comparison scaled to `totalEnergyKWh`, optionally avoiding a repeat of `excludeId`,
 * and renders it via a randomly chosen one of its phrasings. When `fuelKey` is given, restricts to
 * comparisons tagged for that fuel (plus fuel-agnostic "any" ones); omit it (as when the energy's
 * source fuel isn't known, e.g. post-conversion-chain output) to draw from the full list unfiltered.
 */
export function randomEquivalent(totalEnergyKWh: number, fuelKey?: string, excludeId?: string): { id: string; text: string } | undefined {
  if (!Number.isFinite(totalEnergyKWh) || totalEnergyKWh <= 0) return undefined;
  const relevant = fuelKey
    ? energyEquivalents.filter((e) => e.fuels.includes("any") || e.fuels.includes(fuelKey))
    : energyEquivalents;
  const pool = relevant.length > 1 && excludeId ? relevant.filter((e) => e.id !== excludeId) : relevant;
  const choice = pool[Math.floor(Math.random() * pool.length)];
  const phrasing = choice.phrasings[Math.floor(Math.random() * choice.phrasings.length)];
  return { id: choice.id, text: phrasing(totalEnergyKWh / choice.kWhPerUnit) };
}

/**
 * Which job title I'm allowed to use depends on where the reader is.
 *
 * Location is guessed from the browser's timezone only: no network request, no
 * IP lookup. It's coarse on purpose; anything unknown falls back to the
 * safe (Canadian) answer.
 *
 * Facts checked November 2026. Main sources:
 *  - Alberta carve-out: apega.ca/news/2023/11/06/notification-of-changes-to-the-engineering-and-geoscience-professions-act-regarding-the-title-of-software-engineer
 *  - B.C. Bill 13: news.gov.bc.ca/releases/2025ag0020-000342
 *  - Florida: Fla. Stat. 471.031(1)(b); Texas: Occ. Code 1001.301
 *  - Oregon: Järlström v. Aldridge, D. Or. 2018
 *  - UK: engc.org.uk status-of-engineers FAQ
 *  - Germany: state Ingenieurgesetze; Italy: esame di Stato + albo
 *  - Victoria: consumer.vic.gov.au professional engineers registration
 */

export type Verdict = "yes" | "no" | "risky";

export interface Jurisdiction {
  id: string;
  /** Shown in the table. */
  name: string;
  /** How it reads after "you're in", when it differs from name. */
  inName?: string;
  flag: string;
  verdict: Verdict;
  /** One short line explaining the rule. */
  note: string;
}

export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "ca",
    name: "Canada (except Alberta)",
    inName: "Canada",
    flag: "🇨🇦",
    verdict: "no",
    note: "“Engineer” is protected. No P.Eng, no “Engineer”. Ontario's regulator sent a startup a cease-and-desist over it in 2024.",
  },
  {
    id: "ca-ab",
    name: "Alberta",
    flag: "🇨🇦",
    verdict: "yes",
    note: "Changed the law in 2023 after the regulator lost in court. “Software engineer” is fine; “P.Eng” still isn't.",
  },
  {
    id: "us",
    name: "Most of the US",
    inName: "the US",
    flag: "🇺🇸",
    verdict: "yes",
    note: "Usually only “Professional Engineer” (PE) is protected. “Software Engineer” is just a job title.",
  },
  {
    id: "us-or",
    name: "Oregon",
    flag: "🇺🇸",
    verdict: "yes",
    note: "Fined a man $500 for calling himself an engineer. He sued, and a federal court struck the rule down in 2018.",
  },
  {
    id: "us-tx",
    name: "Texas",
    flag: "🇺🇸",
    verdict: "risky",
    note: "Restricts “engineer” as a title without a licence, with exemptions for some industry employees.",
  },
  {
    id: "us-fl",
    name: "Florida",
    flag: "🇺🇸",
    verdict: "no",
    note: "Names “software engineer” specifically as off-limits without a licence, with some exemptions.",
  },
  {
    id: "uk",
    name: "United Kingdom",
    inName: "the UK",
    flag: "🇬🇧",
    verdict: "yes",
    note: "Anyone can be an engineer. Only titles like “Chartered Engineer” (CEng) are protected.",
  },
  {
    id: "ie",
    name: "Ireland",
    flag: "🇮🇪",
    verdict: "yes",
    note: "“Chartered Engineer” is the protected title.",
  },
  {
    id: "fr",
    name: "France",
    flag: "🇫🇷",
    verdict: "yes",
    note: "“Ingénieur” is open to anyone. Only “ingénieur diplômé” needs the diploma.",
  },
  {
    id: "de",
    name: "Germany",
    flag: "🇩🇪",
    verdict: "risky",
    note: "“Ingenieur” needs an engineering degree. Whether that covers the English word is untested, and I'm not volunteering.",
  },
  {
    id: "it",
    name: "Italy",
    flag: "🇮🇹",
    verdict: "no",
    note: "“Ingegnere” needs a degree, a state exam and registration. A degree alone makes you a “dottore”.",
  },
  {
    id: "au",
    name: "Australia",
    flag: "🇦🇺",
    verdict: "yes",
    note: "Queensland and Victoria protect “professional engineer”. Plain “engineer” is fair game.",
  },
  {
    id: "nz",
    name: "New Zealand",
    flag: "🇳🇿",
    verdict: "yes",
    note: "“Chartered Professional Engineer” is the protected title.",
  },
  {
    id: "in",
    name: "India",
    flag: "🇮🇳",
    verdict: "yes",
    note: "No engineering title law. An Engineers Bill has been proposed since about 2004.",
  },
  {
    id: "jp",
    name: "Japan",
    flag: "🇯🇵",
    verdict: "yes",
    note: "Only 技術士 (“Professional Engineer”) is protected.",
  },
];

const byId = (id: string): Jurisdiction => {
  const j = JURISDICTIONS.find((x) => x.id === id);
  if (!j) throw new Error(`Unknown jurisdiction "${id}"`);
  return j;
};

export interface DetectedPlace {
  /** How the place reads in "It looks like you're in {place}". */
  place: string;
  jurisdiction: Jurisdiction;
  /** Optional extra line shown in the popover for this guess. */
  aside?: string;
}

type PlaceRule = { place: string; jurisdiction: string; aside?: string };

const BC_ASIDE =
  "B.C. passed a law in 2025 that could let me use “Software Engineer”. The regulation that would actually do it hasn't been made yet.";
const EASTERN_ASIDE = "Unless you're in Florida, which bans “software engineer” by name.";
const CENTRAL_ASIDE = "Unless you're in Texas, in which case let's keep this between us.";
const PACIFIC_ASIDE = "Even Oregon, eventually. It took a federal lawsuit.";

const CA_ZONES: Record<string, PlaceRule> = {
  "America/Vancouver": { place: "British Columbia", jurisdiction: "ca", aside: BC_ASIDE },
  "America/Edmonton": { place: "Alberta", jurisdiction: "ca-ab" },
  "America/Regina": { place: "Saskatchewan", jurisdiction: "ca" },
  "America/Swift_Current": { place: "Saskatchewan", jurisdiction: "ca" },
  "America/Winnipeg": { place: "Manitoba", jurisdiction: "ca" },
  "America/Toronto": { place: "Ontario (or Québec)", jurisdiction: "ca" },
  "America/Montreal": { place: "Québec", jurisdiction: "ca" },
  "America/Nipigon": { place: "Ontario", jurisdiction: "ca" },
  "America/Thunder_Bay": { place: "Ontario", jurisdiction: "ca" },
  "America/Halifax": { place: "the Maritimes", jurisdiction: "ca" },
  "America/Moncton": { place: "New Brunswick", jurisdiction: "ca" },
  "America/Glace_Bay": { place: "Nova Scotia", jurisdiction: "ca" },
  "America/Goose_Bay": { place: "Labrador", jurisdiction: "ca" },
  "America/St_Johns": { place: "Newfoundland", jurisdiction: "ca" },
  "America/Whitehorse": { place: "the Yukon", jurisdiction: "ca" },
  "America/Dawson": { place: "the Yukon", jurisdiction: "ca" },
  "America/Yellowknife": { place: "the Northwest Territories", jurisdiction: "ca" },
  "America/Inuvik": { place: "the Northwest Territories", jurisdiction: "ca" },
  "America/Iqaluit": { place: "Nunavut", jurisdiction: "ca" },
  "America/Rankin_Inlet": { place: "Nunavut", jurisdiction: "ca" },
  "America/Cambridge_Bay": { place: "Nunavut", jurisdiction: "ca" },
};

const EXACT: Record<string, PlaceRule> = {
  ...CA_ZONES,
  "America/New_York": { place: "the US (Eastern time)", jurisdiction: "us", aside: EASTERN_ASIDE },
  "America/Detroit": { place: "Michigan", jurisdiction: "us" },
  "America/Chicago": { place: "the US (Central time)", jurisdiction: "us", aside: CENTRAL_ASIDE },
  "America/Denver": { place: "the US (Mountain time)", jurisdiction: "us" },
  "America/Boise": { place: "Idaho", jurisdiction: "us" },
  "America/Phoenix": { place: "Arizona", jurisdiction: "us" },
  "America/Los_Angeles": { place: "the US (Pacific time)", jurisdiction: "us", aside: PACIFIC_ASIDE },
  "America/Anchorage": { place: "Alaska", jurisdiction: "us" },
  "Pacific/Honolulu": { place: "Hawaii", jurisdiction: "us" },
  "Europe/London": { place: "the UK", jurisdiction: "uk" },
  "Europe/Belfast": { place: "Northern Ireland", jurisdiction: "uk" },
  "Europe/Dublin": { place: "Ireland", jurisdiction: "ie" },
  "Europe/Paris": { place: "France", jurisdiction: "fr" },
  "Europe/Berlin": { place: "Germany", jurisdiction: "de" },
  "Europe/Busingen": { place: "Germany", jurisdiction: "de" },
  "Europe/Rome": { place: "Italy", jurisdiction: "it" },
  "Australia/Brisbane": { place: "Queensland", jurisdiction: "au" },
  "Australia/Lindeman": { place: "Queensland", jurisdiction: "au" },
  "Australia/Melbourne": { place: "Victoria", jurisdiction: "au" },
  "Australia/Sydney": { place: "New South Wales", jurisdiction: "au" },
  "Australia/Adelaide": { place: "South Australia", jurisdiction: "au" },
  "Australia/Perth": { place: "Western Australia", jurisdiction: "au" },
  "Australia/Hobart": { place: "Tasmania", jurisdiction: "au" },
  "Australia/Darwin": { place: "the Northern Territory", jurisdiction: "au" },
  "Pacific/Auckland": { place: "New Zealand", jurisdiction: "nz" },
  "Asia/Kolkata": { place: "India", jurisdiction: "in" },
  "Asia/Calcutta": { place: "India", jurisdiction: "in" },
  "Asia/Tokyo": { place: "Japan", jurisdiction: "jp" },
};

/** Map an IANA timezone to a place, or null when I can't tell. */
export function placeFromTimeZone(tz: string | undefined | null): DetectedPlace | null {
  if (!tz) return null;

  const rule = EXACT[tz];
  if (rule) return { place: rule.place, jurisdiction: byId(rule.jurisdiction), aside: rule.aside };

  // The US has dozens of sub-zones (Indiana, Kentucky, North Dakota...).
  if (/^America\/(Indiana|Kentucky)\//.test(tz))
    return { place: "the US (Eastern time)", jurisdiction: byId("us"), aside: EASTERN_ASIDE };
  if (/^America\/North_Dakota\//.test(tz)) return { place: "North Dakota", jurisdiction: byId("us") };

  return null;
}

export function detectPlace(): DetectedPlace | null {
  try {
    return placeFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return null;
  }
}

export type Title = "Engineer" | "Developer";

/** Only a clear "yes" earns the upgrade. */
export const titleFor = (j: Jurisdiction | null | undefined): Title => (j?.verdict === "yes" ? "Engineer" : "Developer");

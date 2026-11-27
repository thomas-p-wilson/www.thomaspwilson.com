import { describe, expect, it } from "vitest";
import { JURISDICTIONS, placeFromTimeZone, titleFor } from "./titleJurisdiction";

describe("placeFromTimeZone", () => {
  it("returns null for missing or unknown zones", () => {
    expect(placeFromTimeZone(undefined)).toBeNull();
    expect(placeFromTimeZone("")).toBeNull();
    expect(placeFromTimeZone("Africa/Nairobi")).toBeNull();
    expect(placeFromTimeZone("UTC")).toBeNull();
  });

  it("names Canadian provinces and keeps me a Developer", () => {
    const p = placeFromTimeZone("America/Vancouver");
    expect(p?.place).toBe("British Columbia");
    expect(p?.jurisdiction.id).toBe("ca");
    expect(titleFor(p?.jurisdiction)).toBe("Developer");
  });

  it("promotes me in most of the US, including sub-zones", () => {
    expect(titleFor(placeFromTimeZone("America/Chicago")?.jurisdiction)).toBe("Engineer");
    expect(placeFromTimeZone("America/Indiana/Indianapolis")?.jurisdiction.id).toBe("us");
    expect(placeFromTimeZone("America/North_Dakota/Center")?.place).toBe("North Dakota");
  });

  it("promotes me in Alberta but not British Columbia", () => {
    expect(titleFor(placeFromTimeZone("America/Edmonton")?.jurisdiction)).toBe("Engineer");
    const bc = placeFromTimeZone("America/Vancouver");
    expect(titleFor(bc?.jurisdiction)).toBe("Developer");
    expect(bc?.aside).toMatch(/2025/);
  });

  it("adds a Florida caveat on Eastern time", () => {
    const p = placeFromTimeZone("America/New_York");
    expect(titleFor(p?.jurisdiction)).toBe("Engineer");
    expect(p?.aside).toMatch(/Florida/);
  });

  it("keeps me a Developer in Germany", () => {
    expect(titleFor(placeFromTimeZone("Europe/Berlin")?.jurisdiction)).toBe("Developer");
  });
});

describe("titleFor", () => {
  it("defaults to Developer when unknown", () => {
    expect(titleFor(null)).toBe("Developer");
  });

  it("only upgrades on a clear yes", () => {
    for (const j of JURISDICTIONS) {
      expect(titleFor(j)).toBe(j.verdict === "yes" ? "Engineer" : "Developer");
    }
  });
});

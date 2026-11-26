import { describe, expect, it } from "vitest";
import { BASES, SYMBOL_ALPHABET, codonToSymbol, symbolToCodon, translate } from "./codonTable";

describe("codonToSymbol", () => {
  it("is deterministic for a given codon", () => {
    expect(codonToSymbol("ACG")).toBe(codonToSymbol("ACG"));
  });

  it("is silent to the third base of the codon (built-in wobble degeneracy)", () => {
    for (const b1 of BASES) {
      for (const b2 of BASES) {
        const symbols = new Set(BASES.map((b3) => codonToSymbol(`${b1}${b2}${b3}`)));
        expect(symbols.size).toBe(1);
      }
    }
  });

  it("produces every symbol in the alphabet from some codon", () => {
    const seen = new Set<string>();
    for (const b1 of BASES) {
      for (const b2 of BASES) {
        seen.add(codonToSymbol(`${b1}${b2}A`));
      }
    }
    expect(seen.size).toBe(SYMBOL_ALPHABET.length);
  });

  it("has real redundancy: multiple codons map to the same symbol", () => {
    const counts = new Map<string, number>();
    for (const b1 of BASES) {
      for (const b2 of BASES) {
        for (const b3 of BASES) {
          const symbol = codonToSymbol(`${b1}${b2}${b3}`);
          counts.set(symbol, (counts.get(symbol) ?? 0) + 1);
        }
      }
    }
    // 64 codons over 8 symbols -> 8 codons per symbol on average.
    for (const symbol of SYMBOL_ALPHABET) {
      expect(counts.get(symbol)).toBe(8);
    }
  });
});

describe("symbolToCodon", () => {
  it("round-trips: translating the chosen codon back yields the same symbol", () => {
    for (const symbol of SYMBOL_ALPHABET) {
      expect(codonToSymbol(symbolToCodon(symbol))).toBe(symbol);
    }
  });
});

describe("translate", () => {
  it("reads non-overlapping triplets left to right", () => {
    const genome = symbolToCodon("0") + symbolToCodon("5") + symbolToCodon("2");
    expect(translate(genome)).toBe("052");
  });

  it("ignores trailing bases that don't form a full codon", () => {
    const genome = symbolToCodon("3") + "AC"; // 2 leftover bases
    expect(translate(genome)).toBe("3");
  });

  it("returns an empty string for genomes shorter than one codon", () => {
    expect(translate("AC")).toBe("");
    expect(translate("")).toBe("");
  });
});

// The codon table is the source of *built-in* mutation robustness: it
// translates raw base triplets (codons) down to a smaller "symbol" alphabet
// that the gene motifs (engine/genes.ts) are written in. Because many codons
// map to the same symbol, most single-base point mutations are silent —
// exactly like real wobble-position degeneracy in the genetic code — and
// this is a property of the table itself, not of genome length, so it works
// even for very short genomes.
//
// This is a fixed design constant: the table never changes at runtime.
import type { Base, CodonSymbol, Genome } from "./types";

export const BASES: Base[] = ["A", "C", "G", "U"];

/** 8-symbol translated alphabet. Arbitrary but fixed; see codonToSymbol. */
export const SYMBOL_ALPHABET = "01234567";

const BASE_INDEX: Record<Base, number> = { A: 0, C: 1, G: 2, U: 3 };

function isBase(char: string): char is Base {
  return char === "A" || char === "C" || char === "G" || char === "U";
}

/**
 * Translates a single codon (3 bases) to one symbol.
 *
 * Degeneracy is built in on purpose: the symbol is derived only from the
 * first two bases (folded down from 16 pair-combinations to 8 symbols), so
 * the third base of every codon is completely silent — a deliberately
 * extreme version of real tRNA wobble redundancy. Combined with the pairing
 * fold, every symbol is reachable by 8 of the 64 possible codons.
 */
export function codonToSymbol(codon: string): CodonSymbol {
  const b1 = codon[0];
  const b2 = codon[1];
  const i1 = isBase(b1) ? BASE_INDEX[b1] : 0;
  const i2 = isBase(b2) ? BASE_INDEX[b2] : 0;
  const pairIndex = i1 * 4 + i2; // 0..15
  const symbol = Math.floor(pairIndex / 2); // 0..7
  return SYMBOL_ALPHABET[symbol];
}

/** Picks one representative codon that decodes to the given symbol. */
export function symbolToCodon(symbol: CodonSymbol): string {
  const index = SYMBOL_ALPHABET.indexOf(symbol);
  const pairIndex = Math.max(0, index) * 2;
  const i1 = Math.floor(pairIndex / 4);
  const i2 = pairIndex % 4;
  return `${BASES[i1]}${BASES[i2]}A`;
}

/**
 * Translates a full genome to the symbol alphabet by reading non-overlapping
 * triplets left to right. Any trailing 1-2 leftover bases (genome length not
 * a multiple of 3) are simply not part of a complete codon and are ignored —
 * a minor, deliberate simplification (see genome.ts for genome length notes).
 */
export function translate(genome: Genome): string {
  let symbols = "";
  for (let i = 0; i + 3 <= genome.length; i += 3) {
    symbols += codonToSymbol(genome.slice(i, i + 3));
  }
  return symbols;
}

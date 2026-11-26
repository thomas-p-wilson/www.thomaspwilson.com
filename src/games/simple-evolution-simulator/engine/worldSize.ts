// Grid dimensions are allocated as a fixed-size array at simulation creation
// (see simulation.ts's createSimulation) — one cell holds at most one
// organism, so width * height is a hard population cap. Changing it can't
// happen live; it means starting a fresh simulation, same as Reset.
export interface WorldSizePreset {
  label: string;
  width: number;
  height: number;
}

export const WORLD_SIZE_PRESETS: WorldSizePreset[] = [
  { label: "Small", width: 22, height: 14 },
  { label: "Medium", width: 34, height: 22 },
  { label: "Large", width: 48, height: 31 },
  { label: "Huge", width: 64, height: 41 },
];

export const DEFAULT_WORLD_SIZE_INDEX = 1;

export interface TargetPrecision {
  id: string;
  label: string;
  km: number;
}

// Ordered coarsest-to-finest so a <Select> lists them in a natural progression.
export const targetPrecisions: TargetPrecision[] = [
  { id: "1000km", label: "Nearest 1,000 km", km: 1_000 },
  { id: "100km", label: "Nearest 100 km", km: 100 },
  { id: "10km", label: "Nearest 10 km", km: 10 },
  { id: "1km", label: "Nearest 1 km", km: 1 },
  { id: "100m", label: "Nearest 100 m", km: 0.1 },
  { id: "10m", label: "Nearest 10 m", km: 0.01 },
  { id: "1m", label: "Nearest 1 m", km: 0.001 },
  { id: "1cm", label: "Nearest 1 cm", km: 0.00001 },
  { id: "1mm", label: "Nearest 1 mm", km: 0.000001 },
  { id: "1um", label: "Nearest 1 µm — about the size of a bacterium", km: 1e-9 },
  { id: "1nm", label: "Nearest 1 nm — about the width of a DNA strand", km: 1e-12 },
  { id: "atom", label: "Nearest atom's width (~0.1 nm)", km: 1e-13 },
];

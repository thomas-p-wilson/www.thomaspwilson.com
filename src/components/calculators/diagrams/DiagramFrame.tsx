import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Remounting on `diagramKey` change (rather than trying to interpolate every
// individual SVG coordinate) retriggers this fade/scale-in whenever the
// underlying measurements change — simple and robust rather than fragile.
export function DiagramFrame({ children, diagramKey, height = 220 }: { children: ReactNode; diagramKey: string; height?: number }) {
  return (
    <div className="flex justify-center bg-slate-50 rounded-xl py-4">
      <motion.svg
        key={diagramKey}
        viewBox={`0 0 320 ${height}`}
        width="100%"
        style={{ maxWidth: 360 }}
        initial={{ opacity: 0.4, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.svg>
    </div>
  );
}

export const diagramColors = {
  fill: "#dbeafe",
  stroke: "#3b82f6",
  accent: "#1d4ed8",
  dim: "#94a3b8",
  label: "#475569",
};

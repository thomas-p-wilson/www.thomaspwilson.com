import { describeShapeKey, parseShapeKey, type ShapeColor, type SubShape } from "../engine/shapeKey";

const FILL: Record<ShapeColor, string> = {
  uncolored: "#aaaaaa",
  red: "#ff666a",
  green: "#78ff66",
  blue: "#66a7ff",
  yellow: "#fcf52a",
  purple: "#dd66ff",
  cyan: "#00fcff",
  white: "#ffffff",
};

// Each sub-shape is drawn as if it sat in the top-right quadrant, with the
// shape's centre at (0, 0), then rotated into place.
function quadrantPath(shape: SubShape, r: number): string {
  switch (shape) {
    case "circle":
      return `M0 0 L0 ${-r} A${r} ${r} 0 0 1 ${r} 0 Z`;
    case "rect": {
      const s = r * 0.88;
      return `M0 0 L0 ${-s} L${s} ${-s} L${s} 0 Z`;
    }
    case "star":
      return `M0 0 L0 ${-r * 0.62} L${r} ${-r} L${r * 0.62} 0 Z`;
    case "windmill":
      return `M0 0 L0 ${-r * 0.62} L${r} ${-r} L${r} 0 Z`;
  }
}

interface ShapeIconProps {
  shapeKey: string;
  size?: number;
  className?: string;
  /** Position when nested inside another SVG. */
  x?: number;
  y?: number;
}

export default function ShapeIcon({ shapeKey, size = 48, className, x, y }: ShapeIconProps) {
  const layers = parseShapeKey(shapeKey);
  return (
    <svg
      viewBox="-50 -50 100 100"
      x={x}
      y={y}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${shapeKey}: ${describeShapeKey(shapeKey)}`}
    >
      <title>{shapeKey}</title>
      <circle r={48} fill="#00000010" />
      {layers.map((layer, layerIndex) => {
        const r = 42 * (1 - layerIndex * 0.24);
        return (
          <g key={layerIndex}>
            {layer.map((quadrant, quadrantIndex) =>
              quadrant ? (
                <path
                  key={quadrantIndex}
                  d={quadrantPath(quadrant.shape, r)}
                  transform={`rotate(${quadrantIndex * 90})`}
                  fill={FILL[quadrant.color]}
                  stroke="#555"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ) : null
            )}
          </g>
        );
      })}
    </svg>
  );
}

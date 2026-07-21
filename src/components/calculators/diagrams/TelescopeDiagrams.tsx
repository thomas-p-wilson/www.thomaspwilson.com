import { DiagramFrame, diagramColors as c } from "./DiagramFrame";

const isPositive = (n: number) => typeof n === "number" && !isNaN(n) && n > 0;

export interface MirrorElement {
  role: "primary" | "secondary";
  apertureDiameter: number; // cm
  focalLength: number; // cm — distance from this element to its own focus
  sagitta: number; // cm — dish depth
}

interface Point {
  x: number;
  y: number;
}

const quadraticPoint = (t: number, p0: Point, p1: Point, p2: Point): Point => {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
};

// Side-profile view of a reflecting telescope's optical train: incoming parallel rays hitting the
// primary and converging to a focus. Shaped as a list of mirror elements (rather than fixed
// primary-only props) so a Newtonian/Cassegrain secondary and its folded light path can be added
// later without changing this component's signature — today only "primary" is rendered.
export function MirrorProfileDiagram({ elements }: { elements: MirrorElement[] }) {
  const primary = elements.find((e) => e.role === "primary");
  if (!primary || !isPositive(primary.apertureDiameter) || !isPositive(primary.focalLength) || !isPositive(primary.sagitta)) {
    return null;
  }

  const cy = 110;
  const apertureX = 170;
  const minFocusX = 45; // leaves room for the focus/f labels without clipping the frame's left edge
  const maxHalfWidth = 85; // leaves room to fit the aperture within the frame's height

  // One scale factor drives aperture radius, focal length, and sagitta together, so the drawing
  // is genuinely proportional — not three independently-sized elements. It's derived from
  // whichever dimension is more constraining: a long, slim mirror is limited by frame width (the
  // focal length span), a short, wide one by frame height (the aperture radius).
  const apertureRadius = primary.apertureDiameter / 2;
  const scaleForWidth = (apertureX - minFocusX) / primary.focalLength;
  const scaleForHeight = maxHalfWidth / apertureRadius;
  const scale = Math.min(scaleForWidth, scaleForHeight);

  const halfWidth = apertureRadius * scale;
  const visualDepth = primary.sagitta * scale;
  const top = { x: apertureX, y: cy - halfWidth };
  const bottom = { x: apertureX, y: cy + halfWidth };
  const control = { x: apertureX + 2 * visualDepth, y: cy };
  const vertexX = apertureX + visualDepth;
  const focusX = apertureX - primary.focalLength * scale;

  // Light travels left-to-right onto the primary and reflects back left to a focus, matching how
  // these are conventionally drawn (optical axis horizontal) rather than the dish opening upward.
  const surfacePoints = [0.12, 0.5, 0.88].map((t) => quadraticPoint(t, top, control, bottom));

  return (
    <DiagramFrame diagramKey={`mirror-${primary.apertureDiameter}-${primary.focalLength}-${primary.sagitta}`} height={220}>
      {surfacePoints.map((p, i) => (
        <line key={`in-${i}`} x1={8} y1={p.y} x2={p.x} y2={p.y} stroke={c.dim} strokeWidth={1.5} strokeDasharray="4 3" />
      ))}
      {surfacePoints.map((p, i) => (
        <line key={`out-${i}`} x1={p.x} y1={p.y} x2={focusX} y2={cy} stroke={c.accent} strokeWidth={1.5} strokeDasharray="4 3" />
      ))}

      <path
        d={`M ${top.x} ${top.y} Q ${control.x} ${control.y} ${bottom.x} ${bottom.y} Z`}
        fill={c.fill} stroke={c.stroke} strokeWidth={2.5}
      />

      {/* The mid ray already draws the focal distance along the axis, so focus/f are labeled
          beside the point itself rather than with a second overlapping indicator line. */}
      <circle cx={focusX} cy={cy} r={3} fill={c.accent} />
      <text x={focusX} y={cy - 10} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>focus</text>
      <text x={focusX} y={cy + 18} textAnchor="middle" fontSize={11} fill={c.label}>f = {primary.focalLength}</text>

      {/* Sagitta indicator offset below the mirror instead of along the crowded central axis. */}
      <line x1={apertureX} y1={bottom.y + 14} x2={vertexX} y2={bottom.y + 14} stroke={c.accent} strokeWidth={1.5} strokeDasharray="3 2" />
      <line x1={apertureX} y1={bottom.y + 9} x2={apertureX} y2={bottom.y + 19} stroke={c.accent} strokeWidth={1} />
      <line x1={vertexX} y1={bottom.y + 9} x2={vertexX} y2={bottom.y + 19} stroke={c.accent} strokeWidth={1} />
      <text x={(apertureX + vertexX) / 2} y={bottom.y + 31} textAnchor="middle" fontSize={10} fill={c.accent} fontWeight={600}>
        h = {primary.sagitta.toFixed(2)}
      </text>

      <line x1={vertexX + 20} y1={top.y} x2={vertexX + 20} y2={bottom.y} stroke={c.dim} strokeWidth={1} />
      <line x1={vertexX + 15} y1={top.y} x2={vertexX + 25} y2={top.y} stroke={c.dim} strokeWidth={1} />
      <line x1={vertexX + 15} y1={bottom.y} x2={vertexX + 25} y2={bottom.y} stroke={c.dim} strokeWidth={1} />
      <text x={vertexX + 30} y={cy} fontSize={11} fill={c.label}>aperture = {primary.apertureDiameter}</text>
    </DiagramFrame>
  );
}

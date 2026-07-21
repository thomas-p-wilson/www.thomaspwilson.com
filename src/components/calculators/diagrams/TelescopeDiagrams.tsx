import { DiagramFrame, diagramColors as c } from "./DiagramFrame";

const isPositive = (n: number) => typeof n === "number" && !isNaN(n) && n > 0;

export type MirrorElement =
  | { role: "primary"; apertureDiameter: number; focalLength: number; sagitta: number }
  | { role: "secondary"; kind: "newtonian"; toFocusDistance: number; minorAxis: number }
  | {
      role: "secondary"; kind: "cassegrain"; diameter: number; effectiveFocalLength: number;
      distanceFromPrimary: number; backFocusDistance: number;
    };

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

// Where the ray from `from` toward `towards` crosses the vertical line x = atX.
const crossingAt = (from: Point, towards: Point, atX: number): Point => {
  const s = (atX - from.x) / (towards.x - from.x);
  return { x: atX, y: from.y + s * (towards.y - from.y) };
};

const HOLE_FILL = "#f8fafc"; // matches DiagramFrame's bg-slate-50, to "punch" a hole in the primary

// Side-profile view of a reflecting telescope's optical train. With no secondary, incoming
// parallel rays hit the primary and converge to its prime focus. With one configured, the rays
// are intercepted before they get there and redirected — 90° to a side-mounted focuser for a
// Newtonian flat diagonal, or back through a hole in the primary for a Cassegrain convex
// secondary. Aperture radius, focal length, sagitta, and (for Cassegrain) the secondary's real
// position/back-focus distance all share one derived scale factor, so the whole layout is
// genuinely proportional — only the secondary's own curvature/size are schematic, since this
// calculator doesn't model a radius of curvature for it.
export function MirrorProfileDiagram({ elements }: { elements: MirrorElement[] }) {
  const primary = elements.find((e): e is Extract<MirrorElement, { role: "primary" }> => e.role === "primary");
  if (!primary || !isPositive(primary.apertureDiameter) || !isPositive(primary.focalLength) || !isPositive(primary.sagitta)) {
    return null;
  }

  const secondaryRaw = elements.find((e): e is Extract<MirrorElement, { role: "secondary" }> => e.role === "secondary");
  const newtonianSecondary = secondaryRaw?.kind === "newtonian"
    && isPositive(secondaryRaw.toFocusDistance) && secondaryRaw.toFocusDistance < primary.focalLength && isPositive(secondaryRaw.minorAxis)
    ? secondaryRaw
    : undefined;
  const cassegrainSecondary = secondaryRaw?.kind === "cassegrain"
    && isPositive(secondaryRaw.diameter) && isPositive(secondaryRaw.effectiveFocalLength)
    && isPositive(secondaryRaw.distanceFromPrimary) && secondaryRaw.distanceFromPrimary < primary.focalLength
    && isPositive(secondaryRaw.backFocusDistance)
    ? secondaryRaw
    : undefined;
  const hasSecondary = !!(newtonianSecondary || cassegrainSecondary);

  // Newtonian needs headroom above the axis for the folded-upward path to the focuser;
  // Cassegrain needs the aperture dimension moved below so the back focus has room on the right.
  const cy = newtonianSecondary ? 160 : cassegrainSecondary ? 100 : 110;
  const frameHeight = hasSecondary ? 260 : 220;
  const apertureX = 170;
  const minFocusX = 45; // leaves room for the focus/f labels without clipping the frame's left edge
  const maxHalfWidth = hasSecondary ? 65 : 85; // leaves room to fit the aperture within the frame's height

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

  const surfacePoints = [0.12, 0.5, 0.88].map((t) => quadraticPoint(t, top, control, bottom));

  const secondaryX = newtonianSecondary
    ? apertureX - (primary.focalLength - newtonianSecondary.toFocusDistance) * scale
    : cassegrainSecondary
      ? apertureX - cassegrainSecondary.distanceFromPrimary * scale
      : null;
  // Where the secondary intercepts each ray, following the straight line it was already
  // travelling toward the (now unreachable, since the secondary is in the way) prime focus.
  const interceptPoints = secondaryX != null ? surfacePoints.map((p) => crossingAt(p, { x: focusX, y: cy }, secondaryX)) : null;

  return (
    <DiagramFrame
      diagramKey={`mirror-${primary.apertureDiameter}-${primary.focalLength}-${primary.sagitta}-${JSON.stringify(newtonianSecondary ?? cassegrainSecondary ?? null)}`}
      height={frameHeight}
    >
      {surfacePoints.map((p, i) => (
        <line key={`in-${i}`} x1={8} y1={p.y} x2={p.x} y2={p.y} stroke={c.dim} strokeWidth={1.5} strokeDasharray="4 3" />
      ))}
      {surfacePoints.map((p, i) => (
        <line
          key={`out-${i}`}
          x1={p.x} y1={p.y}
          x2={interceptPoints ? interceptPoints[i].x : focusX}
          y2={interceptPoints ? interceptPoints[i].y : cy}
          stroke={c.accent} strokeWidth={1.5} strokeDasharray="4 3"
        />
      ))}

      <path
        d={`M ${top.x} ${top.y} Q ${control.x} ${control.y} ${bottom.x} ${bottom.y} Z`}
        fill={c.fill} stroke={c.stroke} strokeWidth={2.5}
      />
      {cassegrainSecondary && <circle cx={apertureX + visualDepth * 0.5} cy={cy} r={4} fill={HOLE_FILL} />}

      {!hasSecondary && (
        <>
          {/* The mid ray already draws the focal distance along the axis, so focus/f are labeled
              beside the point itself rather than with a second overlapping indicator line. */}
          <circle cx={focusX} cy={cy} r={3} fill={c.accent} />
          <text x={focusX} y={cy - 10} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>focus</text>
          <text x={focusX} y={cy + 18} textAnchor="middle" fontSize={11} fill={c.label}>f = {primary.focalLength}</text>
        </>
      )}

      {newtonianSecondary && interceptPoints && secondaryX != null && (() => {
        const foldedFocus = { x: secondaryX, y: cy - newtonianSecondary.toFocusDistance * scale };
        const halfSpan = Math.max(6, (newtonianSecondary.minorAxis / 2) * scale);
        return (
          <>
            {interceptPoints.map((p, i) => (
              <line key={`fold-${i}`} x1={p.x} y1={p.y} x2={foldedFocus.x} y2={foldedFocus.y} stroke={c.accent} strokeWidth={1.5} strokeDasharray="4 3" />
            ))}
            <line x1={secondaryX - halfSpan} y1={cy - halfSpan} x2={secondaryX + halfSpan} y2={cy + halfSpan} stroke={c.stroke} strokeWidth={3} />
            <circle cx={foldedFocus.x} cy={foldedFocus.y} r={3} fill={c.accent} />
            <text x={foldedFocus.x} y={foldedFocus.y - 8} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>focus</text>
            <text x={secondaryX} y={cy + halfSpan + 16} textAnchor="middle" fontSize={10} fill={c.label}>secondary</text>
          </>
        );
      })()}

      {cassegrainSecondary && interceptPoints && secondaryX != null && (() => {
        const backFocus = { x: apertureX + cassegrainSecondary.backFocusDistance * scale, y: cy };
        const halfSpan = Math.max(6, (cassegrainSecondary.diameter / 2) * scale);
        const convexControl = { x: secondaryX - 8, y: cy };
        return (
          <>
            {interceptPoints.map((p, i) => (
              <line key={`fold-${i}`} x1={p.x} y1={p.y} x2={backFocus.x} y2={backFocus.y} stroke={c.accent} strokeWidth={1.5} strokeDasharray="4 3" />
            ))}
            <path
              d={`M ${secondaryX} ${cy - halfSpan} Q ${convexControl.x} ${convexControl.y} ${secondaryX} ${cy + halfSpan}`}
              fill="none" stroke={c.stroke} strokeWidth={2.5}
            />
            <circle cx={backFocus.x} cy={backFocus.y} r={3} fill={c.accent} />
            <text x={backFocus.x} y={backFocus.y - 10} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>focus</text>
            <text x={backFocus.x} y={backFocus.y + 18} textAnchor="middle" fontSize={10} fill={c.label}>
              eff. f = {cassegrainSecondary.effectiveFocalLength}
            </text>
            <text x={secondaryX} y={cy + halfSpan + 16} textAnchor="middle" fontSize={10} fill={c.label}>secondary</text>
          </>
        );
      })()}

      {/* Sagitta indicator offset below the mirror instead of along the crowded central axis. */}
      <line x1={apertureX} y1={bottom.y + 14} x2={vertexX} y2={bottom.y + 14} stroke={c.accent} strokeWidth={1.5} strokeDasharray="3 2" />
      <line x1={apertureX} y1={bottom.y + 9} x2={apertureX} y2={bottom.y + 19} stroke={c.accent} strokeWidth={1} />
      <line x1={vertexX} y1={bottom.y + 9} x2={vertexX} y2={bottom.y + 19} stroke={c.accent} strokeWidth={1} />
      <text x={(apertureX + vertexX) / 2} y={bottom.y + 31} textAnchor="middle" fontSize={10} fill={c.accent} fontWeight={600}>
        h = {primary.sagitta.toFixed(2)}
      </text>

      {cassegrainSecondary ? (
        <>
          <line x1={apertureX} y1={bottom.y + 45} x2={vertexX} y2={bottom.y + 45} stroke={c.dim} strokeWidth={1} />
          <line x1={apertureX} y1={bottom.y + 40} x2={apertureX} y2={bottom.y + 50} stroke={c.dim} strokeWidth={1} />
          <line x1={vertexX} y1={bottom.y + 40} x2={vertexX} y2={bottom.y + 50} stroke={c.dim} strokeWidth={1} />
          <text x={(apertureX + vertexX) / 2} y={bottom.y + 62} textAnchor="middle" fontSize={11} fill={c.label}>
            aperture = {primary.apertureDiameter}
          </text>
        </>
      ) : (
        <>
          <line x1={vertexX + 20} y1={top.y} x2={vertexX + 20} y2={bottom.y} stroke={c.dim} strokeWidth={1} />
          <line x1={vertexX + 15} y1={top.y} x2={vertexX + 25} y2={top.y} stroke={c.dim} strokeWidth={1} />
          <line x1={vertexX + 15} y1={bottom.y} x2={vertexX + 25} y2={bottom.y} stroke={c.dim} strokeWidth={1} />
          <text x={vertexX + 30} y={cy} fontSize={11} fill={c.label}>aperture = {primary.apertureDiameter}</text>
        </>
      )}
    </DiagramFrame>
  );
}

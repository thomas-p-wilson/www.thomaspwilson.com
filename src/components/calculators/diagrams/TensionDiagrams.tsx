import { DiagramFrame, diagramColors as c } from "./DiagramFrame";

const isPositive = (n: number) => typeof n === "number" && !Number.isNaN(n) && n > 0;

export type TensionScenario =
  | { kind: "vertical" }
  | { kind: "horizontal-single"; span: number; sagDepth: number; position: number; angle1: number; angle2: number }
  | { kind: "horizontal-double"; angle1: number; angle2: number };

function LoadSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <text x={x} y={y + 23} textAnchor="middle" fontSize={11} fill={c.label}>W</text>
    </g>
  );
}

function Anchor({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3} fill={c.dim} />;
}

// Schematic side view of a weight hanging from one, two, or a single sagging line, matching
// whichever scenario the calculator is currently solving. The sagging-single-line case draws its
// two straight segments (not a smooth catenary — the calculator itself treats it the same way)
// proportionally from the real span/sag/position values; the two-line case has no shared span to
// anchor to, so it's laid out schematically from the angles alone, same spirit as Telescope's
// secondary mirror (whose own curvature/size is schematic even though its position is exact).
export function TensionDiagram({ scenario }: { scenario: TensionScenario }) {
  if (scenario.kind === "vertical") {
    const cx = 160, ceilingY = 40, loadY = 150;
    return (
      <DiagramFrame diagramKey="tension-vertical" height={200}>
        <line x1={90} y1={ceilingY} x2={230} y2={ceilingY} stroke={c.stroke} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={100 + i * 32} y1={ceilingY} x2={90 + i * 32} y2={ceilingY + 10} stroke={c.dim} strokeWidth={1.5} />
        ))}
        <line x1={cx} y1={ceilingY} x2={cx} y2={loadY} stroke={c.stroke} strokeWidth={2.5} />
        <text x={cx + 10} y={(ceilingY + loadY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>T1</text>
        <LoadSymbol x={cx} y={loadY} />
      </DiagramFrame>
    );
  }

  if (scenario.kind === "horizontal-double") {
    const { angle1, angle2 } = scenario;
    if (!isPositive(angle1) || !isPositive(angle2) || angle1 >= 180 || angle2 >= 180) return null;
    const loadX = 160, loadY = 165, armLength = 130;
    const rad1 = (angle1 * Math.PI) / 180;
    const rad2 = (angle2 * Math.PI) / 180;
    const anchor1 = { x: loadX - armLength * Math.cos(rad1), y: loadY - armLength * Math.sin(rad1) };
    const anchor2 = { x: loadX + armLength * Math.cos(rad2), y: loadY - armLength * Math.sin(rad2) };
    return (
      <DiagramFrame diagramKey={`tension-double-${angle1}-${angle2}`} height={220}>
        <line x1={anchor1.x} y1={anchor1.y} x2={loadX} y2={loadY} stroke={c.stroke} strokeWidth={2.5} />
        <line x1={anchor2.x} y1={anchor2.y} x2={loadX} y2={loadY} stroke={c.stroke} strokeWidth={2.5} />
        <line x1={anchor1.x} y1={anchor1.y} x2={anchor1.x + 36} y2={anchor1.y} stroke={c.dim} strokeWidth={1} strokeDasharray="3 2" />
        <line x1={anchor2.x} y1={anchor2.y} x2={anchor2.x - 36} y2={anchor2.y} stroke={c.dim} strokeWidth={1} strokeDasharray="3 2" />
        <text x={anchor1.x + 12} y={anchor1.y - 6} fontSize={10} fill={c.label}>{angle1.toFixed(0)}°</text>
        <text x={anchor2.x - 12} y={anchor2.y - 6} fontSize={10} fill={c.label} textAnchor="end">{angle2.toFixed(0)}°</text>
        <Anchor x={anchor1.x} y={anchor1.y} />
        <Anchor x={anchor2.x} y={anchor2.y} />
        <text x={(anchor1.x + loadX) / 2 - 12} y={(anchor1.y + loadY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>T1</text>
        <text x={(anchor2.x + loadX) / 2 + 12} y={(anchor2.y + loadY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>T2</text>
        <LoadSymbol x={loadX} y={loadY} />
      </DiagramFrame>
    );
  }

  const { span, sagDepth, position } = scenario;
  if (!isPositive(span) || !isPositive(sagDepth) || Number.isNaN(position) || position <= 0 || position >= span) return null;
  const left = 50, right = 270, anchorY = 40;
  const scaleX = (right - left) / span;
  const loadX = left + position * scaleX;
  // The sag is usually a small fraction of the span (a taut line barely dips), so it's exaggerated
  // to a visible range rather than drawn to true scale, which would render as nearly flat.
  const loadY = anchorY + Math.min(Math.max((sagDepth / span) * 400, 30), 110);

  return (
    <DiagramFrame diagramKey={`tension-single-${span}-${sagDepth}-${position}`} height={200}>
      <line x1={left} y1={anchorY} x2={right} y2={anchorY} stroke={c.dim} strokeWidth={1.5} strokeDasharray="4 3" />
      <Anchor x={left} y={anchorY} />
      <Anchor x={right} y={anchorY} />
      <line x1={left} y1={anchorY} x2={loadX} y2={loadY} stroke={c.stroke} strokeWidth={2.5} />
      <line x1={right} y1={anchorY} x2={loadX} y2={loadY} stroke={c.stroke} strokeWidth={2.5} />
      <text x={(left + loadX) / 2 - 14} y={(anchorY + loadY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>T1</text>
      <text x={(right + loadX) / 2 + 6} y={(anchorY + loadY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>T2</text>
      <line x1={loadX} y1={anchorY} x2={loadX} y2={loadY} stroke={c.dim} strokeWidth={1} strokeDasharray="2 2" />
      <text x={loadX + 8} y={(anchorY + loadY) / 2} fontSize={10} fill={c.dim}>sag</text>
      <LoadSymbol x={loadX} y={loadY} />
      <text x={(left + right) / 2} y={anchorY - 10} textAnchor="middle" fontSize={10} fill={c.label}>span = {span}</text>
    </DiagramFrame>
  );
}

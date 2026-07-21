import { DiagramFrame, diagramColors as c } from "./DiagramFrame";

const isPositive = (n: number) => typeof n === "number" && !isNaN(n) && n > 0;

export function CircleDiagram({ radius }: { radius: number }) {
  if (!isPositive(radius)) return null;
  const cx = 160, cy = 110, maxR = 80;
  const r = maxR;
  return (
    <DiagramFrame diagramKey={`circle-${radius}`}>
      <circle cx={cx} cy={cy} r={r} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={c.accent} strokeWidth={2} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={2.5} fill={c.accent} />
      <text x={cx + r / 2} y={cy - 8} textAnchor="middle" fontSize={13} fill={c.accent} fontWeight={600}>r = {radius}</text>
      <line x1={cx - r} y1={cy + r + 22} x2={cx + r} y2={cy + r + 22} stroke={c.dim} strokeWidth={1} />
      <line x1={cx - r} y1={cy + r + 17} x2={cx - r} y2={cy + r + 27} stroke={c.dim} strokeWidth={1} />
      <line x1={cx + r} y1={cy + r + 17} x2={cx + r} y2={cy + r + 27} stroke={c.dim} strokeWidth={1} />
      <text x={cx} y={cy + r + 40} textAnchor="middle" fontSize={11} fill={c.label}>diameter</text>
    </DiagramFrame>
  );
}

export function CircularSegmentDiagram({ radius, chord }: { radius: number; chord: number }) {
  if (!isPositive(radius) || !isPositive(chord) || chord > 2 * radius) return null;
  const cx = 160, cy = 100, maxR = 75;
  const scale = maxR / radius;
  const R = radius * scale;
  const halfChord = (chord / 2) * scale;
  const offset = Math.sqrt(Math.max(R * R - halfChord * halfChord, 0));
  const chordY = cy + offset;
  const left = { x: cx - halfChord, y: chordY };
  const right = { x: cx + halfChord, y: chordY };

  return (
    <DiagramFrame diagramKey={`segment-${radius}-${chord}`} height={230}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={c.dim} strokeWidth={1.5} strokeDasharray="3 3" />
      <path d={`M ${left.x} ${left.y} A ${R} ${R} 0 0 1 ${right.x} ${right.y} Z`} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke={c.accent} strokeWidth={2} />
      <text x={cx} y={chordY + 18} textAnchor="middle" fontSize={12} fill={c.accent} fontWeight={600}>chord = {chord}</text>
      <line x1={cx} y1={chordY} x2={cx} y2={cy - R} stroke={c.accent} strokeWidth={2} strokeDasharray="4 3" />
      <text x={cx + 8} y={(chordY + (cy - R)) / 2} fontSize={12} fill={c.accent} fontWeight={600}>sagitta</text>
      <line x1={cx} y1={cy} x2={cx} y2={chordY} stroke={c.dim} strokeWidth={1} strokeDasharray="2 2" />
      <circle cx={cx} cy={cy} r={2} fill={c.dim} />
      <text x={cx - 30} y={cy - 4} fontSize={10} fill={c.label}>r = {radius}</text>
    </DiagramFrame>
  );
}

export function SphereDiagram({ radius }: { radius: number }) {
  if (!isPositive(radius)) return null;
  const cx = 160, cy = 110, maxR = 80;
  return (
    <DiagramFrame diagramKey={`sphere-${radius}`}>
      <defs>
        <radialGradient id="sphereShade" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor={c.fill} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={maxR} fill="url(#sphereShade)" stroke={c.stroke} strokeWidth={2} />
      <ellipse cx={cx} cy={cy} rx={maxR} ry={maxR * 0.28} fill="none" stroke={c.dim} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={cx} y1={cy} x2={cx + maxR} y2={cy} stroke={c.accent} strokeWidth={2} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={2.5} fill={c.accent} />
      <text x={cx + maxR / 2} y={cy - 8} textAnchor="middle" fontSize={13} fill={c.accent} fontWeight={600}>r = {radius}</text>
    </DiagramFrame>
  );
}

export function SphericalCapDiagram({ radius, sagitta }: { radius: number; sagitta: number }) {
  if (!isPositive(radius) || !isPositive(sagitta) || sagitta > 2 * radius) return null;
  const cx = 160, cy = 130, maxR = 80;
  const scale = maxR / radius;
  const R = radius * scale;
  const h = sagitta * scale;
  const capBaseY = cy - R + h;
  const halfChordAtBase = Math.sqrt(Math.max(R * R - (R - h) * (R - h), 0));

  return (
    <DiagramFrame diagramKey={`cap-${radius}-${sagitta}`} height={240}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={c.dim} strokeWidth={1.5} strokeDasharray="3 3" />
      <path
        d={`M ${cx - halfChordAtBase} ${capBaseY} A ${R} ${R} 0 0 1 ${cx + halfChordAtBase} ${capBaseY} Z`}
        fill={c.fill} stroke={c.stroke} strokeWidth={2}
      />
      <line x1={cx - halfChordAtBase} y1={capBaseY} x2={cx + halfChordAtBase} y2={capBaseY} stroke={c.accent} strokeWidth={2} />
      <text x={cx} y={capBaseY + 16} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>base chord</text>
      <line x1={cx} y1={cy - R} x2={cx} y2={capBaseY} stroke={c.accent} strokeWidth={2} strokeDasharray="4 3" />
      <text x={cx + 8} y={(cy - R + capBaseY) / 2} fontSize={12} fill={c.accent} fontWeight={600}>h = {sagitta}</text>
      <circle cx={cx} cy={cy} r={2} fill={c.dim} />
      <text x={cx - 34} y={cy - 4} fontSize={10} fill={c.label}>R = {radius}</text>
    </DiagramFrame>
  );
}

export function BoxDiagram({ length, width, depth }: { length: number; width: number; depth: number }) {
  if (!isPositive(length) || !isPositive(width) || !isPositive(depth)) return null;
  const maxDim = Math.max(length, width, depth);
  const scale = 110 / maxDim;
  const L = length * scale, W = width * scale, D = depth * scale;
  const ox0 = 90, oy0 = 160;
  const off = { x: W * 0.5, y: -W * 0.32 };

  const frontBL = { x: ox0, y: oy0 };
  const frontBR = { x: ox0 + L, y: oy0 };
  const frontTL = { x: ox0, y: oy0 - D };
  const frontTR = { x: ox0 + L, y: oy0 - D };
  const backTL = { x: frontTL.x + off.x, y: frontTL.y + off.y };
  const backTR = { x: frontTR.x + off.x, y: frontTR.y + off.y };
  const backBR = { x: frontBR.x + off.x, y: frontBR.y + off.y };

  const poly = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <DiagramFrame diagramKey={`box-${length}-${width}-${depth}`}>
      {/* hidden back edges */}
      <line x1={frontBL.x} y1={frontBL.y} x2={frontBL.x + off.x} y2={frontBL.y + off.y} stroke={c.dim} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={frontBL.x + off.x} y1={frontBL.y + off.y} x2={backTL.x} y2={backTL.y} stroke={c.dim} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={frontBL.x + off.x} y1={frontBL.y + off.y} x2={backBR.x} y2={backBR.y} stroke={c.dim} strokeWidth={1} strokeDasharray="3 3" />
      {/* top face */}
      <polygon points={poly([frontTL, frontTR, backTR, backTL])} fill={c.fill} stroke={c.stroke} strokeWidth={1.5} opacity={0.9} />
      {/* right face */}
      <polygon points={poly([frontTR, backTR, backBR, frontBR])} fill={c.stroke} fillOpacity={0.35} stroke={c.stroke} strokeWidth={1.5} />
      {/* front face */}
      <polygon points={poly([frontTL, frontTR, frontBR, frontBL])} fill={c.fill} stroke={c.stroke} strokeWidth={2} />

      <text x={(frontBL.x + frontBR.x) / 2} y={oy0 + 18} textAnchor="middle" fontSize={11} fill={c.accent} fontWeight={600}>length = {length}</text>
      <text x={frontTL.x - 12} y={(frontTL.y + frontBL.y) / 2} textAnchor="end" fontSize={11} fill={c.accent} fontWeight={600}>depth = {depth}</text>
      <text x={(frontTR.x + backTR.x) / 2 + 6} y={(frontTR.y + backTR.y) / 2 - 4} fontSize={11} fill={c.accent} fontWeight={600}>width = {width}</text>
    </DiagramFrame>
  );
}

export function CylinderDiagram({ radius, height }: { radius: number; height: number }) {
  if (!isPositive(radius) || !isPositive(height)) return null;
  const maxDim = Math.max(radius * 2, height);
  const scale = 130 / maxDim;
  const r = radius * scale, h = height * scale;
  const ry = Math.min(r * 0.35, 24);
  const cx = 160, topY = 60;
  const bottomY = topY + h;

  return (
    <DiagramFrame diagramKey={`cylinder-${radius}-${height}`} height={240}>
      <path d={`M ${cx - r} ${bottomY} A ${r} ${ry} 0 0 0 ${cx + r} ${bottomY} L ${cx + r} ${topY} A ${r} ${ry} 0 0 1 ${cx - r} ${topY} Z`}
        fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      <ellipse cx={cx} cy={topY} rx={r} ry={ry} fill="#eff6ff" stroke={c.stroke} strokeWidth={2} />

      <line x1={cx} y1={topY} x2={cx + r} y2={topY} stroke={c.accent} strokeWidth={2} strokeDasharray="4 3" />
      <text x={cx + r / 2} y={topY - 8} textAnchor="middle" fontSize={12} fill={c.accent} fontWeight={600}>r = {radius}</text>

      <line x1={cx + r + 24} y1={topY} x2={cx + r + 24} y2={bottomY} stroke={c.dim} strokeWidth={1} />
      <line x1={cx + r + 19} y1={topY} x2={cx + r + 29} y2={topY} stroke={c.dim} strokeWidth={1} />
      <line x1={cx + r + 19} y1={bottomY} x2={cx + r + 29} y2={bottomY} stroke={c.dim} strokeWidth={1} />
      <text x={cx + r + 34} y={(topY + bottomY) / 2} fontSize={11} fill={c.label}>h = {height}</text>
    </DiagramFrame>
  );
}

import React from "react";

export type LearningNode = {
  id: string;
  label: string;
  prereqs: string[]; // ids of prerequisite nodes
  mastery: number; // 0..1
};

interface LearningPathProps {
  nodes: LearningNode[];
  onSelect?: (id: string) => void;
  onClose?: () => void;
}

// Simple layout: compute depth (longest path from roots) and place nodes by depth columns
function computeDepths(nodes: LearningNode[]) {
  const map = new Map<string, LearningNode>();
  nodes.forEach(n => map.set(n.id, n));

  const depths = new Map<string, number>();
  const visited = new Map<string, number>();

  function dfs(id: string): number {
    if (depths.has(id)) return depths.get(id)!;
    if (!map.has(id)) return 0;
    if (visited.get(id) === 1) return 0; // cyclic guard
    visited.set(id, 1);
    const node = map.get(id)!;
    let maxChild = 0;
    for (const p of node.prereqs || []) {
      const d = dfs(p) + 1;
      if (d > maxChild) maxChild = d;
    }
    visited.set(id, 2);
    depths.set(id, maxChild);
    return maxChild;
  }

  nodes.forEach(n => dfs(n.id));
  return depths; // map id->depth
}

const colorForMastery = (v: number) => {
  // green(0.75-1) yellow(0.4-0.75) red(0-0.4)
  if (v >= 0.75) return "#16a34a"; // green
  if (v >= 0.4) return "#d97706"; // amber
  return "#dc2626"; // red
};

const LearningPath = ({ nodes, onSelect, onClose }: LearningPathProps) => {
  const depths = computeDepths(nodes);
  const groups = new Map<number, LearningNode[]>();
  let maxDepth = 0;
  nodes.forEach(n => {
    const d = depths.get(n.id) ?? 0;
    maxDepth = Math.max(maxDepth, d);
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d)!.push(n);
  });

  const columnCount = maxDepth + 1;
  const width = Math.min(900, 220 * columnCount + 80);
  const height = Math.max(300, 120 * Math.max(...Array.from(groups.values()).map(g => g.length)));

  // assign positions per column
  const positions = new Map<string, { x: number; y: number }>();
  for (let col = 0; col <= maxDepth; col++) {
    const colNodes = groups.get(col) || [];
    const gapY = height / (colNodes.length + 1);
    const x = 60 + col * 200;
    for (let i = 0; i < colNodes.length; i++) {
      const y = gapY * (i + 1);
      positions.set(colNodes[i].id, { x, y });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" style={{ width: width + 40 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Learning Path</h3>
            <div className="text-sm text-muted-foreground">Concept dependency tree & mastery</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: colorForMastery(0.9) }} />
              <span>Advanced</span>
              <span className="inline-block w-3 h-3 rounded-full ml-3" style={{ background: colorForMastery(0.6) }} />
              <span>Intermediate</span>
              <span className="inline-block w-3 h-3 rounded-full ml-3" style={{ background: colorForMastery(0.2) }} />
              <span>Beginner</span>
            </div>
            <button className="ml-4 text-sm text-muted-foreground hover:text-foreground" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="p-6">
          <svg width={width} height={height} className="block mx-auto">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#000" opacity="0.25" />
              </marker>
            </defs>

            {/* edges */}
            {nodes.flatMap(n =>
              n.prereqs.map(pr => {
                const from = positions.get(pr);
                const to = positions.get(n.id);
                if (!from || !to) return null;
                const sx = from.x + 30;
                const sy = from.y;
                const tx = to.x - 30;
                const ty = to.y;
                const midX = (sx + tx) / 2;
                return (
                  <g key={`${pr}-${n.id}`}>
                    <path d={`M ${sx} ${sy} C ${midX} ${sy} ${midX} ${ty} ${tx} ${ty}`} stroke="#0f172a" strokeOpacity={0.12} strokeWidth={2} fill="none" markerEnd="url(#arrow)" />
                  </g>
                );
              })
            )}

            {/* nodes */}
            {nodes.map(n => {
              const pos = positions.get(n.id) || { x: 60, y: 60 };
              const color = colorForMastery(n.mastery ?? 0);
              const radius = 28 + Math.round((n.mastery ?? 0) * 12);
              return (
                <g key={n.id} transform={`translate(${pos.x}, ${pos.y})`} style={{ cursor: 'pointer' }} onClick={() => onSelect && onSelect(n.id)}>
                  <circle cx={0} cy={0} r={radius} fill={color} opacity={0.12} stroke={color} strokeWidth={2} />
                  <circle cx={0} cy={0} r={Math.max(8, radius - 8)} fill={color} />
                  <text x={0} y={radius + 14} textAnchor="middle" fontSize={12} fill="#0f172a" className="font-medium">
                    {n.label.length > 20 ? n.label.slice(0, 20) + '���' : n.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            {nodes.map(n => (
              <button key={n.id} className="text-left p-2 rounded-md hover:bg-muted/50 bg-background/50" onClick={() => { onSelect && onSelect(n.id); }}>
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{Math.round((n.mastery ?? 0) * 100)}%</div>
                </div>
                <div className="w-full h-2 bg-black/10 rounded mt-2 overflow-hidden">
                  <div style={{ width: `${Math.round((n.mastery ?? 0) * 100)}%` }} className="h-2" style={{ background: colorForMastery(n.mastery ?? 0) }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;

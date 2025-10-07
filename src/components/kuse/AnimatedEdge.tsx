import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from 'reactflow';

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{...style, strokeWidth: 2, stroke: 'url(#edge-gradient)' }} id={id} />
      <defs>
        <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--glow-cyan))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--glow-violet))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </>
  );
}

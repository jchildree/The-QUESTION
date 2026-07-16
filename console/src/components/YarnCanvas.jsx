import { useMemo } from "react";

function computePath(fromPos, toPos) {
  const x1 = fromPos.x + 140;
  const y1 = fromPos.y + 25;
  const x2 = toPos.x + 140;
  const y2 = toPos.y + 25;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const sag = Math.min(100, Math.abs(x1 - x2) * 0.15 + 40);
  return {
    path: `M ${x1} ${y1} Q ${midX} ${midY + sag} ${x2} ${y2}`,
    midX,
    midY: midY + sag * 0.6,
  };
}

export default function YarnCanvas({
  edges,
  positions,
  onRemoveEdge,
  boardWidth = 2200,
  boardHeight = 1200,
}) {
  const paths = useMemo(() => {
    return edges
      .map((edge) => {
        const fromPos = positions[edge.from];
        const toPos = positions[edge.to];
        if (!fromPos || !toPos) return null;
        const { path, midX, midY } = computePath(fromPos, toPos);
        return { ...edge, path, midX, midY };
      })
      .filter(Boolean);
  }, [edges, positions]);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: boardWidth,
        height: boardHeight,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <defs>
        <filter id="yarn-shadow">
          <feDropShadow
            dx="1"
            dy="4"
            stdDeviation="3"
            floodColor="#000"
            floodOpacity="0.8"
          />
        </filter>
      </defs>
      {paths.map((yarn) => (
        <g key={yarn.id} style={{ pointerEvents: "auto" }}>
          <path
            d={yarn.path}
            stroke="#000"
            strokeWidth="5"
            fill="none"
            opacity="0.3"
            transform="translate(1,4)"
          />
          <path
            d={yarn.path}
            stroke="#ef4444"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            filter="url(#yarn-shadow)"
            opacity="0.85"
          />
          <foreignObject
            x={yarn.midX - 55}
            y={yarn.midY - 10}
            width="110"
            height="20"
            overflow="visible"
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span
                style={{
                  background: "#020617",
                  border: "1px solid #f43f5e",
                  color: "#f43f5e",
                  fontFamily: "monospace",
                  fontSize: 8,
                  fontWeight: "bold",
                  padding: "2px 6px",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {yarn.label}
                {yarn.manual && onRemoveEdge && (
                  <button
                    onClick={() => onRemoveEdge(yarn.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      fontSize: 10,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    x
                  </button>
                )}
              </span>
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}
